import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.schemas.vendor import VendorCreate, VendorUpdate, VendorResponse
from app.schemas.common import PaginatedResponse
from app.services.purchase_service import get_vendors, get_vendor, create_vendor, update_vendor, delete_vendor

router = APIRouter(prefix="/api/v1/vendors", tags=["Vendors"])


@router.get("", response_model=PaginatedResponse[VendorResponse])
def list_vendors(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    items, total = get_vendors(db, search, page, page_size)
    return PaginatedResponse(
        items=[_to_resp(v) for v in items],
        total=total, page=page, page_size=page_size,
        pages=math.ceil(total / page_size),
    )


@router.post("", response_model=VendorResponse, status_code=201)
def create(data: VendorCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "purchase_executive"]))):
    return _to_resp(create_vendor(db, data, current_user.full_name))


@router.get("/{vendor_id}", response_model=VendorResponse)
def get(vendor_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _to_resp(get_vendor(db, vendor_id))


@router.put("/{vendor_id}", response_model=VendorResponse)
def update(vendor_id: str, data: VendorUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "purchase_executive"]))):
    return _to_resp(update_vendor(db, vendor_id, data, current_user.full_name))


@router.delete("/{vendor_id}", status_code=204)
def delete(vendor_id: str, db: Session = Depends(get_db), _=Depends(require_roles(["admin"]))):
    delete_vendor(db, vendor_id)


def _to_resp(v) -> VendorResponse:
    return VendorResponse(
        id=str(v.id), name=v.name, contact_name=v.contact_name, email=v.email,
        phone=v.phone, address=v.address, city=v.city, country=v.country,
        rating=v.rating, lead_time_days=v.lead_time_days,
        payment_terms=v.payment_terms, notes=v.notes, created_at=v.created_at,
    )
