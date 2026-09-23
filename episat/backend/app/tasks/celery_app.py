import logging
from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

logger = logging.getLogger(__name__)

celery_app = Celery(
    "episat_tasks",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        # Every 3 hours: MODIS NRT LST & GPM IMERG Early
        "refresh-nrt-satellite-3h": {
            "task": "app.tasks.freshness_tasks.scheduled_nrt_refresh",
            "schedule": crontab(minute=0, hour="*/3"),
        },
        # Daily: Sentinel-1/2, CHIRPS Preliminary, SMAP, Sentinel-5P, VIIRS
        "refresh-daily-satellite": {
            "task": "app.tasks.freshness_tasks.scheduled_daily_refresh",
            "schedule": crontab(minute=0, hour=2),
        },
        # Weekly: Disease case data surveillance check
        "refresh-weekly-disease-data": {
            "task": "app.tasks.freshness_tasks.scheduled_weekly_disease_check",
            "schedule": crontab(minute=0, hour=3, day_of_week="monday"),
        },
    }
)

if __name__ == "__main__":
    celery_app.start()
