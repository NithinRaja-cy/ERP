"""Celery background tasks"""
import logging
from celery_worker.celery_app import celery_app
from app.core.database import SessionLocal

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3)
def check_low_stock_and_notify(self):
    """Check for low-stock products and create notifications for admin users."""
    try:
        db = SessionLocal()
        try:
            from app.services.inventory_service import get_low_stock_products
            from app.models.user import User
            from app.models.audit import Notification
            import uuid

            low_stock = get_low_stock_products(db)
            if not low_stock:
                return {"status": "ok", "low_stock_count": 0}

            admins = db.query(User).filter(
                User.role.in_(["admin", "manager"]),
                User.is_active == True,
            ).all()

            for admin in admins:
                notif = Notification(
                    id=uuid.uuid4(),
                    user_id=admin.id,
                    title=f"⚠️ {len(low_stock)} Products Below Reorder Level",
                    message=f"The following products need restocking: {', '.join(p['product_name'] for p in low_stock[:5])}{'...' if len(low_stock) > 5 else ''}",
                    notification_type="warning",
                    entity="products",
                    is_read="false",
                )
                db.add(notif)
            db.commit()
            return {"status": "ok", "low_stock_count": len(low_stock)}
        finally:
            db.close()
    except Exception as exc:
        logger.error(f"Low stock check failed: {exc}")
        raise self.retry(exc=exc, countdown=300)


@celery_app.task(bind=True, max_retries=2)
def run_demand_forecasting(self):
    """Run demand forecasting for all active products."""
    try:
        db = SessionLocal()
        try:
            from app.models.product import Product
            from app.services.ai_service import forecast_demand

            products = db.query(Product).filter(
                Product.deleted_at.is_(None),
                Product.is_active == "true",
            ).limit(100).all()

            results = []
            for p in products:
                try:
                    forecast = forecast_demand(db, str(p.id), days=30)
                    results.append({"product_id": str(p.id), "avg_daily": forecast.avg_daily_demand})
                except Exception:
                    pass

            return {"status": "ok", "forecasted": len(results)}
        finally:
            db.close()
    except Exception as exc:
        logger.error(f"Demand forecasting failed: {exc}")
        raise self.retry(exc=exc, countdown=600)


@celery_app.task
def generate_report_async(report_type: str, format: str, filters: dict = None):
    """Generate a report asynchronously and store in Redis."""
    db = SessionLocal()
    try:
        from app.services.report_service import (
            generate_sales_report_pdf, generate_sales_report_excel,
            generate_inventory_report_pdf, generate_purchase_report_excel,
        )
        from app.core.redis_client import redis_client
        import base64

        if report_type == "sales" and format == "pdf":
            data = generate_sales_report_pdf(db)
        elif report_type == "sales" and format == "excel":
            data = generate_sales_report_excel(db)
        elif report_type == "inventory":
            data = generate_inventory_report_pdf(db)
        elif report_type == "purchases":
            data = generate_purchase_report_excel(db)
        else:
            return {"error": "Unknown report type"}

        key = f"report:{report_type}:{format}"
        redis_client.setex(key, 3600, base64.b64encode(data).decode())
        return {"status": "ready", "key": key}
    finally:
        db.close()
