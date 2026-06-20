import math
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user, require_roles
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerAnalytics
from app.schemas.common import PaginatedResponse
from app.services.sales_service import get_customers, get_customer, create_customer, update_customer, delete_customer, get_customer_analytics

router = APIRouter(prefix="/api/v1/customers", tags=["Customers"])


@router.get("", response_model=PaginatedResponse[CustomerResponse])
def list_customers(
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    items, total = get_customers(db, search, page, page_size)
    return PaginatedResponse(
        items=[_to_resp(c) for c in items],
        total=total, page=page, page_size=page_size,
        pages=math.ceil(total / page_size),
    )


@router.post("", response_model=CustomerResponse, status_code=201)
def create(data: CustomerCreate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "sales_executive"]))):
    c = create_customer(db, data, current_user.full_name)
    return _to_resp(c)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get(customer_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _to_resp(get_customer(db, customer_id))


@router.put("/{customer_id}", response_model=CustomerResponse)
def update(customer_id: str, data: CustomerUpdate, db: Session = Depends(get_db), current_user=Depends(require_roles(["admin", "manager", "sales_executive"]))):
    return _to_resp(update_customer(db, customer_id, data, current_user.full_name))


@router.delete("/{customer_id}", status_code=204)
def delete(customer_id: str, db: Session = Depends(get_db), _=Depends(require_roles(["admin", "manager"]))):
    delete_customer(db, customer_id)


@router.get("/{customer_id}/analytics", response_model=CustomerAnalytics)
def analytics(customer_id: str, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_customer_analytics(db, customer_id)


def _to_resp(c) -> CustomerResponse:
    return CustomerResponse(
        id=str(c.id), name=c.name, email=c.email, phone=c.phone,
        address=c.address, city=c.city, country=c.country,
        credit_limit=c.credit_limit, outstanding_balance=c.outstanding_balance,
        notes=c.notes, created_at=c.created_at,
    )
