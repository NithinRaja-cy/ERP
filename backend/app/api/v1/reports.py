from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.report_service import (
    generate_sales_report_pdf, generate_sales_report_excel,
    generate_inventory_report_pdf, generate_purchase_report_excel,
    generate_manufacturing_report_excel,
)

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])


@router.get("/sales/pdf")
def sales_pdf(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    sd = datetime.fromisoformat(start_date) if start_date else None
    ed = datetime.fromisoformat(end_date) if end_date else None
    data = generate_sales_report_pdf(db, sd, ed)
    return Response(content=data, media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=sales_report.pdf"})


@router.get("/sales/excel")
def sales_excel(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    sd = datetime.fromisoformat(start_date) if start_date else None
    ed = datetime.fromisoformat(end_date) if end_date else None
    data = generate_sales_report_excel(db, sd, ed)
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=sales_report.xlsx"},
    )


@router.get("/inventory/pdf")
def inventory_pdf(db: Session = Depends(get_db), _=Depends(get_current_user)):
    data = generate_inventory_report_pdf(db)
    return Response(content=data, media_type="application/pdf",
                    headers={"Content-Disposition": "attachment; filename=inventory_report.pdf"})


@router.get("/purchases/excel")
def purchases_excel(db: Session = Depends(get_db), _=Depends(get_current_user)):
    data = generate_purchase_report_excel(db)
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=purchases_report.xlsx"},
    )


@router.get("/manufacturing/excel")
def manufacturing_excel(db: Session = Depends(get_db), _=Depends(get_current_user)):
    data = generate_manufacturing_report_excel(db)
    return Response(
        content=data,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=manufacturing_report.xlsx"},
    )
