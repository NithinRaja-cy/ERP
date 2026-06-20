from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime


class SalesOrderItemCreate(BaseModel):
    product_id: str
    quantity: float
    unit_price: float
    discount: float = 0.0

    @field_validator("quantity")
    @classmethod
    def validate_qty(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be positive")
        return v


class SalesOrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    quantity: float
    unit_price: float
    discount: float
    total: float

    def model_post_init(self, __context):
        self.id = str(self.id)
        self.product_id = str(self.product_id)
        if hasattr(self, 'product') and self.product:
            self.product_name = self.product.name
            self.product_sku = self.product.sku


class SalesOrderCreate(BaseModel):
    customer_id: str
    items: List[SalesOrderItemCreate]
    tax_rate: float = 0.0
    discount_amount: float = 0.0
    notes: Optional[str] = None
    delivery_date: Optional[datetime] = None


class SalesOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    order_number: str
    customer_id: str
    customer_name: Optional[str] = None
    status: str
    subtotal: float
    tax_rate: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    notes: Optional[str] = None
    delivery_date: Optional[datetime] = None
    created_at: datetime
    items: List[SalesOrderItemResponse] = []

    def model_post_init(self, __context):
        self.id = str(self.id)
        self.customer_id = str(self.customer_id)
        if hasattr(self, 'customer') and self.customer:
            self.customer_name = self.customer.name
