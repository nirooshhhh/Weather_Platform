import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.report import CitizenReport
from app.schemas.report import (
    CitizenReportCreate,
    CitizenReportResponse,
)


router = APIRouter(
    prefix="/api/reports",
    tags=["Citizen Reports"],
)


@router.post("", response_model=CitizenReportResponse)
def submit_report(
    report: CitizenReportCreate,
    db: Session = Depends(get_db),
):
    report_id = f"rep-{uuid.uuid4().hex[:10]}"

    new_report = CitizenReport(
        id=report_id,
        type=report.type,
        description=report.description,
        location=report.location,
        lat=report.lat,
        lng=report.lng,
        datetime=report.datetime,
        media_name=report.media_name,
        status="pending",
        trust_score=0,
    )

    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    return {
        "id": new_report.id,
        "status": "received",
    }