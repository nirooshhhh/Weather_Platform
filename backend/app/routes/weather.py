from fastapi import APIRouter
from urllib.request import Request, urlopen
import json

router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"],
)


INDIAN_LOCATIONS = [
    {"city": "Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    {"city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"city": "Pune", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567},
    {"city": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714},
    {"city": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    {"city": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462},
    {"city": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lng": 77.4126},
    {"city": "Patna", "state": "Bihar", "lat": 25.5941, "lng": 85.1376},
    {"city": "Guwahati", "state": "Assam", "lat": 26.1445, "lng": 91.7362},
    {"city": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lng": 85.8245},
    {"city": "Kochi", "state": "Kerala", "lat": 9.9312, "lng": 76.2673},
    {"city": "Mangaluru", "state": "Karnataka", "lat": 12.9141, "lng": 74.8560},
    {"city": "Puttur", "state": "Karnataka", "lat": 12.7590, "lng": 75.2030},
    {"city": "Madikeri", "state": "Karnataka", "lat": 12.4244, "lng": 75.7382},
    {"city": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lng": 83.2185},
    {"city": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lng": 76.7794},
]


def get_weather_data(location):
    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={location['lat']}"
        f"&longitude={location['lng']}"
        "&current=temperature_2m,relative_humidity_2m,"
        "precipitation,weather_code,wind_speed_10m"
        "&timezone=Asia%2FKolkata"
    )

    request = Request(
        url,
        headers={
            "User-Agent": "WeatherPulseIndia/1.0"
        },
    )

    with urlopen(request, timeout=10) as response:
        data = json.loads(response.read().decode("utf-8"))

    current = data["current"]

    return {
        "id": f"{location['city'].lower()}-{location['state'].lower().replace(' ', '-')}",
        "city": location["city"],
        "state": location["state"],
        "lat": location["lat"],
        "lng": location["lng"],
        "temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "windSpeed": current["wind_speed_10m"],
        "precipitation": current["precipitation"],
        "weatherCode": current["weather_code"],
        "condition": weather_condition(current["weather_code"]),
        "weather": weather_condition(current["weather_code"]),
        "updatedAt": current["time"],
    }


def weather_condition(code: int) -> str:
    if code == 0:
        return "Clear Sky"

    if code in [1, 2, 3]:
        return "Partly Cloudy"

    if code in [45, 48]:
        return "Fog"

    if code in [51, 53, 55, 56, 57]:
        return "Drizzle"

    if code in [61, 63, 65, 66, 67]:
        return "Rain"

    if code in [71, 73, 75, 77]:
        return "Snow"

    if code in [80, 81, 82]:
        return "Rain Showers"

    if code in [85, 86]:
        return "Snow Showers"

    if code in [95, 96, 99]:
        return "Thunderstorm"

    return "Unknown"


@router.get("")
def get_weather():
    weather = []

    for location in INDIAN_LOCATIONS:
        try:
            weather.append(get_weather_data(location))
        except Exception as error:
            print(
                f"Weather API failed for {location['city']}: {error}"
            )

    return weather