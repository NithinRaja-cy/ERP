from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime


class PurchaseOrderItemCreate(BaseModel):
    product_id: str
    quantity_ordered: float
    unit_price: float

    @field_validator("quantity_ordered")
    @classmethod
    def validate_qty(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be positive")
        return v


class PurchaseOrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    quantity_ordered: float
    quantity_received: float
    unit_price: float
    total: float

    def model_post_init(self, __context):
        self.id = str(self.id)
        self.product_id = str(self.product_id)
        if hasattr(self, 'product') and self.product:
            self.product_name = self.product.name
            self.product_sku = self.product.sku


class PurchaseOrderCreate(BaseModel):
    vendor_id: str
    items: List[PurchaseOrderItemCreate]
    notes: Optional[str] = None
    expected_date: Optional[datetime] = None


class ReceiveItemsRequest(BaseModel):
    items: List[dict]  # [{product_id, quantity_received}]


class PurchaseOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    order_number: str
    vendor_id: str
    vendor_name: Optional[str] = None
    status: str
    subtotal: float
    tax_amount: float
    total_amount: float
    notes: Optional[str] = None
    expected_date: Optional[datetime] = None
    received_date: Optional[datetime] = None
    created_at: datetime
    items: List[PurchaseOrderItemResponse] = []

    def model_post_init(self, __context):
        self.id = str(self.id)
        self.vendor_id = str(self.vendor_id)
        if hasattr(self, 'vendor') and self.vendor:
            self.vendor_name = self.vendor.name
