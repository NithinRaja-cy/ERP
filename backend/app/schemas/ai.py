from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class ForecastPoint(BaseModel):
    date: str
    predicted_qty: float
    lower_bound: float
    upper_bound: float


class DemandForecastResponse(BaseModel):
    product_id: str
    product_name: str
    product_sku: str
    forecast_days: int
    avg_daily_demand: float
    forecast: List[ForecastPoint]
    confidence: float
    recommendation: str


class ProcurementSuggestion(BaseModel):
    product_id: str
    product_name: str
    sku: str
    current_stock: float
    reorder_level: float
    suggested_qty: float
    estimated_cost: float
    preferred_vendor_id: Optional[str] = None
    preferred_vendor_name: Optional[str] = None
    lead_time_days: int
    priority: str  # critical|high|medium


class ManufacturingAssistantRequest(BaseModel):
    manufacturing_order_id: str


class ComponentStatus(BaseModel):
    product_id: str
    product_name: str
    required_qty: float
    available_qty: float
    shortage_qty: float
    can_produce: bool


class ManufacturingAssistantResponse(BaseModel):
    manufacturing_order_id: str
    mo_number: str
    can_start: bool
    missing_components: List[ComponentStatus]
    available_components: List[ComponentStatus]
    estimated_completion_days: Optional[int] = None
    recommendations: List[str]


class CopilotRequest(BaseModel):
    query: str


class CopilotResponse(BaseModel):
    query: str
    answer: str
    data: Optional[Any] = None
    action_type: str  # info|redirect|data|error
