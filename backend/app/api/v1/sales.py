import math
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.schemas.sales import SalesOrderCreate, SalesOrderResponse
from app.schemas.common import PaginatedResponse
from app.services.sales_service import (
    get_sales_orders, get_sales_order, create_sales_order,
    confirm_sales_order, deliver_sales_order, cancel_sales_order,
)

router = APIRouter(prefix="/api/v1/sales", tags=["Sales"])


def _resp(so) -> SalesOrderResponse:
    from app.schemas.sales import SalesOrderItemResponse
    items = []
    for i in so.items or []:
        items.append(SalesOrderItemResponse(
            id=str(i.id), product_id=str(i.product_id),
            product_name=i.product.name if i.product else None,
            product_sku=i.product.sku if i.product else None,
            quantity=i.quantity, unit_price=i.unit_price,
            discount=i.discount, total=i.total,
        ))
    return SalesOrderResponse(
        id=str(so.id), order_number=so.order_number,
        customer_id=str(so.customer_id),
        customer_name=so.customer.name if so.customer else None,
        status=so.status, subtotal=so.subtotal, tax_rate=so.tax_rate,
        tax_amount=so.tax_amount, discount_amount=so.discount_amount,
        total_amount=so.total_amount, notes=so.notes,
        delivery_date=so.delivery_date, created_at=so.created_at,
        items=items,
    )


@router.get("/orders", response_model=PaginatedResponse[SalesOrderResponse])
def list_orders(
    status: Optional[str] = None,
    customer_id: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    items, total = get_sales_orders(db, status, customer_id, search, page, page_size)
    return PaginatedResponse(
        items=[_resp(so) for so in items],
        total=total, page=page, page_size=page_size,
        pages=math.ceil(total / page_size),
    )


@router.post("/orders", response_model=SalesOrderResponse, status_code=201)
def create_order(data: SalesOrderCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "sales_executive"]))):
    return _resp(create_sales_order(db, data, current_user.full_name))


@router.get("/orders/{order_id}", response_model=SalesOrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _resp(get_sales_order(db, order_id))


@router.post("/orders/{order_id}/confirm", response_model=SalesOrderResponse)
def confirm_order(order_id: str, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "sales_executive"]))):
    return _resp(confirm_sales_order(db, order_id, current_user.full_name))


@router.post("/orders/{order_id}/deliver", response_model=SalesOrderResponse)
def deliver_order(order_id: str, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "sales_executive"]))):
    return _resp(deliver_sales_order(db, order_id, current_user.full_name))


@router.post("/orders/{order_id}/cancel", response_model=SalesOrderResponse)
def cancel_order(order_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _resp(cancel_sales_order(db, order_id))


@router.get("/orders/{order_id}/invoice/pdf")
def invoice_pdf(order_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.services.report_service import generate_sales_report_pdf
    so = get_sales_order(db, order_id)
    pdf = generate_sales_report_pdf(db)
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice_{so.order_number}.pdf"},
    )
