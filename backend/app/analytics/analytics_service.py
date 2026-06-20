from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.sales import SalesOrder
from app.models.purchasing import PurchaseOrder
from app.models.manufacturing import ManufacturingOrder
from typing import Dict, Any

class AnalyticsService:
    @staticmethod
    def get_business_health_score(db: Session) -> Dict[str, Any]:
        """
        Calculates an overall business health score based on key operational indicators.
        """
        total_sales = db.query(func.count(SalesOrder.id)).scalar() or 0
        delivered_sales = db.query(func.count(SalesOrder.id)).filter(SalesOrder.status == 'DELIVERED').scalar() or 0
        
        total_mo = db.query(func.count(ManufacturingOrder.id)).scalar() or 0
        completed_mo = db.query(func.count(ManufacturingOrder.id)).filter(ManufacturingOrder.status == 'COMPLETED').scalar() or 0
        
        # Simplified metrics for the MVP
        delivery_success_rate = (delivered_sales / total_sales * 100) if total_sales > 0 else 100.0
        manufacturing_efficiency = (completed_mo / total_mo * 100) if total_mo > 0 else 100.0
        
        # Arbitrary weighting for health score
        health_score = (delivery_success_rate * 0.6) + (manufacturing_efficiency * 0.4)
        
        return {
            "overall_health_score": round(health_score, 2),
            "delivery_success_rate": round(delivery_success_rate, 2),
            "manufacturing_efficiency": round(manufacturing_efficiency, 2),
            "status": "HEALTHY" if health_score > 85 else "NEEDS_ATTENTION"
        }

    @staticmethod
    def get_sales_overview(db: Session) -> Dict[str, Any]:
        total_revenue = db.query(func.sum(SalesOrder.total_amount)).filter(SalesOrder.status != 'CANCELLED').scalar() or 0.0
        return {
            "total_revenue": total_revenue
        }
