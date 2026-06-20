import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.schemas.inventory import StockAdjustRequest, StockMovementResponse, InventoryValuationResponse, LowStockAlert
from app.schemas.common import PaginatedResponse
from app.services.inventory_service import get_movements, adjust_stock, get_low_stock_products
from app.services.product_service import get_inventory_valuation

router = APIRouter(prefix="/api/v1/inventory", tags=["Inventory"])


@router.get("/movements", response_model=PaginatedResponse[StockMovementResponse])
def list_movements(
    product_id: Optional[str] = None,
    movement_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    items, total = get_movements(db, product_id, movement_type, page, page_size)
    return PaginatedResponse(
        items=[_mv_resp(m) for m in items],
        total=total, page=page, page_size=page_size,
        pages=math.ceil(total / page_size),
    )


@router.post("/adjust")
def adjust(data: StockAdjustRequest, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager"]))):
    mv = adjust_stock(db, data, current_user)
    return {"message": "Stock adjusted", "movement_id": str(mv.id)}


@router.get("/valuation", response_model=InventoryValuationResponse)
def valuation(db: Session = Depends(get_db), _=Depends(get_current_user)):
    data = get_inventory_valuation(db)
    return InventoryValuationResponse(**data)


@router.get("/low-stock", response_model=list[LowStockAlert])
def low_stock(db: Session = Depends(get_db), _=Depends(get_current_user)):
    items = get_low_stock_products(db)
    return [LowStockAlert(**i) for i in items]


def _mv_resp(m) -> StockMovementResponse:
    return StockMovementResponse(
        id=str(m.id),
        product_id=str(m.product_id),
        product_name=m.product.name if m.product else None,
        product_sku=m.product.sku if m.product else None,
        quantity_delta=m.quantity_delta,
        movement_type=m.movement_type,
        reference=m.reference,
        notes=m.notes,
        created_at=m.created_at,
    )
