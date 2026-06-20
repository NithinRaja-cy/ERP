from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.services.dashboard_service import get_kpis, get_charts
from app.schemas.dashboard import DashboardKPIs, DashboardCharts

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=DashboardKPIs)
def kpis(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_kpis(db)


@router.get("/charts", response_model=DashboardCharts)
def charts(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return get_charts(db)
