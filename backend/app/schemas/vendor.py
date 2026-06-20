from pydantic import BaseModel, EmailStr, ConfigDict, field_validator
from typing import Optional
from datetime import datetime


class VendorCreate(BaseModel):
    name: str
    contact_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    rating: float = 3.0
    lead_time_days: int = 7
    payment_terms: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v):
        if not 1.0 <= v <= 5.0:
            raise ValueError("Rating must be between 1 and 5")
        return v


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    rating: Optional[float] = None
    lead_time_days: Optional[int] = None
    payment_terms: Optional[str] = None
    notes: Optional[str] = None


class VendorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    contact_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    rating: float
    lead_time_days: int
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    def model_post_init(self, __context):
        if hasattr(self, 'id') and self.id:
            self.id = str(self.id)
