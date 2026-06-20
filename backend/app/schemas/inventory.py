from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class StockMovementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    quantity_delta: float
    movement_type: str
    reference: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    def model_post_init(self, __context):
        self.id = str(self.id)
        self.product_id = str(self.product_id)
        if hasattr(self, 'product') and self.product:
            self.product_name = self.product.name
            self.product_sku = self.product.sku


class StockAdjustRequest(BaseModel):
    product_id: str
    quantity_delta: float
    notes: Optional[str] = None


class InventoryValuationItem(BaseModel):
    product_id: str
    product_name: str
    sku: str
    stock_qty: float
    cost_price: float
    total_value: float


class InventoryValuationResponse(BaseModel):
    items: List[InventoryValuationItem]
    total_value: float
    total_products: int


class LowStockAlert(BaseModel):
    product_id: str
    product_name: str
    sku: str
    stock_qty: float
    reorder_level: float
    free_qty: float
    preferred_vendor_name: Optional[str] = None
    suggested_order_qty: float
