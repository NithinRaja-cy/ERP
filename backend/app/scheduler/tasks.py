from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.rules.rules_engine import RulesEngine
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def check_inventory_levels():
    """
    Periodic task to check inventory health using the Rules Engine.
    """
    logger.info("Running periodic inventory level check...")
    db = SessionLocal()
    try:
        # Assuming a default location ID for checking, e.g., 1
        alerts = RulesEngine.evaluate_inventory_health(db, location_id=1)
        if alerts:
            logger.warning(f"Found {len(alerts)} inventory alerts.")
            # Here we would integrate with the notifications system to broadcast to WebSockets
            for alert in alerts:
                logger.warning(alert['message'])
    finally:
        db.close()

@celery_app.task
def refresh_analytics_cache():
    """
    Periodic task to pre-calculate and cache expensive dashboard analytics.
    """
    logger.info("Refreshing dashboard analytics cache...")
    # Calls to AnalyticsService would go here
    pass

@celery_app.task
def detect_delayed_orders():
    """
    Periodic task to find delayed operations.
    """
    db = SessionLocal()
    try:
        delayed = RulesEngine.evaluate_delayed_orders(db)
        if delayed:
            logger.warning(f"Found {len(delayed)} delayed orders.")
    finally:
        db.close()

# In a real app, you would configure celery_app.conf.beat_schedule here 
# or in celery_app.py to schedule these tasks.
