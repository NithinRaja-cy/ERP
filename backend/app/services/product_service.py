import uuid
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from fastapi import HTTPException

from app.models.product import Category, Product
from app.schemas.product import ProductCreate, ProductUpdate, CategoryCreate
from app.services.audit_service import log_action


def get_categories(db: Session) -> List[Category]:
    return db.query(Category).filter(Category.deleted_at.is_(None)).all()


def create_category(db: Session, data: CategoryCreate, user_name: str = "System") -> Category:
    existing = db.query(Category).filter(Category.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category name already exists")
    cat = Category(id=uuid.uuid4(), **data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    log_action(db, "create", "categories", str(cat.id), new_values=data.model_dump(), user_name=user_name)
    db.commit()
    return cat


def get_products(
    db: Session,
    search: Optional[str] = None,
    category_id: Optional[str] = None,
    low_stock_only: bool = False,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[Product], int]:
    q = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.preferred_vendor),
    ).filter(Product.deleted_at.is_(None), Product.is_active == "true")

    if search:
        q = q.filter(or_(
            Product.name.ilike(f"%{search}%"),
            Product.sku.ilike(f"%{search}%"),
        ))
    if category_id:
        q = q.filter(Product.category_id == category_id)
    if low_stock_only:
        q = q.filter(Product.stock_qty <= Product.reorder_level)

    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return items, total


def get_product_by_id(db: Session, product_id: str) -> Product:
    p = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.preferred_vendor),
    ).filter(Product.id == product_id, Product.deleted_at.is_(None)).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return p


def create_product(db: Session, data: ProductCreate, user_name: str = "System") -> Product:
    existing = db.query(Product).filter(Product.sku == data.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU '{data.sku}' already exists")

    payload = data.model_dump()
    if payload.get("category_id"):
        payload["category_id"] = uuid.UUID(payload["category_id"])
    if payload.get("preferred_vendor_id"):
        payload["preferred_vendor_id"] = uuid.UUID(payload["preferred_vendor_id"])

    p = Product(id=uuid.uuid4(), **payload)
    db.add(p)
    db.commit()
    db.refresh(p)
    log_action(db, "create", "products", str(p.id), new_values=data.model_dump(), user_name=user_name)
    db.commit()
    return p


def update_product(db: Session, product_id: str, data: ProductUpdate, user_name: str = "System") -> Product:
    p = get_product_by_id(db, product_id)
    old = {c.name: getattr(p, c.name) for c in p.__table__.columns}
    update_data = data.model_dump(exclude_none=True)
    for k, v in update_data.items():
        setattr(p, k, v)
    db.commit()
    db.refresh(p)
    log_action(db, "update", "products", product_id, old_values=old, new_values=update_data, user_name=user_name)
    db.commit()
    return p


def delete_product(db: Session, product_id: str, user_name: str = "System") -> None:
    from datetime import datetime, timezone
    p = get_product_by_id(db, product_id)
    p.deleted_at = datetime.now(timezone.utc)
    p.is_active = "false"
    log_action(db, "delete", "products", product_id, user_name=user_name)
    db.commit()


def get_inventory_valuation(db: Session) -> dict:
    products = db.query(Product).filter(
        Product.deleted_at.is_(None), Product.is_active == "true"
    ).all()
    items = []
    total = 0.0
    for p in products:
        val = p.stock_qty * p.cost_price
        total += val
        items.append({
            "product_id": str(p.id),
            "product_name": p.name,
            "sku": p.sku,
            "stock_qty": p.stock_qty,
            "cost_price": p.cost_price,
            "total_value": val,
        })
    return {"items": items, "total_value": total, "total_products": len(items)}
