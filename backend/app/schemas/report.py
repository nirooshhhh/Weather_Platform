from datetime import datetime

from pydantic import BaseModel


class CitizenReportCreate(BaseModel):
    type: str
    description: str
    location: str
    lat: float | None = None
    lng: float | None = None
    datetime: datetime
    media_name: str | None = None


class CitizenReportResponse(BaseModel):
    id: str
    status: str

    class Config:
        from_attributes = True