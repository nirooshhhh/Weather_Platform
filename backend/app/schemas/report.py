from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReportCreate(BaseModel):
    event_type: str
    title: str
    description: Optional[str] = None
    lat: float
    lng: float

class ReportResponse(BaseModel):
    id: int
    event_type: str
    title: str
    description: Optional[str]
    lat: float
    lng: float
    upvotes: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True