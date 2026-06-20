from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.services.inventory_service import InventoryService
from app.models.master_data import Product

class RulesEngine:
    @staticmethod
    def evaluate_inventory_health(db: Session, location_id: int) -> List[Dict[str, Any]]:
        """
        Evaluates inventory levels against predefined or dynamic thresholds.
        Returns a list of alerts/actions to be taken.
        """
        alerts = []
        products = db.query(Product).filter(Product.is_deleted == False).all()
        
        for product in products:
            available_qty = InventoryService.get_available_quantity(db, product.id, location_id)
            
            # Simple rule logic: Alert if available quantity is less than an arbitrary threshold (e.g., 50)
            # In a full implementation, the threshold would be stored per-product or calculated dynamically
            threshold = 50 
            
            if available_qty < threshold:
                alerts.append({
                    "rule": "LOW_STOCK",
                    "severity": "HIGH",
                    "product_id": product.id,
                    "product_name": product.name,
                    "available_quantity": available_qty,
                    "threshold": threshold,
                    "message": f"Low stock alert for {product.name}. Available: {available_qty}, Threshold: {threshold}"
                })
                
        return alerts

    @staticmethod
    def evaluate_delayed_orders(db: Session) -> List[Dict[str, Any]]:
        """
        Evaluate if any Manufacturing, Purchase, or Sales orders are delayed past their scheduled dates.
        """
        # Placeholder for complex delayed order detection logic
        return []
