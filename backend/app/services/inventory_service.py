from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.inventory import InventoryTransaction, StockReservation
from typing import Optional

class InventoryService:
    @staticmethod
    def get_on_hand_quantity(db: Session, product_id: int, location_id: Optional[int] = None) -> int:
        query = db.query(
            func.sum(
                func.case(
                    (InventoryTransaction.transaction_type == 'IN', InventoryTransaction.quantity),
                    (InventoryTransaction.transaction_type == 'OUT', -InventoryTransaction.quantity),
                    else_=0
                )
            )
        ).filter(InventoryTransaction.product_id == product_id, InventoryTransaction.is_deleted == False)
        
        if location_id:
            query = query.filter(InventoryTransaction.location_id == location_id)
            
        result = query.scalar()
        return result if result else 0

    @staticmethod
    def get_reserved_quantity(db: Session, product_id: int, location_id: Optional[int] = None) -> int:
        query = db.query(func.sum(StockReservation.reserved_quantity))\
            .filter(StockReservation.product_id == product_id, 
                    StockReservation.status == 'ACTIVE',
                    StockReservation.is_deleted == False)
                    
        if location_id:
            query = query.filter(StockReservation.location_id == location_id)
            
        result = query.scalar()
        return result if result else 0

    @staticmethod
    def get_available_quantity(db: Session, product_id: int, location_id: Optional[int] = None) -> int:
        on_hand = InventoryService.get_on_hand_quantity(db, product_id, location_id)
        reserved = InventoryService.get_reserved_quantity(db, product_id, location_id)
        return on_hand - reserved

    @staticmethod
    def reserve_stock(db: Session, product_id: int, location_id: int, sales_order_id: int, quantity: int) -> StockReservation:
        available = InventoryService.get_available_quantity(db, product_id, location_id)
        if available < quantity:
            raise ValueError(f"Insufficient stock. Available: {available}, Requested: {quantity}")
            
        reservation = StockReservation(
            reservation_number=f"RES-SO-{sales_order_id}-{product_id}",
            product_id=product_id,
            location_id=location_id,
            sales_order_id=sales_order_id,
            reserved_quantity=quantity,
            status='ACTIVE'
        )
        db.add(reservation)
        db.commit()
        db.refresh(reservation)
        return reservation

    @staticmethod
    def record_transaction(db: Session, product_id: int, location_id: int, transaction_type: str, quantity: int, ref_type: str = None, ref_id: int = None) -> InventoryTransaction:
        if transaction_type not in ['IN', 'OUT']:
            raise ValueError("Transaction type must be IN or OUT")
            
        if transaction_type == 'OUT':
            on_hand = InventoryService.get_on_hand_quantity(db, product_id, location_id)
            if on_hand < quantity:
                 raise ValueError("Insufficient on-hand stock for OUT transaction")

        transaction = InventoryTransaction(
            product_id=product_id,
            location_id=location_id,
            transaction_type=transaction_type,
            quantity=quantity,
            reference_type=ref_type,
            reference_id=ref_id
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction
