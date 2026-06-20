import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, CategoryCreate, CategoryResponse
from app.schemas.common import PaginatedResponse
from app.services import product_service

router = APIRouter(prefix="/api/v1/products", tags=["Products"])


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db), _=Depends(get_current_user)):
    cats = product_service.get_categories(db)
    return [CategoryResponse(id=str(c.id), name=c.name, description=c.description, color=c.color) for c in cats]


@router.post("/categories", response_model=CategoryResponse, status_code=201)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager"]))):
    cat = product_service.create_category(db, data, current_user.full_name)
    return CategoryResponse(id=str(cat.id), name=cat.name, description=cat.description, color=cat.color)


@router.get("/valuation")
def get_valuation(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return product_service.get_inventory_valuation(db)


@router.get("/low-stock")
def low_stock(db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.services.inventory_service import get_low_stock_products
    return get_low_stock_products(db)


@router.get("", response_model=PaginatedResponse[ProductResponse])
def list_products(
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    low_stock: bool = False,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    items, total = product_service.get_products(db, search, category_id, low_stock, page, page_size)
    pages = math.ceil(total / page_size)
    return PaginatedResponse(
        items=[_to_resp(p) for p in items],
        total=total, page=page, page_size=page_size, pages=pages,
    )


@router.post("", response_model=ProductResponse, status_code=201)
def create_product(data: ProductCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager"]))):
    p = product_service.create_product(db, data, current_user)
    return _to_resp(p)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    p = product_service.get_product_by_id(db, product_id)
    return _to_resp(p)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: str, data: ProductUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager"]))):
    p = product_service.update_product(db, product_id, data, current_user.full_name)
    return _to_resp(p)


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin"]))):
    product_service.delete_product(db, product_id, current_user.full_name)


def _to_resp(p) -> ProductResponse:
    from app.schemas.product import CategoryResponse
    cat = CategoryResponse(id=str(p.category.id), name=p.category.name, description=p.category.description, color=p.category.color) if p.category else None
    return ProductResponse(
        id=str(p.id), sku=p.sku, name=p.name, description=p.description,
        category_id=str(p.category_id) if p.category_id else None,
        category=cat,
        cost_price=p.cost_price, selling_price=p.selling_price,
        stock_qty=p.stock_qty, reserved_qty=p.reserved_qty,
        free_qty=p.free_qty,
        reorder_level=p.reorder_level, unit_of_measure=p.unit_of_measure,
        barcode=p.barcode, is_active=p.is_active,
        preferred_vendor_id=str(p.preferred_vendor_id) if p.preferred_vendor_id else None,
        created_at=p.created_at,
    )
