from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "mini_erp",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["celery_worker.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    beat_schedule={
        "daily-low-stock-check": {
            "task": "celery_worker.tasks.check_low_stock_and_notify",
            "schedule": 3600.0,  # every hour
        },
        "daily-demand-forecast": {
            "task": "celery_worker.tasks.run_demand_forecasting",
            "schedule": 86400.0,  # daily
        },
    },
)
