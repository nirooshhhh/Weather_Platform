import os
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

import urllib.request
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.report import UserReport
from app.schemas.report import ReportCreate, ReportResponse
from app.services.ml_classifier import predict_disaster_risk

router = APIRouter()

def fetch_live_telemetry(lat: float, lng: float):
    """Fetch real-time Open-Meteo telemetry for specific coordinates."""
    try:
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code"
        req = urllib.request.Request(url, headers={'User-Agent': 'WeatherPulse/1.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            current = data.get("current", {})
            return {
                "temperature": current.get("temperature_2m", 25.0),
                "humidity": current.get("relative_humidity_2m", 50.0),
                "precipitation": current.get("precipitation", 0.0),
                "wind_speed": current.get("wind_speed_10m", 10.0),
                "weather_code": current.get("weather_code", 0)
            }
    except Exception as e:
        print(f"Telemetry fetch warning: {e}")
        return None

def compute_real_trust_score(report: UserReport) -> dict:
    """Cross-reference report event_type against live Open-Meteo telemetry & ML prediction."""
    telemetry = fetch_live_telemetry(report.lat, report.lng)
    
    if not telemetry:
        # If external API is unreachable, default base score based on community upvotes
        base_score = min(30 + (report.upvotes * 10), 60)
        return {"trust_score": base_score, "ml_match": "Telemetry Unavailable"}

    # Pass live telemetry into trained ML classifier
    ml_result = predict_disaster_risk(
        temperature=telemetry["temperature"],
        humidity=telemetry["humidity"],
        precipitation=telemetry["precipitation"],
        wind_speed=telemetry["wind_speed"],
        weather_code=telemetry["weather_code"]
    )
    
    predicted_event = ml_result["classification"]
    ml_confidence = ml_result["confidence"]
    precip = telemetry["precipitation"]
    wind = telemetry["wind_speed"]

    reported = report.event_type.lower()
    
    # 1. Check for Direct Contradictions (Fake/Unverified Reports)
    if ("rain" in reported or "flood" in reported) and precip == 0.0:
        trust_score = int(15 + (report.upvotes * 5))  # Low trust score (15% - 25%)
        ml_match = f"Contradiction: Live rain is 0.0mm at location"
    elif "storm" in reported and wind < 15.0:
        trust_score = int(20 + (report.upvotes * 5))
        ml_match = f"Contradiction: Live wind speed is only {wind}km/h"
    
    # 2. Check for Strong Telemetry & ML Correlation
    elif reported in predicted_event.lower() or predicted_event.lower() in reported:
        trust_score = int(min(75 + (ml_confidence * 20) + (report.upvotes * 2), 98))
        ml_match = f"Verified by ML Model ({predicted_event}, {int(ml_confidence * 100)}% conf)"
    
    # 3. Moderate Correlation
    elif precip > 5.0 and ("rain" in reported or "flood" in reported):
        trust_score = int(min(65 + (precip * 0.5), 88))
        ml_match = f"Correlated with live telemetry ({precip}mm rain)"
    else:
        trust_score = 40 + (report.upvotes * 5)
        ml_match = f"Unverified: Live condition is {predicted_event}"

    return {"trust_score": trust_score, "ml_match": ml_match}


@router.get("/admin/reports")
def get_admin_reports(status: str = "pending", db: Session = Depends(get_db)):
    reports = db.query(UserReport).filter(UserReport.status == status).order_by(UserReport.created_at.desc()).all()
    
    response = []
    for r in reports:
        verification = compute_real_trust_score(r)
        response.append({
            "id": r.id,
            "event_type": r.event_type,
            "title": r.title,
            "description": r.description,
            "lat": r.lat,
            "lng": r.lng,
            "upvotes": r.upvotes,
            "status": r.status,
            "created_at": r.created_at,
            "trust_score": verification["trust_score"],
            "ml_classification": verification["ml_match"]
        })
    return response


@router.post("/admin/reports/{report_id}/verify")
def verify_admin_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(UserReport).filter(UserReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "verified"
    db.commit()
    return {"id": str(report.id), "status": "verified"}


@router.post("/admin/reports/{report_id}/reject")
def reject_admin_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(UserReport).filter(UserReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = "rejected"
    db.commit()
    return {"id": str(report.id), "status": "rejected"}

@router.post("/", response_model=ReportResponse)
def submit_report(report_data: ReportCreate, db: Session = Depends(get_db)):
    new_report = UserReport(
        event_type=report_data.event_type,
        title=report_data.title,
        description=report_data.description,
        lat=report_data.lat,
        lng=report_data.lng,
        status="pending",
        upvotes=1,
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report