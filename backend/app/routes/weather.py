from fastapi import APIRouter
from urllib.request import Request, urlopen
from pathlib import Path
from shapely.geometry import Point, shape
import json
import time

from ml.risk_classifier import classify_weather_risk

router = APIRouter(
    prefix="/api/weather",
    tags=["Weather"],
)

# ============================================================
# INDIA BOUNDARY
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]
INDIA_GEOJSON = BASE_DIR / "data" / "india.geojson"


def load_india_boundary():
    with open(INDIA_GEOJSON, "r", encoding="utf-8") as file:
        geojson = json.load(file)

    geometries = []

    if geojson["type"] == "FeatureCollection":
        for feature in geojson["features"]:
            geometries.append(shape(feature["geometry"]))

    elif geojson["type"] == "Feature":
        geometries.append(shape(geojson["geometry"]))

    else:
        geometries.append(shape(geojson))

    return geometries


INDIA_BOUNDARIES = load_india_boundary()

# ============================================================
# KNOWN INDIAN PLACES
# ============================================================

INDIAN_PLACES = [
    {"city": "Srinagar", "state": "Jammu and Kashmir", "lat": 34.0837, "lng": 74.7973},
    {"city": "Leh", "state": "Ladakh", "lat": 34.1526, "lng": 77.5771},
    {"city": "Shimla", "state": "Himachal Pradesh", "lat": 31.1048, "lng": 77.1734},
    {"city": "Dehradun", "state": "Uttarakhand", "lat": 30.3165, "lng": 78.0322},
    {"city": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lng": 76.7794},
    {"city": "Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"city": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    {"city": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462},
    {"city": "Patna", "state": "Bihar", "lat": 25.5941, "lng": 85.1376},
    {"city": "Guwahati", "state": "Assam", "lat": 26.1445, "lng": 91.7362},
    {"city": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714},
    {"city": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lng": 77.4126},
    {"city": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"city": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lng": 85.8245},
    {"city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"city": "Pune", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567},
    {"city": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    {"city": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lng": 83.2185},
    {"city": "Goa", "state": "Goa", "lat": 15.4909, "lng": 73.8278},
    {"city": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"city": "Mangaluru", "state": "Karnataka", "lat": 12.9141, "lng": 74.8560},
    {"city": "Mysuru", "state": "Karnataka", "lat": 12.2958, "lng": 76.6394},
    {"city": "Puttur", "state": "Karnataka", "lat": 12.7590, "lng": 75.2030},
    {"city": "Madikeri", "state": "Karnataka", "lat": 12.4244, "lng": 75.7382},
    {"city": "Kochi", "state": "Kerala", "lat": 9.9312, "lng": 76.2673},
    {"city": "Thiruvananthapuram", "state": "Kerala", "lat": 8.5241, "lng": 76.9366},
    {"city": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
]

# ============================================================
# INDIA WEATHER GRID
# ============================================================

def generate_india_grid():
    """
    Generate weather observation points across India.

    Uses approximately 2-degree spacing.
    Points are distributed across the complete India region.
    """

    locations = []

    min_lat = 8
    max_lat = 36

    min_lng = 68
    max_lng = 97

    step = 2.0

    lat = min_lat

    while lat <= max_lat:

        lng = min_lng

        while lng <= max_lng:

            locations.append({
                "lat": round(lat, 2),
                "lng": round(lng, 2),
            })

            lng += step

        lat += step

    return locations

def is_inside_india(lat, lng):
    point = Point(lng, lat)
    return any(boundary.contains(point) for boundary in INDIA_BOUNDARIES)


def filter_india_grid(locations):
    return [
        location
        for location in locations
        if is_inside_india(location["lat"], location["lng"])
    ]

INDIA_GRID = filter_india_grid(
    generate_india_grid()
)


# ============================================================
# FILTER GRID TO INDIA
# ============================================================

def is_inside_india(lat, lng):
    point = Point(lng, lat)

    return any(
        boundary.contains(point)
        for boundary in INDIA_BOUNDARIES
    )


def filter_india_grid(locations):
    return [
        location
        for location in locations
        if is_inside_india(
            location["lat"],
            location["lng"]
        )
    ]
# ============================================================
# FIND NEAREST KNOWN PLACE
# ============================================================

def find_nearest_place(lat, lng):
    """
    Find the nearest known Indian city/place to a weather grid point.
    """

    nearest = None
    min_distance = float("inf")

    for place in INDIAN_PLACES:

        distance = (
            (lat - place["lat"]) ** 2
            + (lng - place["lng"]) ** 2
        )

        if distance < min_distance:
            min_distance = distance
            nearest = place

    return nearest
# ============================================================
# CACHE
# ============================================================

WEATHER_CACHE = {
    "data": [],
    "timestamp": 0,
}

# Don't call Open-Meteo on every frontend refresh
CACHE_DURATION = 600  # 10 minutes


# ============================================================
# WEATHER CONDITION
# ============================================================

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


# ============================================================
# OPEN-METEO REQUEST
# ============================================================

def get_weather_data(locations):

    latitudes = ",".join(
        str(location["lat"])
        for location in locations
    )

    longitudes = ",".join(
        str(location["lng"])
        for location in locations
    )

    url = (
        "https://api.open-meteo.com/v1/forecast"
        f"?latitude={latitudes}"
        f"&longitude={longitudes}"
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
        }
    )

    with urlopen(request, timeout=30) as response:

        return json.loads(
            response.read().decode("utf-8")
        )


# ============================================================
# API
# ============================================================

@router.get("")
def get_weather():

    now = time.time()

    # --------------------------------------------------------
    # RETURN CACHED DATA
    # --------------------------------------------------------

    if (
        WEATHER_CACHE["data"]
        and now - WEATHER_CACHE["timestamp"] < CACHE_DURATION
    ):
        print("Returning cached weather data")

        return WEATHER_CACHE["data"]


    # --------------------------------------------------------
    # FETCH FRESH DATA
    # --------------------------------------------------------

    try:

        # Start with 50 points to avoid API rate limits.
        locations = INDIA_GRID[::4]

        raw_data = get_weather_data(locations)

        # Open-Meteo returns a list when multiple
        # coordinates are requested.
        if not isinstance(raw_data, list):
            raw_data = [raw_data]

        weather = []


        # ----------------------------------------------------
        # PROCESS EACH WEATHER POINT
        # ----------------------------------------------------

        for index, item in enumerate(raw_data):

            if index >= len(locations):
                break

            location = locations[index]

            current = item["current"]

            code = current["weather_code"]

            temperature = current["temperature_2m"]

            humidity = current["relative_humidity_2m"]

            precipitation = current["precipitation"]

            wind_speed = current["wind_speed_10m"]


            # ------------------------------------------------
            # ML RISK CLASSIFICATION
            # ------------------------------------------------

            ml_result = classify_weather_risk(
                temperature=temperature,
                humidity=humidity,
                precipitation=precipitation,
                wind_speed=wind_speed,
                weather_code=code,
            )


            # ------------------------------------------------
            # CREATE WEATHER OBJECT
            # ------------------------------------------------

            weather.append({
                "id": f"grid-{index}",

                "nearestPlace": find_nearest_place(
                    location["lat"],
                    location["lng"]
                ),

                "lat": location["lat"],

                "lng": location["lng"],

                "temperature": temperature,

                "humidity": humidity,

                "windSpeed": wind_speed,

                "precipitation": precipitation,

                "weatherCode": code,

                "condition": weather_condition(code),

                "weather": weather_condition(code),

                "updatedAt": current["time"],

                # --------------------------------------------
                # ML RESULTS
                # --------------------------------------------

                "classification": ml_result["classification"],

                "risk": ml_result["risk"],

                "confidence": ml_result["confidence"],
            })


        # ----------------------------------------------------
        # SAVE CACHE
        # ----------------------------------------------------

        WEATHER_CACHE["data"] = weather

        WEATHER_CACHE["timestamp"] = now

        print(
            f"Weather loaded successfully: {len(weather)} points"
        )

        return weather


    except Exception as error:

        print(
            f"Weather API failed: {error}"
        )

        # ----------------------------------------------------
        # FALLBACK TO OLD CACHE
        # ----------------------------------------------------

        if WEATHER_CACHE["data"]:

            print("Returning stale weather cache")

            return WEATHER_CACHE["data"]

        return []