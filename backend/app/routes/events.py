from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.event import WeatherEvent
from app.schemas.event import WeatherEventResponse

router = APIRouter(
    prefix="/api/events",
    tags=["Events"],
)


def event_to_response(event: WeatherEvent) -> dict:
    return {
        "id": event.id,
        "type": event.type,
        "title": event.title,
        "state": event.state,
        "city": event.city,
        "lat": event.lat,
        "lng": event.lng,
        "datetime": event.datetime,
        "description": event.description,
        "source": event.source,
        "sourceName": event.source_name,
        "trustScore": event.trust_score,
        "status": event.status,
        "mediaUrl": event.media_url,
        "mlClassification": event.ml_classification,
        "mlConfidence": event.ml_confidence,
        "affectedPopulation": event.affected_population,
    }


@router.get("", response_model=list[WeatherEventResponse])
def get_events(db: Session = Depends(get_db)):
    events = db.query(WeatherEvent).all()

    return [event_to_response(event) for event in events]


@router.get("/{event_id}", response_model=WeatherEventResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = (
        db.query(WeatherEvent)
        .filter(WeatherEvent.id == event_id)
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=404,
            detail="Weather event not found",
        )

    return event_to_response(event)