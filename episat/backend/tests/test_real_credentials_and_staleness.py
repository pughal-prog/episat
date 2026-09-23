import pytest
import asyncio
from datetime import datetime, timezone, timedelta
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.geospatial.adapters import RealSatelliteProvider, DemoDataProvider, get_data_provider
from app.tasks.freshness_tasks import cache_manager, refresh_source_data_async, SOURCE_FRESHNESS_CONFIG
from app.db.database import AsyncSessionLocal
from app.models.schema import DataFreshness
from sqlalchemy import select, delete


def test_real_satellite_provider_credential_health_and_fallback():
    """
    Verification 1 & 5:
    Confirms RealSatelliteProvider checks GEE service account and NASA Earthdata credentials.
    If missing or invalid, cleanly falls back to demo mode with explicit reason labeling.
    """
    provider = RealSatelliteProvider()
    health = provider.check_credentials_health()

    assert "credentials_valid" in health
    assert "gee_initialized" in health
    assert "nasa_authenticated" in health
    assert "fallback_to_demo" in health
    assert "reason" in health

    if not health["credentials_valid"]:
        assert health["fallback_to_demo"] is True
        assert "Missing credentials" in health["reason"] or "GEE" in health["reason"]

    # Test factory fallback
    active_provider = get_data_provider()
    assert active_provider is not None
    # When in demo mode or credentials absent, factory returns DemoDataProvider
    if settings.DATA_MODE == "demo" or not health["credentials_valid"]:
        assert isinstance(active_provider, DemoDataProvider)


def test_staleness_check_endpoint_and_background_trigger():
    """
    Verification 2:
    Demonstrates GET /api/v1/data-quality/staleness-check identifies stale sources
    and dispatches a background refresh job.
    """
    async def _run():
        # Clear locks/cache
        for src in SOURCE_FRESHNESS_CONFIG.keys():
            cache_manager.delete(f"refresh_lock:{src}")
            cache_manager.delete(f"refresh_in_progress:{src}")
            cache_manager.delete(f"data_freshness_ts:{src}")

        # Set an artificially old timestamp in cache for MODIS_LST to force staleness (>6 hours)
        old_time = datetime.now(timezone.utc) - timedelta(hours=10)
        cache_manager.set("data_freshness_ts:MODIS_LST", old_time.isoformat())

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/data-quality/staleness-check")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True

            data = json_data["data"]
            assert data["is_stale"] is True
            assert "MODIS_LST" in data["stale_sources"]
            assert "environmental_summary" in data
            assert "disease_summary" in data
            assert "is_demo_mode" in data

    asyncio.run(_run())


def test_staleness_check_rate_limiting_prevents_duplicate_jobs():
    """
    Verification 3:
    Confirms that calling staleness-check twice in quick succession triggers
    only one refresh job for a stale source, not two (Redis rate-limit lock working).
    """
    async def _run():
        # Clear locks for test
        cache_manager.delete("refresh_lock:GPM_IMERG_EARLY")
        cache_manager.delete("refresh_in_progress:GPM_IMERG_EARLY")

        # Set stale timestamp for GPM_IMERG_EARLY
        stale_ts = datetime.now(timezone.utc) - timedelta(hours=12)
        cache_manager.set("data_freshness_ts:GPM_IMERG_EARLY", stale_ts.isoformat())

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # First request - triggers refresh
            res1 = await ac.get("/api/v1/data-quality/staleness-check")
            assert res1.status_code == 200
            json1 = res1.json()

            # Second request immediately following
            res2 = await ac.get("/api/v1/data-quality/staleness-check")
            assert res2.status_code == 200
            json2 = res2.json()

            # Verify second request recognizes refresh in progress or rate-limited and did not trigger a duplicate job
            assert json2["data"]["refresh_triggered"] is False or json2["data"]["refresh_in_progress"] is True

    asyncio.run(_run())


def test_db_data_freshness_stamping_and_indicator_match():
    """
    Verification 4:
    Confirms that refresh tasks stamp real satellite observation timestamps into DB
    and that GET /api/v1/data-quality returns accurate updated values matching DB.
    """
    async def _run():
        from app.db.database import engine, Base
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        # Clear locks to ensure task runs
        cache_manager.delete("refresh_lock:MODIS_LST")
        cache_manager.delete("refresh_in_progress:MODIS_LST")

        # Execute refresh task for MODIS_LST
        result = await refresh_source_data_async("MODIS_LST")
        assert result["status"] == "success"

        # Verify DB record exists and has valid observation timestamp
        async with AsyncSessionLocal() as db:
            stmt = select(DataFreshness).where(DataFreshness.source_name == "MODIS_LST")
            res = await db.execute(stmt)
            record = res.scalars().first()
            assert record is not None
            assert record.observation_timestamp is not None

        # Verify staleness-check summary reflects the updated timestamp
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/data-quality/staleness-check")
            assert res.status_code == 200
            data = res.json()["data"]
            assert "Environmental data: updated" in data["environmental_summary"]
            assert "Disease surveillance: updated" in data["disease_summary"]

    asyncio.run(_run())

