import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from fastapi import HTTPException

from app.models.vendor import Vendor
from app.models.purchase import PurchaseOrder, PurchaseOrderItem
from app.schemas.vendor import VendorCreate, VendorUpdate
from app.schemas.purchase import PurchaseOrderCreate
from app.services.inventory_service import record_movement
from app.services.audit_service import log_action


def get_vendors(db: Session, search: Optional[str] = None, page: int = 1, page_size: int = 20) -> Tuple[List[Vendor], int]:
    q = db.query(Vendor).filter(Vendor.deleted_at.is_(None))
    if search:
        q = q.filter(or_(Vendor.name.ilike(f"%{search}%"), Vendor.email.ilike(f"%{search}%")))
    total = q.count()
    items = q.order_by(Vendor.name).offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_vendor(db: Session, vendor_id: str) -> Vendor:
    v = db.query(Vendor).filter(Vendor.id == vendor_id, Vendor.deleted_at.is_(None)).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return v


def create_vendor(db: Session, data: VendorCreate, user_name: str = "System") -> Vendor:
    if db.query(Vendor).filter(Vendor.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already in use")
    v = Vendor(id=uuid.uuid4(), **data.model_dump())
    db.add(v)
    db.commit()
    db.refresh(v)
    log_action(db, "create", "vendors", str(v.id), new_values=data.model_dump(), user_name=user_name)
    db.commit()
    return v


def update_vendor(db: Session, vendor_id: str, data: VendorUpdate, user_name: str = "System") -> Vendor:
    v = get_vendor(db, vendor_id)
    update_data = data.model_dump(exclude_none=True)
    for k, val in update_data.items():
        setattr(v, k, val)
    db.commit()
    db.refresh(v)
    return v


def delete_vendor(db: Session, vendor_id: str) -> None:
    v = get_vendor(db, vendor_id)
    v.deleted_at = datetime.now(timezone.utc)
    db.commit()


# ── Purchase Orders ──────────────────────────────────────────────────────────

def _gen_po_number(db: Session) -> str:
    count = db.query(func.count(PurchaseOrder.id)).scalar() or 0
    return f"PO-{datetime.now(timezone.utc).year}-{count + 1:05d}"


def get_purchase_orders(
    db: Session,
    status: Optional[str] = None,
    vendor_id: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[PurchaseOrder], int]:
    q = db.query(PurchaseOrder).options(
        joinedload(PurchaseOrder.vendor),
        joinedload(PurchaseOrder.items).joinedload(PurchaseOrderItem.product),
    ).filter(PurchaseOrder.deleted_at.is_(None))
    if status:
        q = q.filter(PurchaseOrder.status == status)
    if vendor_id:
        q = q.filter(PurchaseOrder.vendor_id == vendor_id)
    if search:
        q = q.filter(PurchaseOrder.order_number.ilike(f"%{search}%"))
    q = q.order_by(PurchaseOrder.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_purchase_order(db: Session, order_id: str) -> PurchaseOrder:
    po = db.query(PurchaseOrder).options(
        joinedload(PurchaseOrder.vendor),
        joinedload(PurchaseOrder.items).joinedload(PurchaseOrderItem.product),
    ).filter(PurchaseOrder.id == order_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return po


def create_purchase_order(db: Session, data: PurchaseOrderCreate, user_name: str = "System") -> PurchaseOrder:
    from app.models.product import Product
    subtotal = 0.0
    item_rows = []
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        line_total = item.quantity_ordered * item.unit_price
        subtotal += line_total
        item_rows.append(PurchaseOrderItem(
            id=uuid.uuid4(),
            product_id=uuid.UUID(item.product_id),
            quantity_ordered=item.quantity_ordered,
            quantity_received=0.0,
            unit_price=item.unit_price,
            total=line_total,
        ))

    po = PurchaseOrder(
        id=uuid.uuid4(),
        order_number=_gen_po_number(db),
        vendor_id=uuid.UUID(data.vendor_id),
        status="draft",
        subtotal=subtotal,
        tax_amount=0.0,
        total_amount=subtotal,
        notes=data.notes,
        expected_date=data.expected_date,
        created_by=user_name,
        items=item_rows,
    )
    db.add(po)
    db.commit()
    db.refresh(po)
    log_action(db, "create", "purchase_orders", str(po.id), new_values={"order_number": po.order_number}, user_name=user_name)
    db.commit()
    return get_purchase_order(db, str(po.id))


def confirm_purchase_order(db: Session, order_id: str, user_name: str = "System") -> PurchaseOrder:
    po = get_purchase_order(db, order_id)
    if po.status != "draft":
        raise HTTPException(status_code=400, detail=f"Cannot confirm PO in status '{po.status}'")
    po.status = "ordered"
    db.commit()
    return get_purchase_order(db, order_id)


def receive_purchase_order(db: Session, order_id: str, items: list, user_name: str = "System") -> PurchaseOrder:
    po = get_purchase_order(db, order_id)
    if po.status not in ("ordered",):
        raise HTTPException(status_code=400, detail=f"Cannot receive PO in status '{po.status}'")

    receive_map = {i["product_id"]: i["quantity_received"] for i in items}

    for line in po.items:
        product_id = str(line.product_id)
        qty = receive_map.get(product_id, 0.0)
        if qty > 0:
            line.quantity_received += qty
            record_movement(
                db, product_id, qty,
                "purchase_receipt", po.order_number, order_id,
                created_by=user_name,
            )

    po.status = "received"
    po.received_date = datetime.now(timezone.utc)
    db.commit()
    return get_purchase_order(db, order_id)


def cancel_purchase_order(db: Session, order_id: str) -> PurchaseOrder:
    po = get_purchase_order(db, order_id)
    if po.status in ("received", "closed", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel PO in status '{po.status}'")
    po.status = "cancelled"
    db.commit()
    return get_purchase_order(db, order_id)
