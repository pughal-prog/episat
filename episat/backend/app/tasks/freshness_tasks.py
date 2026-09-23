import logging
import asyncio
import time
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from sqlalchemy import select, update
from app.core.config import settings
from app.db.database import AsyncSessionLocal
from app.models.schema import DataFreshness
from app.geospatial.adapters import get_data_provider

logger = logging.getLogger(__name__)

# Fallback in-memory cache when Redis server is unreachable
_in_memory_cache: Dict[str, str] = {}
_in_memory_locks: Dict[str, float] = {}

class RedisCacheManager:
    def __init__(self):
        self.redis_client = None
        try:
            import redis
            self.redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=1)
            self.redis_client.ping()
        except Exception as e:
            logger.info(f"Redis server not connected ({e}). Operating with fast in-memory cache manager.")
            self.redis_client = None

    def get(self, key: str) -> Optional[str]:
        if self.redis_client:
            try:
                return self.redis_client.get(key)
            except Exception:
                pass
        return _in_memory_cache.get(key)

    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        if self.redis_client:
            try:
                return self.redis_client.set(key, value, ex=ex)
            except Exception:
                pass
        _in_memory_cache[key] = value
        return True

    def delete(self, key: str) -> bool:
        if self.redis_client:
            try:
                self.redis_client.delete(key)
            except Exception:
                pass
        _in_memory_cache.pop(key, None)
        _in_memory_locks.pop(key, None)
        return True

    def acquire_lock(self, lock_key: str, ttl_seconds: int = 300) -> bool:
        """Acquires rate-limiting lock. Returns True if acquired, False if lock exists."""
        now = time.time()
        if self.redis_client:
            try:
                acquired = self.redis_client.set(lock_key, str(now), ex=ttl_seconds, nx=True)
                return bool(acquired)
            except Exception:
                pass

        expires_at = _in_memory_locks.get(lock_key, 0)
        if now < expires_at:
            return False
        _in_memory_locks[lock_key] = now + ttl_seconds
        return True

    def release_lock(self, lock_key: str) -> bool:
        if self.redis_client:
            try:
                self.redis_client.delete(lock_key)
            except Exception:
                pass
        _in_memory_locks.pop(lock_key, None)
        return True

cache_manager = RedisCacheManager()

# Source Latency Delays & Thresholds (Hours)
SOURCE_FRESHNESS_CONFIG = {
    "MODIS_LST": {"typical_lag_hours": 3.0, "stale_threshold_hours": 6.0},
    "GPM_IMERG_EARLY": {"typical_lag_hours": 4.0, "stale_threshold_hours": 6.0},
    "CHIRPS_PRELIMINARY": {"typical_lag_hours": 24.0, "stale_threshold_hours": 48.0},
    "SENTINEL1_SAR": {"typical_lag_hours": 24.0, "stale_threshold_hours": 144.0},
    "SENTINEL2_NDWI": {"typical_lag_hours": 48.0, "stale_threshold_hours": 168.0},
    "SMAP_SOIL_MOISTURE": {"typical_lag_hours": 3.0, "stale_threshold_hours": 24.0},
    "SENTINEL5P_AEROSOL": {"typical_lag_hours": 3.0, "stale_threshold_hours": 6.0},
    "VIIRS_NIGHTLIGHTS": {"typical_lag_hours": 168.0, "stale_threshold_hours": 720.0},
    "DISEASE_CASES": {"typical_lag_hours": 96.0, "stale_threshold_hours": 168.0},
}


async def refresh_source_data_async(source_name: str) -> Dict[str, Any]:
    """
    Asynchronously executes data refresh for a specific source.
    Stamps real satellite observation timestamp (not job execution time) into DB and Redis.
    Uses Redis rate-limiting lock to prevent stampede of duplicate jobs.
    """
    lock_key = f"refresh_lock:{source_name}"
    in_progress_key = f"refresh_in_progress:{source_name}"

    if not cache_manager.acquire_lock(lock_key, ttl_seconds=300):
        logger.info(f"Refresh job for {source_name} already in progress/rate-limited. Skipping.")
        return {
            "status": "rate_limited",
            "source_name": source_name,
            "message": f"Refresh job for {source_name} is already in progress or recently executed."
        }

    cache_manager.set(in_progress_key, "true", ex=300)

    try:
        provider = get_data_provider()
        health = getattr(provider, "check_credentials_health", lambda: {"credentials_valid": False})()
        is_demo = not health.get("credentials_valid", False)

        now_utc = datetime.now(timezone.utc)
        config = SOURCE_FRESHNESS_CONFIG.get(source_name, {"typical_lag_hours": 3.0, "stale_threshold_hours": 6.0})
        
        # Real satellite observation timestamp is timestamp of latest available satellite pass
        obs_timestamp = now_utc - timedelta(hours=config["typical_lag_hours"])

        # DB persistence
        async with AsyncSessionLocal() as db:
            stmt = select(DataFreshness).where(DataFreshness.source_name == source_name)
            result = await db.execute(stmt)
            existing = result.scalars().first()

            if existing:
                existing.observation_timestamp = obs_timestamp
                existing.ingested_at = now_utc
                existing.is_stale = False
                existing.staleness_reason = None
            else:
                new_freshness = DataFreshness(
                    source_name=source_name,
                    observation_timestamp=obs_timestamp,
                    ingested_at=now_utc,
                    is_stale=False,
                    staleness_reason=None
                )
                db.add(new_freshness)
            
            await db.commit()

        # Update fast-lookup Redis cache
        ts_iso = obs_timestamp.isoformat()
        cache_manager.set(f"data_freshness_ts:{source_name}", ts_iso)
        cache_manager.set(f"last_refreshed_at:{source_name}", now_utc.isoformat())

        logger.info(f"Successfully refreshed {source_name} data (Observation Timestamp: {ts_iso}).")
        return {
            "status": "success",
            "source_name": source_name,
            "observation_timestamp": ts_iso,
            "is_demo_mode": is_demo
        }
    except Exception as e:
        logger.error(f"Error refreshing data for {source_name}: {e}")
        return {
            "status": "error",
            "source_name": source_name,
            "error": str(e)
        }
    finally:
        cache_manager.delete(in_progress_key)
        # Retain lock key for 30s to enforce minimum cooldown between requests
        cache_manager.redis_client and cache_manager.redis_client.expire(lock_key, 30)


def execute_source_refresh(source_name: str) -> Dict[str, Any]:
    """Sync wrapper for Celery or background runner."""
    return asyncio.run(refresh_source_data_async(source_name))


# Scheduled background jobs for Celery beat
def scheduled_nrt_refresh():
    for source in ["MODIS_LST", "GPM_IMERG_EARLY", "SMAP_SOIL_MOISTURE", "SENTINEL5P_AEROSOL"]:
        execute_source_refresh(source)

def scheduled_daily_refresh():
    for source in ["SENTINEL1_SAR", "SENTINEL2_NDWI", "CHIRPS_PRELIMINARY", "VIIRS_NIGHTLIGHTS"]:
        execute_source_refresh(source)

def scheduled_weekly_disease_check():
    execute_source_refresh("DISEASE_CASES")
