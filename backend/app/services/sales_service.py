import uuid
from datetime import datetime, timezone
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from fastapi import HTTPException

from app.models.customer import Customer
from app.models.sales import SalesOrder, SalesOrderItem
from app.schemas.customer import CustomerCreate, CustomerUpdate
from app.schemas.sales import SalesOrderCreate, SalesOrderResponse
from app.services.inventory_service import record_movement, reserve_stock, release_reservation
from app.services.audit_service import log_action


def get_customers(
    db: Session,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Customer], int]:
    q = db.query(Customer).filter(Customer.deleted_at.is_(None))
    if search:
        q = q.filter(or_(
            Customer.name.ilike(f"%{search}%"),
            Customer.email.ilike(f"%{search}%"),
        ))
    total = q.count()
    items = q.order_by(Customer.name).offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_customer(db: Session, customer_id: str) -> Customer:
    c = db.query(Customer).filter(Customer.id == customer_id, Customer.deleted_at.is_(None)).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return c


def create_customer(db: Session, data: CustomerCreate, user_name: str = "System") -> Customer:
    if db.query(Customer).filter(Customer.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already in use")
    c = Customer(id=uuid.uuid4(), **data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    log_action(db, "create", "customers", str(c.id), new_values=data.model_dump(), user_name=user_name)
    db.commit()
    return c


def update_customer(db: Session, customer_id: str, data: CustomerUpdate, user_name: str = "System") -> Customer:
    c = get_customer(db, customer_id)
    update_data = data.model_dump(exclude_none=True)
    for k, v in update_data.items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


def delete_customer(db: Session, customer_id: str, user_name: str = "System") -> None:
    c = get_customer(db, customer_id)
    c.deleted_at = datetime.now(timezone.utc)
    db.commit()


def get_customer_analytics(db: Session, customer_id: str) -> dict:
    orders = db.query(SalesOrder).filter(
        SalesOrder.customer_id == customer_id,
        SalesOrder.status != "cancelled",
    ).all()
    total = sum(o.total_amount for o in orders)
    outstanding = sum(o.total_amount for o in orders if o.status in ("confirmed", "draft"))
    last = max((o.created_at for o in orders), default=None)
    avg = total / len(orders) if orders else 0.0
    return {
        "customer_id": customer_id,
        "total_orders": len(orders),
        "total_revenue": total,
        "outstanding_amount": outstanding,
        "last_order_date": last,
        "avg_order_value": avg,
    }


# ── Sales Orders ────────────────────────────────────────────────────────────

def _generate_so_number(db: Session) -> str:
    count = db.query(func.count(SalesOrder.id)).scalar() or 0
    return f"SO-{datetime.now(timezone.utc).year}-{count + 1:05d}"


def get_sales_orders(
    db: Session,
    status: Optional[str] = None,
    customer_id: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[SalesOrder], int]:
    q = db.query(SalesOrder).options(
        joinedload(SalesOrder.customer),
        joinedload(SalesOrder.items).joinedload(SalesOrderItem.product),
    ).filter(SalesOrder.deleted_at.is_(None))
    if status:
        q = q.filter(SalesOrder.status == status)
    if customer_id:
        q = q.filter(SalesOrder.customer_id == customer_id)
    if search:
        q = q.filter(SalesOrder.order_number.ilike(f"%{search}%"))
    q = q.order_by(SalesOrder.created_at.desc())
    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_sales_order(db: Session, order_id: str) -> SalesOrder:
    so = db.query(SalesOrder).options(
        joinedload(SalesOrder.customer),
        joinedload(SalesOrder.items).joinedload(SalesOrderItem.product),
    ).filter(SalesOrder.id == order_id).first()
    if not so:
        raise HTTPException(status_code=404, detail="Sales order not found")
    return so


def create_sales_order(db: Session, data: SalesOrderCreate, user_name: str = "System") -> SalesOrder:
    from app.models.product import Product
    subtotal = 0.0
    item_rows = []
    for item in data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        line_total = (item.quantity * item.unit_price) * (1 - item.discount / 100)
        subtotal += line_total
        item_rows.append(SalesOrderItem(
            id=uuid.uuid4(),
            product_id=uuid.UUID(item.product_id),
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount=item.discount,
            total=line_total,
        ))

    tax_amount = subtotal * (data.tax_rate / 100)
    total = subtotal + tax_amount - data.discount_amount

    so = SalesOrder(
        id=uuid.uuid4(),
        order_number=_generate_so_number(db),
        customer_id=uuid.UUID(data.customer_id),
        status="draft",
        subtotal=subtotal,
        tax_rate=data.tax_rate,
        tax_amount=tax_amount,
        discount_amount=data.discount_amount,
        total_amount=total,
        notes=data.notes,
        delivery_date=data.delivery_date,
        created_by=user_name,
        items=item_rows,
    )
    db.add(so)
    db.commit()
    db.refresh(so)
    log_action(db, "create", "sales_orders", str(so.id), new_values={"order_number": so.order_number}, user_name=user_name)
    db.commit()
    return get_sales_order(db, str(so.id))


def confirm_sales_order(db: Session, order_id: str, user_name: str = "System") -> SalesOrder:
    so = get_sales_order(db, order_id)
    if so.status != "draft":
        raise HTTPException(status_code=400, detail=f"Cannot confirm order in status '{so.status}'")

    # Reserve stock for each item
    for item in so.items:
        reserve_stock(db, str(item.product_id), item.quantity, "sales_order", order_id)

    so.status = "confirmed"
    db.commit()
    log_action(db, "update", "sales_orders", order_id, new_values={"status": "confirmed"}, user_name=user_name)
    db.commit()
    return get_sales_order(db, order_id)


def deliver_sales_order(db: Session, order_id: str, user_name: str = "System") -> SalesOrder:
    so = get_sales_order(db, order_id)
    if so.status != "confirmed":
        raise HTTPException(status_code=400, detail=f"Cannot deliver order in status '{so.status}'")

    for item in so.items:
        record_movement(
            db, str(item.product_id), -item.quantity,
            "sales_delivery", so.order_number, order_id,
            created_by=user_name,
        )

    release_reservation(db, order_id)
    so.status = "delivered"
    db.commit()
    log_action(db, "update", "sales_orders", order_id, new_values={"status": "delivered"}, user_name=user_name)
    db.commit()
    return get_sales_order(db, order_id)


def cancel_sales_order(db: Session, order_id: str, user_name: str = "System") -> SalesOrder:
    so = get_sales_order(db, order_id)
    if so.status in ("delivered", "closed", "cancelled"):
        raise HTTPException(status_code=400, detail=f"Cannot cancel order in status '{so.status}'")
    if so.status == "confirmed":
        release_reservation(db, order_id)
    so.status = "cancelled"
    db.commit()
    return get_sales_order(db, order_id)
