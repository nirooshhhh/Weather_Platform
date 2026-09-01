from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import Counter, defaultdict
from datetime import datetime

from app.database import get_db
from app.models.event import WeatherEvent

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
)


def parse_datetime(value: str):
    """
    Convert the WeatherEvent datetime string into a Python datetime.
    Handles ISO strings with timezone.
    """
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except Exception:
        return None


@router.get("")
def get_analytics(db: Session = Depends(get_db)):

    events = (
        db.query(WeatherEvent)
        .order_by(WeatherEvent.datetime.asc())
        .all()
    )

    # =========================================================
    # Empty database
    # =========================================================

    if not events:
        return {
            "eventsOverTime": [],
            "typeDistribution": [],
            "stateWise": [],
            "verification": [
                {"name": "Verified", "value": 0},
                {"name": "Pending", "value": 0},
                {"name": "High Risk", "value": 0},
            ],
            "highRiskTrend": [],
        }

    # =========================================================
    # Events over time
    # =========================================================

    events_by_date = defaultdict(int)
    verified_by_date = defaultdict(int)

    # =========================================================
    # Type distribution
    # =========================================================

    type_counter = Counter()

    # =========================================================
    # State-wise distribution
    # =========================================================

    state_counter = Counter()

    # =========================================================
    # Verification status
    # =========================================================

    status_counter = Counter()

    # =========================================================
    # High-risk monthly trend
    # =========================================================

    monthly_total = Counter()
    monthly_high_risk = Counter()

    for event in events:

        parsed = parse_datetime(event.datetime)

        if not parsed:
            continue

        date_key = parsed.strftime("%Y-%m-%d")
        month_key = parsed.strftime("%Y-%m")

        # Events over time
        events_by_date[date_key] += 1

        if event.status == "verified":
            verified_by_date[date_key] += 1

        # Type
        type_counter[event.type] += 1

        # State
        state_counter[event.state] += 1

        # Status
        if event.status in ["verified", "pending", "high-risk"]:
            status_counter[event.status] += 1

        # Monthly trend
        monthly_total[month_key] += 1

        if event.status == "high-risk":
            monthly_high_risk[month_key] += 1

    # =========================================================
    # Events over time
    # Last 8 available dates
    # =========================================================

    sorted_dates = sorted(events_by_date.keys())[-8:]

    events_over_time = []

    for date in sorted_dates:

        try:
            formatted_date = datetime.strptime(
                date,
                "%Y-%m-%d"
            ).strftime("%b %d")
        except Exception:
            formatted_date = date

        events_over_time.append({
            "date": formatted_date,
            "events": events_by_date[date],
            "verified": verified_by_date.get(date, 0),
        })

    # =========================================================
    # Type distribution
    # =========================================================

    type_distribution = [
        {
            "type": event_type,
            "value": count,
        }
        for event_type, count in type_counter.most_common()
    ]

    # =========================================================
    # State-wise distribution
    # =========================================================

    state_wise = [
        {
            "state": state,
            "events": count,
        }
        for state, count in state_counter.most_common()
    ]

    # =========================================================
    # Verification distribution
    # =========================================================

    verification = [
        {
            "name": "Verified",
            "value": status_counter.get("verified", 0),
        },
        {
            "name": "Pending",
            "value": status_counter.get("pending", 0),
        },
        {
            "name": "High Risk",
            "value": status_counter.get("high-risk", 0),
        },
    ]

    # =========================================================
    # High-risk trend
    # Last 6 available months
    # =========================================================

    sorted_months = sorted(monthly_total.keys())[-6:]

    high_risk_trend = []

    for month in sorted_months:

        try:
            formatted_month = datetime.strptime(
                month,
                "%Y-%m"
            ).strftime("%b")
        except Exception:
            formatted_month = month

        high_risk_trend.append({
            "month": formatted_month,
            "highRisk": monthly_high_risk.get(month, 0),
            "total": monthly_total[month],
        })

    # =========================================================
    # Final response
    # =========================================================

    return {
        "eventsOverTime": events_over_time,
        "typeDistribution": type_distribution,
        "stateWise": state_wise,
        "verification": verification,
        "highRiskTrend": high_risk_trend,
    }