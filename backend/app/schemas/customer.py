from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional
from datetime import datetime


class CustomerCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    credit_limit: float = 0.0
    notes: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    credit_limit: Optional[float] = None
    notes: Optional[str] = None


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    credit_limit: float
    outstanding_balance: float
    notes: Optional[str] = None
    created_at: datetime

    def model_post_init(self, __context):
        if hasattr(self, 'id') and self.id:
            self.id = str(self.id)


class CustomerAnalytics(BaseModel):
    customer_id: str
    total_orders: int
    total_revenue: float
    outstanding_amount: float
    last_order_date: Optional[datetime] = None
    avg_order_value: float
