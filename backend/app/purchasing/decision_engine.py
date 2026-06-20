from sqlalchemy.orm import Session
from app.models.master_data import Product
from app.models.manufacturing import BOM
from app.services.inventory_service import InventoryService
from typing import Dict, List, Tuple

class DecisionEngine:
    @staticmethod
    def evaluate_requirements(db: Session, product_id: int, required_quantity: int, location_id: int) -> Dict:
        """
        Evaluates what needs to be done to fulfill the required quantity of a product.
        Returns a dictionary detailing if it can be fulfilled from stock, 
        needs manufacturing, or needs purchasing.
        """
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError(f"Product {product_id} not found")

        available_qty = InventoryService.get_available_quantity(db, product_id, location_id)
        shortage = max(0, required_quantity - available_qty)

        result = {
            "product_id": product_id,
            "required_quantity": required_quantity,
            "available_quantity": available_qty,
            "shortage": shortage,
            "action": "FULFILL_FROM_STOCK" if shortage == 0 else "NEEDS_REPLENISHMENT",
            "replenishment_strategy": None,
            "sub_requirements": []
        }

        if shortage > 0:
            if product.type == 'FINISHED_GOOD' or product.type == 'SUB_ASSEMBLY':
                result["replenishment_strategy"] = "MANUFACTURE"
                # Check BOM for manufacturing
                bom = db.query(BOM).filter(BOM.product_id == product_id, BOM.is_active == True).first()
                if not bom:
                    raise ValueError(f"No active BOM found for product {product_id} to manufacture")
                
                # Recursive evaluation for multi-level BOM
                for component in bom.components:
                    component_req_qty = component.quantity * shortage
                    sub_req = DecisionEngine.evaluate_requirements(db, component.component_product_id, component_req_qty, location_id)
                    result["sub_requirements"].append(sub_req)
            elif product.type == 'RAW_MATERIAL':
                result["replenishment_strategy"] = "PURCHASE"

        return result
