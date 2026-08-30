from sqlalchemy import Column, String, Float, DateTime, Text
from datetime import datetime

from app.database import Base


class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(String, primary_key=True, index=True)

    type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String, nullable=False)

    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

    datetime = Column(DateTime, nullable=False)

    media_name = Column(String, nullable=True)

    status = Column(String, default="pending", nullable=False)
    trust_score = Column(Float, default=0, nullable=False)