from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class KPICard(BaseModel):
    label: str
    value: float | int | str
    change_pct: Optional[float] = None
    trend: Optional[str] = None  # up|down|neutral
    unit: Optional[str] = None


class ChartDataPoint(BaseModel):
    label: str
    value: float


class DashboardKPIs(BaseModel):
    total_revenue: KPICard
    total_orders: KPICard
    inventory_value: KPICard
    active_manufacturing: KPICard
    pending_deliveries: KPICard
    low_stock_count: KPICard


class DashboardCharts(BaseModel):
    sales_trend: List[ChartDataPoint]
    purchase_trend: List[ChartDataPoint]
    inventory_trend: List[ChartDataPoint]
    manufacturing_trend: List[ChartDataPoint]
    top_products: List[dict]
    revenue_by_customer: List[dict]
