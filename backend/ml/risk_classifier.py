from typing import Dict, Any


def classify_weather_risk(
    temperature: float,
    humidity: float,
    precipitation: float,
    wind_speed: float,
    weather_code: int,
) -> Dict[str, Any]:

    risks = []

    # ---------------------------------------------------------
    # HEAVY RAIN / FLOOD RISK
    # ---------------------------------------------------------

    if precipitation >= 20:
        risks.append(("Flood", 0.95))

    elif precipitation >= 10:
        risks.append(("Heavy Rain", 0.85))

    elif precipitation >= 5:
        risks.append(("Heavy Rain", 0.70))

    # ---------------------------------------------------------
    # THUNDERSTORM / STORM RISK
    # ---------------------------------------------------------

    if weather_code in [95, 96, 99]:

        confidence = 0.90

        if wind_speed >= 40:
            confidence = 0.97

        risks.append(("Storm", confidence))

    # ---------------------------------------------------------
    # HEATWAVE RISK
    # ---------------------------------------------------------

    if temperature >= 45:

        risks.append(("Heatwave", 0.98))

    elif temperature >= 40 and humidity < 40:

        risks.append(("Heatwave", 0.90))

    # ---------------------------------------------------------
    # GENERAL RAIN
    # ---------------------------------------------------------

    if weather_code in [61, 63, 65, 80, 81, 82]:

        risks.append(("Heavy Rain", 0.80))

    # ---------------------------------------------------------
    # NO SIGNIFICANT RISK
    # ---------------------------------------------------------

    if not risks:

        return {
            "classification": "Normal Weather",
            "risk": "low",
            "confidence": 0.90,
        }

    # Pick highest-confidence classification
    classification, confidence = max(
        risks,
        key=lambda x: x[1]
    )

    # ---------------------------------------------------------
    # RISK LEVEL
    # ---------------------------------------------------------

    if confidence >= 0.95:
        risk = "critical"

    elif confidence >= 0.85:
        risk = "high"

    elif confidence >= 0.70:
        risk = "moderate"

    else:
        risk = "low"

    return {
        "classification": classification,
        "risk": risk,
        "confidence": confidence,
    }


# -------------------------------------------------------------
# TEST
# -------------------------------------------------------------

if __name__ == "__main__":

    test_cases = [
        {
            "name": "Normal Weather",
            "temperature": 21.3,
            "humidity": 89,
            "precipitation": 0.0,
            "wind_speed": 8.8,
            "weather_code": 1,
        },
        {
            "name": "Heavy Rain",
            "temperature": 25,
            "humidity": 92,
            "precipitation": 15.0,
            "wind_speed": 18,
            "weather_code": 63,
        },
        {
            "name": "Thunderstorm",
            "temperature": 28,
            "humidity": 85,
            "precipitation": 8.0,
            "wind_speed": 45,
            "weather_code": 95,
        },
        {
            "name": "Heatwave",
            "temperature": 46,
            "humidity": 30,
            "precipitation": 0.0,
            "wind_speed": 12,
            "weather_code": 0,
        },
        {
            "name": "Flood Risk",
            "temperature": 27,
            "humidity": 95,
            "precipitation": 25.0,
            "wind_speed": 20,
            "weather_code": 65,
        },
    ]

    for test in test_cases:

        result = classify_weather_risk(
            temperature=test["temperature"],
            humidity=test["humidity"],
            precipitation=test["precipitation"],
            wind_speed=test["wind_speed"],
            weather_code=test["weather_code"],
        )

        print(f"\n{test['name']}")
        print(result)