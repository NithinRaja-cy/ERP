from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.schemas.ai import (
    DemandForecastResponse, ProcurementSuggestion,
    ManufacturingAssistantRequest, ManufacturingAssistantResponse,
    CopilotRequest, CopilotResponse,
)
from app.services.ai_service import (
    forecast_demand, get_procurement_suggestions,
    manufacturing_assistant, erp_copilot,
)

router = APIRouter(prefix="/api/v1/ai", tags=["AI"])


@router.get("/forecast/{product_id}", response_model=DemandForecastResponse)
def demand_forecast(product_id: str, days: int = Query(30, ge=7, le=90), db: Session = Depends(get_db), _=Depends(get_current_user)):
    return forecast_demand(db, product_id, days)


@router.get("/procurement-suggestions", response_model=list[ProcurementSuggestion])
def procurement_suggestions(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_procurement_suggestions(db)


@router.post("/manufacturing-assistant", response_model=ManufacturingAssistantResponse)
def mfg_assistant(data: ManufacturingAssistantRequest, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return manufacturing_assistant(db, data.manufacturing_order_id)


@router.post("/copilot", response_model=CopilotResponse)
def copilot(data: CopilotRequest, db: Session = Depends(get_db), _=Depends(get_current_user)):
    return erp_copilot(db, data.query)
