from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "smarterp_worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

celery_app.conf.task_routes = {"app.scheduler.tasks.*": "main-queue"}
