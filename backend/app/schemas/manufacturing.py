from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class BOMComponentCreate(BaseModel):
    component_product_id: str
    quantity: float
    unit_of_measure: str = "pcs"
    notes: Optional[str] = None


class BOMCreate(BaseModel):
    name: str
    product_id: str
    version: str = "1.0"
    yield_qty: float = 1.0
    estimated_cost: float = 0.0
    notes: Optional[str] = None
    components: List[BOMComponentCreate]


class BOMComponentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    component_product_id: str
    product_name: Optional[str] = None
    product_sku: Optional[str] = None
    quantity: float
    unit_of_measure: str

    def model_post_init(self, __context):
        self.id = str(self.id)
        self.component_product_id = str(self.component_product_id)
        if hasattr(self, 'component_product') and self.component_product:
            self.product_name = self.component_product.name
            self.product_sku = self.component_product.sku


class BOMResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    product_id: str
    product_name: Optional[str] = None
    version: str
    yield_qty: float
    estimated_cost: float
    notes: Optional[str] = None
    is_active: str
    components: List[BOMComponentResponse] = []
    created_at: datetime

    def model_post_init(self, __context):
        self.id = str(self.id)
        self.product_id = str(self.product_id)
        if hasattr(self, 'product') and self.product:
            self.product_name = self.product.name


class ManufacturingOrderCreate(BaseModel):
    bom_id: str
    planned_qty: float
    notes: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None


class ManufacturingComponentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    product_id: str
    product_name: Optional[str] = None
    required_qty: float
    consumed_qty: float
    is_available: str

    def model_post_init(self, __context):
        self.id = str(self.id)
        self.product_id = str(self.product_id)
        if hasattr(self, 'product') and self.product:
            self.product_name = self.product.name


class ManufacturingOrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    mo_number: str
    bom_id: str
    product_id: str
    product_name: Optional[str] = None
    planned_qty: float
    produced_qty: float
    status: str
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    components: List[ManufacturingComponentResponse] = []

    def model_post_init(self, __context):
        self.id = str(self.id)
        self.bom_id = str(self.bom_id)
        self.product_id = str(self.product_id)
        if hasattr(self, 'product') and self.product:
            self.product_name = self.product.name
