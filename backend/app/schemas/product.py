from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime


class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#6366f1"


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    description: Optional[str] = None
    color: Optional[str] = None

    def model_post_init(self, __context):
        if hasattr(self, 'id') and self.id:
            self.id = str(self.id)


class ProductCreate(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    cost_price: float
    selling_price: float
    stock_qty: float = 0.0
    reorder_level: float = 10.0
    unit_of_measure: str = "pcs"
    barcode: Optional[str] = None
    preferred_vendor_id: Optional[str] = None

    @field_validator("cost_price", "selling_price", "stock_qty", "reorder_level")
    @classmethod
    def validate_non_negative(cls, v):
        if v < 0:
            raise ValueError("Value must be non-negative")
        return v


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    reorder_level: Optional[float] = None
    unit_of_measure: Optional[str] = None
    barcode: Optional[str] = None
    preferred_vendor_id: Optional[str] = None
    is_active: Optional[str] = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    sku: str
    name: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    category: Optional[CategoryResponse] = None
    cost_price: float
    selling_price: float
    stock_qty: float
    reserved_qty: float
    free_qty: float
    reorder_level: float
    unit_of_measure: str
    barcode: Optional[str] = None
    is_active: str
    preferred_vendor_id: Optional[str] = None
    created_at: datetime

    def model_post_init(self, __context):
        for field in ['id', 'category_id', 'preferred_vendor_id']:
            val = getattr(self, field, None)
            if val:
                setattr(self, field, str(val))
