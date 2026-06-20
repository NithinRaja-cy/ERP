import math
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.schemas.purchase import PurchaseOrderCreate, PurchaseOrderResponse, PurchaseOrderItemResponse
from app.schemas.common import PaginatedResponse
from app.services.purchase_service import (
    get_purchase_orders, get_purchase_order, create_purchase_order,
    confirm_purchase_order, receive_purchase_order, cancel_purchase_order,
)

router = APIRouter(prefix="/api/v1/purchases", tags=["Purchases"])


def _resp(po) -> PurchaseOrderResponse:
    items = []
    for i in po.items or []:
        items.append(PurchaseOrderItemResponse(
            id=str(i.id), product_id=str(i.product_id),
            product_name=i.product.name if i.product else None,
            product_sku=i.product.sku if i.product else None,
            quantity_ordered=i.quantity_ordered, quantity_received=i.quantity_received,
            unit_price=i.unit_price, total=i.total,
        ))
    return PurchaseOrderResponse(
        id=str(po.id), order_number=po.order_number,
        vendor_id=str(po.vendor_id),
        vendor_name=po.vendor.name if po.vendor else None,
        status=po.status, subtotal=po.subtotal,
        tax_amount=po.tax_amount, total_amount=po.total_amount,
        notes=po.notes, expected_date=po.expected_date,
        received_date=po.received_date, created_at=po.created_at,
        items=items,
    )


@router.get("/orders", response_model=PaginatedResponse[PurchaseOrderResponse])
def list_orders(
    status: Optional[str] = None,
    vendor_id: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    items, total = get_purchase_orders(db, status, vendor_id, search, page, page_size)
    return PaginatedResponse(
        items=[_resp(po) for po in items],
        total=total, page=page, page_size=page_size,
        pages=math.ceil(total / page_size),
    )


@router.post("/orders", response_model=PurchaseOrderResponse, status_code=201)
def create_order(data: PurchaseOrderCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "purchase_executive"]))):
    return _resp(create_purchase_order(db, data, current_user.full_name))


@router.get("/orders/{order_id}", response_model=PurchaseOrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _resp(get_purchase_order(db, order_id))


@router.post("/orders/{order_id}/confirm", response_model=PurchaseOrderResponse)
def confirm_order(order_id: str, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "purchase_executive"]))):
    return _resp(confirm_purchase_order(db, order_id, current_user.full_name))


@router.post("/orders/{order_id}/receive", response_model=PurchaseOrderResponse)
def receive_order(
    order_id: str,
    items: list = Body(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_roles(["admin", "manager", "purchase_executive"])),
):
    return _resp(receive_purchase_order(db, order_id, items, current_user.full_name))


@router.post("/orders/{order_id}/cancel", response_model=PurchaseOrderResponse)
def cancel_order(order_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _resp(cancel_purchase_order(db, order_id))
