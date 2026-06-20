from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List

from app.models.sales import SalesOrder, SalesOrderItem
from app.models.purchase import PurchaseOrder
from app.models.manufacturing import ManufacturingOrder
from app.models.product import Product
from app.models.inventory import StockMovement
from app.schemas.dashboard import KPICard, ChartDataPoint, DashboardKPIs, DashboardCharts
from app.core.redis_client import get_cached, set_cached
import json


def _cache_key(name: str) -> str:
    return f"dashboard:{name}:{datetime.now(timezone.utc).strftime('%Y-%m-%dT%H')}"


def get_kpis(db: Session) -> DashboardKPIs:
    cached = get_cached("dashboard:kpis")
    if cached:
        data = json.loads(cached)
        return DashboardKPIs(**data)

    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    prev_month_start = (month_start - timedelta(days=1)).replace(day=1)

    # Revenue this month
    revenue = db.query(func.coalesce(func.sum(SalesOrder.total_amount), 0.0)).filter(
        SalesOrder.status.in_(["delivered", "closed"]),
        SalesOrder.created_at >= month_start,
    ).scalar() or 0.0

    prev_revenue = db.query(func.coalesce(func.sum(SalesOrder.total_amount), 0.0)).filter(
        SalesOrder.status.in_(["delivered", "closed"]),
        SalesOrder.created_at >= prev_month_start,
        SalesOrder.created_at < month_start,
    ).scalar() or 0.0

    revenue_change = ((revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0.0

    # Total orders this month
    orders_count = db.query(func.count(SalesOrder.id)).filter(
        SalesOrder.created_at >= month_start
    ).scalar() or 0

    # Inventory value
    inv_value = db.query(
        func.coalesce(func.sum(Product.stock_qty * Product.cost_price), 0.0)
    ).filter(Product.deleted_at.is_(None), Product.is_active == "true").scalar() or 0.0

    # Active MOs
    active_mo = db.query(func.count(ManufacturingOrder.id)).filter(
        ManufacturingOrder.status.in_(["draft", "ready", "in_progress"])
    ).scalar() or 0

    # Pending deliveries
    pending = db.query(func.count(SalesOrder.id)).filter(
        SalesOrder.status == "confirmed"
    ).scalar() or 0

    # Low stock
    low_stock = db.query(func.count(Product.id)).filter(
        Product.deleted_at.is_(None),
        Product.is_active == "true",
        Product.stock_qty <= Product.reorder_level,
    ).scalar() or 0

    result = DashboardKPIs(
        total_revenue=KPICard(label="Monthly Revenue", value=round(revenue, 2), change_pct=round(revenue_change, 1), trend="up" if revenue_change >= 0 else "down", unit="$"),
        total_orders=KPICard(label="Total Orders", value=orders_count, trend="neutral"),
        inventory_value=KPICard(label="Inventory Value", value=round(inv_value, 2), unit="$"),
        active_manufacturing=KPICard(label="Active MOs", value=active_mo),
        pending_deliveries=KPICard(label="Pending Deliveries", value=pending),
        low_stock_count=KPICard(label="Low Stock", value=low_stock, trend="down" if low_stock > 0 else "neutral"),
    )

    set_cached("dashboard:kpis", result.model_dump_json(), ttl=300)
    return result


def get_charts(db: Session) -> DashboardCharts:
    now = datetime.now(timezone.utc)

    # Sales trend — last 12 months
    sales_trend = []
    for i in range(11, -1, -1):
        d = (now - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_d = (d + timedelta(days=32)).replace(day=1)
        val = db.query(func.coalesce(func.sum(SalesOrder.total_amount), 0.0)).filter(
            SalesOrder.created_at >= d,
            SalesOrder.created_at < next_d,
            SalesOrder.status.in_(["delivered", "closed"]),
        ).scalar() or 0.0
        sales_trend.append(ChartDataPoint(label=d.strftime("%b %Y"), value=round(val, 2)))

    # Purchase trend
    purchase_trend = []
    for i in range(11, -1, -1):
        d = (now - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_d = (d + timedelta(days=32)).replace(day=1)
        val = db.query(func.coalesce(func.sum(PurchaseOrder.total_amount), 0.0)).filter(
            PurchaseOrder.created_at >= d,
            PurchaseOrder.created_at < next_d,
            PurchaseOrder.status == "received",
        ).scalar() or 0.0
        purchase_trend.append(ChartDataPoint(label=d.strftime("%b %Y"), value=round(val, 2)))

    # MO trend
    mo_trend = []
    for i in range(11, -1, -1):
        d = (now - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_d = (d + timedelta(days=32)).replace(day=1)
        val = db.query(func.count(ManufacturingOrder.id)).filter(
            ManufacturingOrder.created_at >= d,
            ManufacturingOrder.created_at < next_d,
        ).scalar() or 0
        mo_trend.append(ChartDataPoint(label=d.strftime("%b %Y"), value=val))

    # Inventory trend — stock movements
    inv_trend = []
    for i in range(11, -1, -1):
        d = (now - timedelta(days=i * 30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_d = (d + timedelta(days=32)).replace(day=1)
        val = db.query(func.coalesce(func.sum(StockMovement.quantity_delta), 0.0)).filter(
            StockMovement.created_at >= d,
            StockMovement.created_at < next_d,
            StockMovement.quantity_delta > 0,
        ).scalar() or 0.0
        inv_trend.append(ChartDataPoint(label=d.strftime("%b %Y"), value=round(val, 2)))

    # Top 5 products by revenue
    from app.models.sales import SalesOrderItem
    top_products = db.query(
        Product.name,
        func.sum(SalesOrderItem.total).label("revenue"),
    ).join(SalesOrderItem).group_by(Product.name).order_by(
        func.sum(SalesOrderItem.total).desc()
    ).limit(5).all()

    return DashboardCharts(
        sales_trend=sales_trend,
        purchase_trend=purchase_trend,
        inventory_trend=inv_trend,
        manufacturing_trend=mo_trend,
        top_products=[{"name": r[0], "revenue": round(r[1], 2)} for r in top_products],
        revenue_by_customer=[],
    )
