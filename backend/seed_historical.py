import os

# Bypass Windows AppLocker/Application Control DLL blocking
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

import random
from datetime import datetime, timezone
from app.database import Base, SessionLocal, engine
from app.models.historical import HistoricalWeather

Base.metadata.create_all(bind=engine)
db = SessionLocal()

CITIES = [
    {"city": "Kochi", "lat": 9.9312, "lng": 76.2673, "state": "Kerala"},
    {"city": "Mumbai", "lat": 19.0760, "lng": 72.8777, "state": "Maharashtra"},
    {"city": "Puri", "lat": 19.8135, "lng": 85.8312, "state": "Odisha"},
    {"city": "Guwahati", "lat": 26.1445, "lng": 91.7362, "state": "Assam"},
    {"city": "Jaisalmer", "lat": 26.9157, "lng": 70.9083, "state": "Rajasthan"},
]

records = []
now = datetime.now(timezone.utc)

print("Generating historical weather observations for ML training...")

for place in CITIES:
    for days_ago in range(30, 0, -1):
        timestamp = now - timedelta(days=days_ago)

        precip = round(random.choice([0.0, 0.0, 2.5, 12.0, 28.5, 45.0]), 1)
        temp = round(random.uniform(24.0, 42.0), 1)
        humidity = round(random.uniform(40.0, 95.0), 1)
        wind = round(random.uniform(5.0, 50.0), 1)
        code = 0 if precip == 0 else (63 if precip < 20 else 95)

        label = "Normal"
        if precip >= 25.0:
            label = "Flood"
        elif precip >= 10.0:
            label = "Heavy Rain"
        elif temp >= 40.0 and humidity < 45:
            label = "Heatwave"
        elif wind >= 40.0:
            label = "Storm"

        record = HistoricalWeather(
            city=place["city"],
            state=place["state"],
            lat=place["lat"],
            lng=place["lng"],
            recorded_at=timestamp,
            temperature=temp,
            humidity=humidity,
            precipitation=precip,
            wind_speed=wind,
            weather_code=code,
            disaster_label=label,
        )
        records.append(record)

db.bulk_save_objects(records)
db.commit()
db.close()

print(
    f"Successfully inserted {len(records)} historical weather records into the database."
)