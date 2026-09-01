from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import WeatherEvent

router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"],
)


@router.get("")
def get_alerts(db: Session = Depends(get_db)):

    events = (
        db.query(WeatherEvent)
        .filter(
            WeatherEvent.status.in_(["verified", "high-risk"])
        )
        .order_by(WeatherEvent.datetime.desc())
        .all()
    )

    alerts = []

    for event in events:

        if event.status == "high-risk":
            severity = "critical"
        elif event.trust_score >= 90:
            severity = "severe"
        else:
            severity = "moderate"

        alerts.append({
            "id": f"alt-{event.id}",
            "type": event.type,
            "title": event.title,
            "location": (
                event.city
                if event.state.lower() in event.city.lower()
                else f"{event.city}, {event.state}"
            ),
            "severity": severity,
            "datetime": event.datetime,
        })

    return alerts