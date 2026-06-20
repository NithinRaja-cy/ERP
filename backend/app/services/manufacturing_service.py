import uuid
from datetime import datetime, timezone
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from fastapi import HTTPException

from app.models.manufacturing import BOM, BOMComponent, ManufacturingOrder, ManufacturingComponent
from app.models.product import Product
from app.schemas.manufacturing import BOMCreate, ManufacturingOrderCreate
from app.services.inventory_service import record_movement, reserve_stock, release_reservation
from app.services.audit_service import log_action
from app.api.v1.activities import log_activity
from app.models.user import User


def _gen_mo_number(db: Session) -> str:
    count = db.query(func.count(ManufacturingOrder.id)).scalar() or 0
    return f"MO-{datetime.now(timezone.utc).year}-{count + 1:05d}"


def get_boms(db: Session, page: int = 1, page_size: int = 20) -> Tuple[List[BOM], int]:
    q = db.query(BOM).options(
        joinedload(BOM.product),
        joinedload(BOM.components).joinedload(BOMComponent.component_product),
    ).filter(BOM.deleted_at.is_(None))
    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_bom(db: Session, bom_id: str) -> BOM:
    b = db.query(BOM).options(
        joinedload(BOM.product),
        joinedload(BOM.components).joinedload(BOMComponent.component_product),
    ).filter(BOM.id == bom_id, BOM.deleted_at.is_(None)).first()
    if not b:
        raise HTTPException(status_code=404, detail="BOM not found")
    return b


def create_bom(db: Session, data: BOMCreate, user_name: str = "System") -> BOM:
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    comp_rows = []
    total_cost = 0.0
    for c in data.components:
        comp_product = db.query(Product).filter(Product.id == c.component_product_id).first()
        if not comp_product:
            raise HTTPException(status_code=404, detail=f"Component product {c.component_product_id} not found")
        total_cost += comp_product.cost_price * c.quantity
        comp_rows.append(BOMComponent(
            id=uuid.uuid4(),
            component_product_id=uuid.UUID(c.component_product_id),
            quantity=c.quantity,
            unit_of_measure=c.unit_of_measure,
            notes=c.notes,
        ))

    bom = BOM(
        id=uuid.uuid4(),
        name=data.name,
        product_id=uuid.UUID(data.product_id),
        version=data.version,
        yield_qty=data.yield_qty,
        estimated_cost=data.estimated_cost or total_cost,
        notes=data.notes,
        is_active="true",
        components=comp_rows,
    )
    db.add(bom)
    db.commit()
    db.refresh(bom)
    log_action(db, "create", "boms", str(bom.id), new_values={"name": data.name}, user_name=user_name)
    db.commit()
    return get_bom(db, str(bom.id))


def get_manufacturing_orders(
    db: Session,
    status: Optional[str] = None,
    view: Optional[str] = None,
    current_user: Optional[User] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[ManufacturingOrder], int]:
    q = db.query(ManufacturingOrder).options(
        joinedload(ManufacturingOrder.product),
        joinedload(ManufacturingOrder.bom),
        joinedload(ManufacturingOrder.components).joinedload(ManufacturingComponent.product),
    ).filter(ManufacturingOrder.deleted_at.is_(None))
    if status:
        q = q.filter(ManufacturingOrder.status == status)
    if view == "my" and current_user:
        q = q.filter(ManufacturingOrder.assigned_to == str(current_user.id))
    q = q.order_by(ManufacturingOrder.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_manufacturing_order(db: Session, mo_id: str) -> ManufacturingOrder:
    mo = db.query(ManufacturingOrder).options(
        joinedload(ManufacturingOrder.product),
        joinedload(ManufacturingOrder.bom).joinedload(BOM.components).joinedload(BOMComponent.component_product),
        joinedload(ManufacturingOrder.components).joinedload(ManufacturingComponent.product),
    ).filter(ManufacturingOrder.id == mo_id).first()
    if not mo:
        raise HTTPException(status_code=404, detail="Manufacturing order not found")
    return mo


def create_manufacturing_order(db: Session, data: ManufacturingOrderCreate, current_user: User) -> ManufacturingOrder:
    bom = get_bom(db, data.bom_id)

    comp_rows = []
    for bc in bom.components:
        required = bc.quantity * data.planned_qty / bom.yield_qty
        comp_rows.append(ManufacturingComponent(
            id=uuid.uuid4(),
            product_id=bc.component_product_id,
            required_qty=required,
            consumed_qty=0.0,
            is_available="false",
        ))

    mo = ManufacturingOrder(
        id=uuid.uuid4(),
        mo_number=_gen_mo_number(db),
        bom_id=uuid.UUID(data.bom_id),
        product_id=bom.product_id,
        planned_qty=data.planned_qty,
        produced_qty=0.0,
        status="draft",
        notes=data.notes,
        scheduled_start=data.scheduled_start,
        scheduled_end=data.scheduled_end,
        created_by=current_user.full_name,
        assigned_to=str(current_user.id),
        components=comp_rows,
    )
    db.add(mo)
    db.commit()
    db.refresh(mo)
    log_action(db, "create", "manufacturing_orders", str(mo.id), new_values={"mo_number": mo.mo_number}, user_name=current_user.full_name)
    db.commit()
    return get_manufacturing_order(db, str(mo.id))


def check_components(db: Session, mo_id: str) -> dict:
    mo = get_manufacturing_order(db, mo_id)
    missing = []
    available = []
    can_start = True

    for comp in mo.components:
        product = comp.product
        free = max(0.0, product.stock_qty - product.reserved_qty)
        is_available = free >= comp.required_qty
        status = {
            "product_id": str(comp.product_id),
            "product_name": product.name if product else "Unknown",
            "required_qty": comp.required_qty,
            "available_qty": free,
            "shortage_qty": max(0.0, comp.required_qty - free),
            "can_produce": is_available,
        }
        if is_available:
            available.append(status)
        else:
            missing.append(status)
            can_start = False

    return {
        "manufacturing_order_id": mo_id,
        "mo_number": mo.mo_number,
        "can_start": can_start,
        "missing_components": missing,
        "available_components": available,
    }


def reserve_components(db: Session, mo_id: str, user_name: str = "System") -> ManufacturingOrder:
    mo = get_manufacturing_order(db, mo_id)
    if mo.status not in ("draft",):
        raise HTTPException(status_code=400, detail=f"Cannot reserve components for MO in status '{mo.status}'")

    for comp in mo.components:
        reserve_stock(db, str(comp.product_id), comp.required_qty, "manufacturing_order", mo_id)
        comp.is_available = "true"

    mo.status = "ready"
    db.commit()
    return get_manufacturing_order(db, mo_id)


def start_manufacturing(db: Session, mo_id: str, current_user: User) -> ManufacturingOrder:
    mo = get_manufacturing_order(db, mo_id)
    if mo.status != "ready":
        raise HTTPException(status_code=400, detail=f"MO must be in 'ready' status to start")
    mo.status = "in_progress"
    mo.actual_start = datetime.now(timezone.utc)
    log_activity(db, str(current_user.id), current_user.full_name, "MO Started", "Manufacturing", details=mo.mo_number)
    db.commit()
    return get_manufacturing_order(db, mo_id)


def complete_manufacturing(db: Session, mo_id: str, current_user: User) -> ManufacturingOrder:
    mo = get_manufacturing_order(db, mo_id)
    if mo.status != "in_progress":
        raise HTTPException(status_code=400, detail=f"MO must be 'in_progress' to complete")

    # Consume components (deduct stock)
    for comp in mo.components:
        record_movement(
            db, str(comp.product_id), -comp.required_qty,
            "mfg_consumption", mo.mo_number, mo_id,
            created_by=current_user.full_name,
        )
        comp.consumed_qty = comp.required_qty

    # Release reservations
    release_reservation(db, mo_id)

    # Add finished goods to stock
    record_movement(
        db, str(mo.product_id), mo.planned_qty,
        "mfg_output", mo.mo_number, mo_id,
        created_by=current_user.full_name,
    )

    mo.status = "completed"
    mo.produced_qty = mo.planned_qty
    mo.actual_end = datetime.now(timezone.utc)
    log_action(db, "update", "manufacturing_orders", mo_id, new_values={"status": "completed"}, user_name=current_user.full_name)
    log_activity(db, str(current_user.id), current_user.full_name, "MO Completed", "Manufacturing", details=mo.mo_number)
    db.commit()
    return get_manufacturing_order(db, mo_id)


def cancel_manufacturing(db: Session, mo_id: str) -> ManufacturingOrder:
    mo = get_manufacturing_order(db, mo_id)
    if mo.status in ("completed", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel MO in status '{mo.status}'")
    if mo.status in ("ready", "in_progress"):
        release_reservation(db, mo_id)
    mo.status = "cancelled"
    db.commit()
    return get_manufacturing_order(db, mo_id)
