import uuid
import json
from urllib.parse import quote
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.report import CitizenReport
from app.models.event import WeatherEvent


router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
)


def geocode_location(location: str):
    """
    Convert a location such as:
    'Puttur, Karnataka'

    into:
    latitude, longitude, city, state
    """

    url = (
        "https://nominatim.openstreetmap.org/search"
        f"?q={quote(location + ', India')}"
        "&format=json"
        "&addressdetails=1"
        "&limit=1"
    )

    request = Request(
        url,
        headers={
            "User-Agent": "WeatherPulseIndia/1.0"
        },
    )

    try:
        with urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))

        if not data:
            return None

        result = data[0]
        address = result.get("address", {})

        city = (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("municipality")
            or address.get("county")
            or location
        )

        state = address.get("state") or "Unknown"

        return {
            "lat": float(result["lat"]),
            "lng": float(result["lon"]),
            "city": city,
            "state": state,
        }

    except (URLError, HTTPError, TimeoutError, ValueError, KeyError):
        return None


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

    # ---------------------------------------------------------
    # STEP 1: Get coordinates
    # ---------------------------------------------------------

    latitude = report.lat
    longitude = report.lng

    city = report.location
    state = "Unknown"

    # If GPS coordinates were already supplied, use them.
    if latitude is not None and longitude is not None:

        # Still try to determine the proper city/state
        location_data = geocode_location(report.location)

        if location_data:
            city = location_data["city"]
            state = location_data["state"]

    # If the citizen manually entered a location,
    # automatically find its coordinates.
    else:

        location_data = geocode_location(report.location)

        if not location_data:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Could not find coordinates for '{report.location}'. "
                    "Please enter a valid city or location in India."
                ),
            )

        latitude = location_data["lat"]
        longitude = location_data["lng"]
        city = location_data["city"]
        state = location_data["state"]

        # Save the coordinates back into the citizen report
        report.lat = latitude
        report.lng = longitude

    # ---------------------------------------------------------
    # STEP 2: Verify citizen report
    # ---------------------------------------------------------

    report.status = "verified"
    report.trust_score = max(report.trust_score, 80)

    # ---------------------------------------------------------
    # STEP 3: Create WeatherEvent
    # ---------------------------------------------------------

    weather_event = WeatherEvent(
        id=f"evt-{uuid.uuid4().hex[:10]}",
        type=report.type,
        title=f"{report.type} reported in {city}",
        state=state,
        city=city,
        lat=latitude,
        lng=longitude,
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