from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime, timezone
from app.database import Base

class UserReport(Base):
    __tablename__ = "user_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String, nullable=False)  # Flood, Heavy Rain, Storm, Heatwave, Landslide
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    upvotes = Column(Integer, default=1)
    status = Column(String, default="pending")  # pending, verified, high-risk
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

# Alias CitizenReport to UserReport for compatibility with existing routes
CitizenReport = UserReport