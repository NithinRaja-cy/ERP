from sqlalchemy.orm import Session
from app.models.sales import SalesOrder
from app.models.delivery import DeliveryOrder, DeliveryOrderLine
from app.models.manufacturing import ManufacturingOrder
from app.models.purchasing import PurchaseOrder
from app.purchasing.decision_engine import DecisionEngine
from app.services.inventory_service import InventoryService
from typing import Dict, Any

class OrchestrationService:
    @staticmethod
    def handle_sales_order_confirmation(db: Session, sales_order_id: int, dispatch_location_id: int) -> Dict[str, Any]:
        """
        Triggered when a Sales Order is confirmed.
        Orchestrates Inventory Check -> Reservations -> MO/PO triggers -> Delivery generation.
        """
        so = db.query(SalesOrder).filter(SalesOrder.id == sales_order_id).first()
        if not so or so.status != 'CONFIRMED':
            raise ValueError(f"Sales order {sales_order_id} is invalid or not confirmed.")

        orchestration_result = {
            "sales_order_id": sales_order_id,
            "reservations_made": [],
            "manufacturing_orders_triggered": [],
            "purchase_orders_triggered": [],
            "delivery_order_id": None
        }

        all_lines_can_be_fulfilled = True

        for line in so.lines:
            req = DecisionEngine.evaluate_requirements(db, line.product_id, line.quantity, dispatch_location_id)
            
            # If we can fulfill from stock, reserve it
            if req['action'] == 'FULFILL_FROM_STOCK':
                reservation = InventoryService.reserve_stock(db, line.product_id, dispatch_location_id, sales_order_id, line.quantity)
                orchestration_result["reservations_made"].append(reservation.id)
            else:
                all_lines_can_be_fulfilled = False
                # Trigger replenishment based on strategy
                if req['replenishment_strategy'] == 'MANUFACTURE':
                    mo = OrchestrationService._trigger_manufacturing(db, req, sales_order_id)
                    orchestration_result["manufacturing_orders_triggered"].append(mo.id)
                elif req['replenishment_strategy'] == 'PURCHASE':
                    po = OrchestrationService._trigger_purchasing(db, req, sales_order_id)
                    orchestration_result["purchase_orders_triggered"].append(po.id)

        if all_lines_can_be_fulfilled:
            # Generate Delivery Order automatically
            delivery = OrchestrationService._generate_delivery_order(db, so, dispatch_location_id)
            orchestration_result["delivery_order_id"] = delivery.id
        else:
            # Sales order remains in PROCESSING state until manufacturing/purchasing is done
            so.status = 'PROCESSING'
            db.commit()

        return orchestration_result

    @staticmethod
    def _trigger_manufacturing(db: Session, requirement: Dict, sales_order_id: int) -> ManufacturingOrder:
        # Simplified MO creation logic
        from app.models.manufacturing import BOM
        bom = db.query(BOM).filter(BOM.product_id == requirement['product_id']).first()
        mo = ManufacturingOrder(
            order_number=f"MO-SO{sales_order_id}-{requirement['product_id']}",
            product_id=requirement['product_id'],
            bom_id=bom.id if bom else 1, # Should handle missing BOMs safely in production
            quantity_to_produce=requirement['shortage'],
            status='DRAFT',
            sales_order_id=sales_order_id
        )
        db.add(mo)
        db.commit()
        db.refresh(mo)
        return mo

    @staticmethod
    def _trigger_purchasing(db: Session, requirement: Dict, sales_order_id: int) -> PurchaseOrder:
        # Simplified PO creation logic. In reality, requires Vendor selection logic.
        po = PurchaseOrder(
            order_number=f"PO-SO{sales_order_id}-{requirement['product_id']}",
            vendor_id=1, # Default vendor placeholder
            status='DRAFT',
            total_amount=0.0
        )
        db.add(po)
        db.commit()
        db.refresh(po)
        return po

    @staticmethod
    def _generate_delivery_order(db: Session, so: SalesOrder, dispatch_location_id: int) -> DeliveryOrder:
        delivery = DeliveryOrder(
            order_number=f"DEL-{so.order_number}",
            sales_order_id=so.id,
            status='PENDING'
        )
        db.add(delivery)
        db.commit()
        db.refresh(delivery)

        for line in so.lines:
            do_line = DeliveryOrderLine(
                delivery_order_id=delivery.id,
                product_id=line.product_id,
                quantity=line.quantity,
                location_id=dispatch_location_id
            )
            db.add(do_line)
        
        db.commit()
        return delivery
