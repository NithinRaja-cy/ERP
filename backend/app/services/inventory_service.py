import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from fastapi import HTTPException

from app.models.inventory import StockMovement, InventoryReservation
from app.models.product import Product
from app.schemas.inventory import StockAdjustRequest
from app.api.v1.activities import log_activity
from app.models.user import User

def record_movement(
    db: Session,
    product_id: str,
    quantity_delta: float,
    movement_type: str,
    reference: Optional[str] = None,
    reference_id: Optional[str] = None,
    notes: Optional[str] = None,
    created_by: Optional[str] = None,
) -> StockMovement:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    movement = StockMovement(
        id=str(uuid.uuid4()),
        product_id=product_id,
        quantity_delta=quantity_delta,
        movement_type=movement_type,
        reference=reference,
        reference_id=reference_id,
        notes=notes,
        created_by=created_by,
    )
    db.add(movement)

    # Update product stock
    product.stock_qty = max(0.0, product.stock_qty + quantity_delta)
    return movement

def reserve_stock(
    db: Session,
    product_id: str,
    quantity: float,
    reference_type: str,
    reference_id: str,
) -> InventoryReservation:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    free_qty = product.stock_qty - product.reserved_qty
    if free_qty < quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock for {product.name}. Available: {free_qty}, Required: {quantity}",
        )

    reservation = InventoryReservation(
        id=str(uuid.uuid4()),
        product_id=product_id,
        quantity=quantity,
        reference_type=reference_type,
        reference_id=reference_id,
        is_released="false",
    )
    product.reserved_qty += quantity
    db.add(reservation)
    return reservation

def release_reservation(db: Session, reference_id: str) -> None:
    reservations = db.query(InventoryReservation).filter(
        InventoryReservation.reference_id == reference_id,
        InventoryReservation.is_released == "false",
    ).all()
    for r in reservations:
        product = db.query(Product).filter(Product.id == r.product_id).first()
        if product:
            product.reserved_qty = max(0.0, product.reserved_qty - r.quantity)
        r.is_released = "true"

def adjust_stock(db: Session, data: StockAdjustRequest, current_user: User) -> StockMovement:
    mv = record_movement(
        db,
        product_id=data.product_id,
        quantity_delta=data.quantity_delta,
        movement_type="adjustment",
        notes=data.notes,
        created_by=current_user.full_name,
    )
    log_activity(db, str(current_user.id), current_user.full_name, "Inventory Updated", "Inventory", details=f"Delta: {data.quantity_delta}")
    db.commit()
    return mv

def get_movements(
    db: Session,
    product_id: Optional[str] = None,
    movement_type: Optional[str] = None,
    page: int = 1,
    page_size: int = 50,
) -> Tuple[List[StockMovement], int]:
    q = db.query(StockMovement).options(joinedload(StockMovement.product))
    if product_id:
        q = q.filter(StockMovement.product_id == product_id)
    if movement_type:
        q = q.filter(StockMovement.movement_type == movement_type)
    q = q.order_by(StockMovement.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return items, total

def get_low_stock_products(db: Session) -> List[dict]:
    products = db.query(Product).options(
        joinedload(Product.preferred_vendor)
    ).filter(
        Product.deleted_at.is_(None),
        Product.is_active == "true",
        Product.stock_qty <= Product.reorder_level,
    ).all()

    result = []
    for p in products:
        free = max(0.0, p.stock_qty - p.reserved_qty)
        suggested = max(p.reorder_level * 2 - p.stock_qty, p.reorder_level)
        result.append({
            "product_id": str(p.id),
            "product_name": p.name,
            "sku": p.sku,
            "stock_qty": p.stock_qty,
            "reorder_level": p.reorder_level,
            "free_qty": free,
            "preferred_vendor_name": p.preferred_vendor.name if p.preferred_vendor else None,
            "suggested_order_qty": suggested,
        })
    return result
