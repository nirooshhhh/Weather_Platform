from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import WeatherEvent

router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"],
)


@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_events = db.query(WeatherEvent).count()

    verified_reports = (
        db.query(WeatherEvent)
        .filter(WeatherEvent.status == "verified")
        .count()
    )

    pending_reports = (
        db.query(WeatherEvent)
        .filter(WeatherEvent.status == "pending")
        .count()
    )

    high_risk_events = (
        db.query(WeatherEvent)
        .filter(WeatherEvent.status == "high-risk")
        .count()
    )

    return {
        "totalEvents": total_events,
        "verifiedReports": verified_reports,
        "pendingReports": pending_reports,
        "highRiskEvents": high_risk_events,

        # These will later be calculated from historical data.
        "totalDelta": 0,
        "verifiedDelta": 0,
        "pendingDelta": 0,
        "highRiskDelta": 0,
    }