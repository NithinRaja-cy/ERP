import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.schemas.manufacturing import (
    BOMCreate, BOMResponse, BOMComponentResponse,
    ManufacturingOrderCreate, ManufacturingOrderResponse, ManufacturingComponentResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.manufacturing_service import (
    get_boms, get_bom, create_bom,
    get_manufacturing_orders, get_manufacturing_order, create_manufacturing_order,
    check_components, reserve_components, start_manufacturing,
    complete_manufacturing, cancel_manufacturing,
)

router = APIRouter(prefix="/api/v1/manufacturing", tags=["Manufacturing"])


def _bom_resp(b) -> BOMResponse:
    comps = [BOMComponentResponse(
        id=str(c.id), component_product_id=str(c.component_product_id),
        product_name=c.component_product.name if c.component_product else None,
        product_sku=c.component_product.sku if c.component_product else None,
        quantity=c.quantity, unit_of_measure=c.unit_of_measure,
    ) for c in (b.components or [])]
    return BOMResponse(
        id=str(b.id), name=b.name, product_id=str(b.product_id),
        product_name=b.product.name if b.product else None,
        version=b.version, yield_qty=b.yield_qty, estimated_cost=b.estimated_cost,
        notes=b.notes, is_active=b.is_active, components=comps, created_at=b.created_at,
    )


def _mo_resp(mo) -> ManufacturingOrderResponse:
    comps = [ManufacturingComponentResponse(
        id=str(c.id), product_id=str(c.product_id),
        product_name=c.product.name if c.product else None,
        required_qty=c.required_qty, consumed_qty=c.consumed_qty,
        is_available=c.is_available,
    ) for c in (mo.components or [])]
    return ManufacturingOrderResponse(
        id=str(mo.id), mo_number=mo.mo_number, bom_id=str(mo.bom_id),
        product_id=str(mo.product_id),
        product_name=mo.product.name if mo.product else None,
        planned_qty=mo.planned_qty, produced_qty=mo.produced_qty,
        status=mo.status, scheduled_start=mo.scheduled_start,
        scheduled_end=mo.scheduled_end, actual_start=mo.actual_start,
        actual_end=mo.actual_end, notes=mo.notes,
        created_at=mo.created_at, components=comps,
    )


@router.get("/boms", response_model=PaginatedResponse[BOMResponse])
def list_boms(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db), _=Depends(get_current_user)):
    items, total = get_boms(db, page, page_size)
    return PaginatedResponse(items=[_bom_resp(b) for b in items], total=total, page=page, page_size=page_size, pages=math.ceil(total / page_size))


@router.post("/boms", response_model=BOMResponse, status_code=201)
def create_bom_route(data: BOMCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "production_operator"]))):
    return _bom_resp(create_bom(db, data, current_user.full_name))


@router.get("/boms/{bom_id}", response_model=BOMResponse)
def get_bom_route(bom_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _bom_resp(get_bom(db, bom_id))


@router.get("/orders", response_model=PaginatedResponse[ManufacturingOrderResponse])
def list_orders(status: Optional[str] = None, view: Optional[str] = None, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    items, total = get_manufacturing_orders(db, status, view, current_user, page, page_size)
    return PaginatedResponse(items=[_mo_resp(m) for m in items], total=total, page=page, page_size=page_size, pages=math.ceil(total / page_size))


@router.post("/orders", response_model=ManufacturingOrderResponse, status_code=201)
def create_order(data: ManufacturingOrderCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "production_operator"]))):
    return _mo_resp(create_manufacturing_order(db, data, current_user))


@router.get("/orders/{mo_id}", response_model=ManufacturingOrderResponse)
def get_order(mo_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _mo_resp(get_manufacturing_order(db, mo_id))


@router.get("/orders/{mo_id}/check-components")
def check_comps(mo_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return check_components(db, mo_id)


@router.post("/orders/{mo_id}/reserve", response_model=ManufacturingOrderResponse)
def reserve(mo_id: str, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "production_operator"]))):
    return _mo_resp(reserve_components(db, mo_id, current_user.full_name))


@router.post("/orders/{mo_id}/start", response_model=ManufacturingOrderResponse)
def start(mo_id: str, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "production_operator"]))):
    return _mo_resp(start_manufacturing(db, mo_id, current_user))


@router.post("/orders/{mo_id}/complete", response_model=ManufacturingOrderResponse)
def complete(mo_id: str, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "production_operator"]))):
    return _mo_resp(complete_manufacturing(db, mo_id, current_user))


@router.post("/orders/{mo_id}/cancel", response_model=ManufacturingOrderResponse)
def cancel(mo_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _mo_resp(cancel_manufacturing(db, mo_id))
