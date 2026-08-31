from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import WeatherEvent
from app.models.report import CitizenReport

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):

    # ---------------------------------------------------------
    # WEATHER EVENTS
    # ---------------------------------------------------------

    total_events = db.query(WeatherEvent).count()

    verified_events = (
        db.query(WeatherEvent)
        .filter(WeatherEvent.status == "verified")
        .count()
    )

    high_risk_events = (
        db.query(WeatherEvent)
        .filter(WeatherEvent.status == "high-risk")
        .count()
    )

    # ---------------------------------------------------------
    # CITIZEN REPORTS
    # ---------------------------------------------------------

    pending_reports = (
        db.query(CitizenReport)
        .filter(CitizenReport.status == "pending")
        .count()
    )

    verified_reports = (
        db.query(CitizenReport)
        .filter(CitizenReport.status == "verified")
        .count()
    )

    # ---------------------------------------------------------
    # RETURN DASHBOARD DATA
    # ---------------------------------------------------------

    return {
        "totalEvents": total_events,
        "verifiedReports": verified_reports,
        "pendingReports": pending_reports,
        "highRiskEvents": high_risk_events,

        # Keep these for the existing frontend.
        # We can calculate real historical deltas later.
        "totalDelta": 0,
        "verifiedDelta": 0,
        "pendingDelta": 0,
        "highRiskDelta": 0,
    }