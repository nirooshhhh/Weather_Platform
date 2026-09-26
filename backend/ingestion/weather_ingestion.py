import json
from urllib.request import Request, urlopen


# ============================================================
# WEATHER INGESTION
# ============================================================

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


def fetch_weather(latitude: float, longitude: float):
    """
    Fetch current weather from Open-Meteo
    for a single geographic location.
    """

    url = (
        f"{OPEN_METEO_URL}"
        f"?latitude={latitude}"
        f"&longitude={longitude}"
        "&current="
        "temperature_2m,"
        "relative_humidity_2m,"
        "precipitation,"
        "weather_code,"
        "wind_speed_10m"
        "&timezone=Asia%2FKolkata"
    )

    request = Request(
        url,
        headers={
            "User-Agent": "WeatherPulseIndia/1.0"
        },
    )

    with urlopen(request, timeout=15) as response:
        data = json.loads(
            response.read().decode("utf-8")
        )

    return data


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_weather(
    latitude: float,
    longitude: float,
    data: dict,
):
    """
    Convert Open-Meteo response into
    WeatherPulse's standard format.
    """

    current = data["current"]

    weather_code = current["weather_code"]

    return {
        "lat": latitude,
        "lng": longitude,

        "temperature": current["temperature_2m"],

        "humidity": current[
            "relative_humidity_2m"
        ],

        "precipitation": current[
            "precipitation"
        ],

        "windSpeed": current[
            "wind_speed_10m"
        ],

        "weatherCode": weather_code,

        "updatedAt": current["time"],
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    latitude = 12.9716
    longitude = 77.5946

    print("Fetching live weather...")

    raw = fetch_weather(
        latitude,
        longitude,
    )

    weather = normalize_weather(
        latitude,
        longitude,
        raw,
    )

    print(json.dumps(
        weather,
        indent=2
    ))