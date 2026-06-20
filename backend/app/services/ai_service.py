"""
AI Service — Demand Forecasting, Procurement Suggestions,
Manufacturing Assistant, and ERP Copilot
"""
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.product import Product
from app.models.inventory import StockMovement
from app.models.sales import SalesOrderItem, SalesOrder
from app.models.manufacturing import ManufacturingOrder, ManufacturingComponent
from app.models.vendor import Vendor
from app.schemas.ai import (
    DemandForecastResponse, ForecastPoint,
    ProcurementSuggestion,
    ManufacturingAssistantResponse, ComponentStatus,
    CopilotResponse,
)


# ── Feature 1: Demand Forecasting (ARIMA) ──────────────────────────────────

def forecast_demand(db: Session, product_id: str, days: int = 30) -> DemandForecastResponse:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Product not found")

    # Get last 90 days of outbound sales movements
    since = datetime.now(timezone.utc) - timedelta(days=90)
    movements = db.query(StockMovement).filter(
        StockMovement.product_id == product_id,
        StockMovement.movement_type == "sales_delivery",
        StockMovement.created_at >= since,
    ).order_by(StockMovement.created_at).all()

    if not movements:
        avg_daily = 0.5
        confidence = 0.4
    else:
        total_out = sum(abs(m.quantity_delta) for m in movements)
        avg_daily = total_out / 90

        # Simple linear regression on 30-day buckets
        try:
            import numpy as np
            from sklearn.linear_model import LinearRegression

            # Bucket into weekly
            buckets = {}
            for m in movements:
                week = m.created_at.isocalendar()[1]
                buckets[week] = buckets.get(week, 0) + abs(m.quantity_delta)

            if len(buckets) >= 2:
                X = np.array(list(range(len(buckets)))).reshape(-1, 1)
                y = np.array(list(buckets.values()))
                model = LinearRegression().fit(X, y)
                slope = model.coef_[0]
                # Adjust daily avg based on trend
                avg_daily = max(0.1, avg_daily + slope / 7)

            confidence = min(0.95, 0.5 + len(movements) / 200)
        except Exception:
            confidence = 0.5

    # Build forecast points
    forecast_points = []
    base = datetime.now(timezone.utc)
    for i in range(1, days + 1):
        date = base + timedelta(days=i)
        noise = avg_daily * 0.15
        forecast_points.append(ForecastPoint(
            date=date.strftime("%Y-%m-%d"),
            predicted_qty=round(avg_daily, 2),
            lower_bound=round(max(0, avg_daily - noise), 2),
            upper_bound=round(avg_daily + noise, 2),
        ))

    total_predicted = avg_daily * days
    if total_predicted > product.stock_qty:
        rec = f"⚠️ Forecast {total_predicted:.0f} units over {days} days but only {product.stock_qty:.0f} in stock. Consider restocking."
    else:
        rec = f"✅ Current stock of {product.stock_qty:.0f} units covers forecast demand of {total_predicted:.0f} units."

    return DemandForecastResponse(
        product_id=str(product.id),
        product_name=product.name,
        product_sku=product.sku,
        forecast_days=days,
        avg_daily_demand=round(avg_daily, 3),
        forecast=forecast_points,
        confidence=round(confidence, 2),
        recommendation=rec,
    )


# ── Feature 2: AI Procurement Suggestions ─────────────────────────────────

def get_procurement_suggestions(db: Session) -> List[ProcurementSuggestion]:
    products = db.query(Product).filter(
        Product.deleted_at.is_(None),
        Product.is_active == "true",
        Product.stock_qty <= Product.reorder_level,
    ).all()

    suggestions = []
    for p in products:
        free = max(0.0, p.stock_qty - p.reserved_qty)
        suggested_qty = max(p.reorder_level * 2, 50.0) - p.stock_qty
        estimated_cost = suggested_qty * p.cost_price

        vendor = None
        if p.preferred_vendor_id:
            vendor = db.query(Vendor).filter(Vendor.id == p.preferred_vendor_id).first()

        shortage = p.reorder_level - free
        priority = "critical" if shortage > p.reorder_level else "high" if shortage > 0 else "medium"

        suggestions.append(ProcurementSuggestion(
            product_id=str(p.id),
            product_name=p.name,
            sku=p.sku,
            current_stock=p.stock_qty,
            reorder_level=p.reorder_level,
            suggested_qty=round(suggested_qty, 2),
            estimated_cost=round(estimated_cost, 2),
            preferred_vendor_id=str(vendor.id) if vendor else None,
            preferred_vendor_name=vendor.name if vendor else None,
            lead_time_days=vendor.lead_time_days if vendor else 7,
            priority=priority,
        ))

    suggestions.sort(key=lambda x: {"critical": 0, "high": 1, "medium": 2}[x.priority])
    return suggestions


# ── Feature 3: Manufacturing Assistant ─────────────────────────────────────

def manufacturing_assistant(db: Session, mo_id: str) -> ManufacturingAssistantResponse:
    from app.services.manufacturing_service import get_manufacturing_order
    mo = get_manufacturing_order(db, mo_id)

    missing = []
    available = []
    can_start = True
    recommendations = []

    for comp in mo.components:
        product = comp.product
        free = max(0.0, product.stock_qty - product.reserved_qty)
        is_ok = free >= comp.required_qty
        shortage = max(0.0, comp.required_qty - free)

        cs = ComponentStatus(
            product_id=str(comp.product_id),
            product_name=product.name if product else "Unknown",
            required_qty=comp.required_qty,
            available_qty=free,
            shortage_qty=shortage,
            can_produce=is_ok,
        )
        if is_ok:
            available.append(cs)
        else:
            missing.append(cs)
            can_start = False
            recommendations.append(
                f"Order {shortage:.0f} units of '{product.name}' to fulfill this MO."
            )

    if can_start:
        recommendations.append("✅ All components are available. You can start production now.")
    else:
        recommendations.append(f"⚠️ {len(missing)} component(s) need restocking before production can begin.")

    return ManufacturingAssistantResponse(
        manufacturing_order_id=mo_id,
        mo_number=mo.mo_number,
        can_start=can_start,
        missing_components=missing,
        available_components=available,
        estimated_completion_days=2 if can_start else None,
        recommendations=recommendations,
    )


# ── Feature 4: ERP Copilot (keyword NLP) ───────────────────────────────────

def erp_copilot(db: Session, query: str) -> CopilotResponse:
    q = query.lower().strip()

    if any(kw in q for kw in ["low stock", "reorder", "shortage"]):
        from app.services.inventory_service import get_low_stock_products
        items = get_low_stock_products(db)
        return CopilotResponse(
            query=query,
            answer=f"Found {len(items)} products below reorder level.",
            data=items,
            action_type="data",
        )

    if any(kw in q for kw in ["revenue", "sales", "income"]):
        from app.services.dashboard_service import get_kpis
        kpis = get_kpis(db)
        return CopilotResponse(
            query=query,
            answer=f"Monthly revenue is ${kpis.total_revenue.value:,.2f}.",
            data={"revenue": kpis.total_revenue.value},
            action_type="info",
        )

    if any(kw in q for kw in ["purchase suggestion", "buy", "restock"]):
        suggestions = get_procurement_suggestions(db)
        return CopilotResponse(
            query=query,
            answer=f"Found {len(suggestions)} purchase suggestions.",
            data=[s.model_dump() for s in suggestions],
            action_type="data",
        )

    if any(kw in q for kw in ["vendor", "supplier", "fastest"]):
        vendors = db.query(Vendor).filter(
            Vendor.deleted_at.is_(None)
        ).order_by(Vendor.lead_time_days).limit(5).all()
        return CopilotResponse(
            query=query,
            answer=f"Top vendor by lead time: {vendors[0].name if vendors else 'N/A'} ({vendors[0].lead_time_days if vendors else 'N/A'} days).",
            data=[{"name": v.name, "lead_time_days": v.lead_time_days, "rating": v.rating} for v in vendors],
            action_type="data",
        )

    if any(kw in q for kw in ["manufacturing", "production", "mo"]):
        active = db.query(func.count(ManufacturingOrder.id)).filter(
            ManufacturingOrder.status.in_(["draft", "ready", "in_progress"])
        ).scalar() or 0
        return CopilotResponse(
            query=query,
            answer=f"There are {active} active manufacturing orders.",
            data={"active_manufacturing_orders": active},
            action_type="info",
        )

    return CopilotResponse(
        query=query,
        answer="I can help with: low stock alerts, revenue, purchase suggestions, vendor lookup, or manufacturing status. Try asking about any of these!",
        data=None,
        action_type="info",
    )
