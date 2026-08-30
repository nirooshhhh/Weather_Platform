import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.report import CitizenReport
from app.models.event import WeatherEvent

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)


@router.get("/reports")
def get_reports(
    status: str = "pending",
    db: Session = Depends(get_db),
):
    reports = (
        db.query(CitizenReport)
        .filter(CitizenReport.status == status)
        .order_by(CitizenReport.datetime.desc())
        .all()
    )

    return [
        {
            "id": report.id,
            "type": report.type,
            "location": report.location,
            "source": "Citizen Report",
            "trustScore": report.trust_score,
            "status": report.status,
            "datetime": report.datetime,
            "description": report.description,
            "mediaUrl": report.media_name,
            "mlClassification": "Pending ML classification",
        }
        for report in reports
    ]


@router.post("/reports/{report_id}/verify")
def verify_report(
    report_id: str,
    db: Session = Depends(get_db),
):
    report = (
        db.query(CitizenReport)
        .filter(CitizenReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    # Already verified
    if report.status == "verified":
        return {
            "id": report.id,
            "status": "verified",
        }

    # Coordinates are required for displaying the event on the map
    if report.lat is None or report.lng is None:
        raise HTTPException(
            status_code=400,
            detail="Cannot approve report without latitude and longitude",
        )

    # Mark citizen report as verified
    report.status = "verified"
    report.trust_score = max(report.trust_score, 80)

    # Create a WeatherEvent from the approved citizen report
    weather_event = WeatherEvent(
        id=f"evt-{uuid.uuid4().hex[:10]}",
        type=report.type,
        title=f"{report.type} reported in {report.location}",
        state="Unknown",
        city=report.location,
        lat=report.lat,
        lng=report.lng,
        datetime=report.datetime.isoformat(),
        description=report.description,
        source="Citizen Report",
        source_name="Verified Citizen",
        trust_score=report.trust_score,
        status="verified",
        media_url=report.media_name,
        ml_classification=report.type,
        ml_confidence=0.80,
        affected_population=0,
    )

    db.add(weather_event)
    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "status": "verified",
    }


@router.post("/reports/{report_id}/reject")
def reject_report(
    report_id: str,
    db: Session = Depends(get_db),
):
    report = (
        db.query(CitizenReport)
        .filter(CitizenReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=404,
            detail="Report not found",
        )

    report.status = "rejected"

    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "status": "rejected",
    }