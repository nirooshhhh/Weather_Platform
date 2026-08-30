from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class WeatherEventResponse(BaseModel):
    id: str
    type: str
    title: str

    state: str
    city: str

    lat: float
    lng: float

    datetime: str

    description: str

    source: str
    sourceName: str

    trustScore: int
    status: str

    mediaUrl: Optional[str] = None

    mlClassification: str
    mlConfidence: float

    affectedPopulation: Optional[int] = None

    class Config:
        from_attributes = True