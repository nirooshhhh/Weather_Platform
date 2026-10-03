from sqlalchemy import Column, Float, Integer, String, DateTime
from app.database import Base

class HistoricalWeather(Base):
    __tablename__ = "historical_weather"

    id = Column(Integer, primary_key=True, autoincrement=True)
    city = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False, index=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    recorded_at = Column(DateTime, nullable=False, index=True)
    
    # Weather feature metrics
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    precipitation = Column(Float, nullable=False)
    wind_speed = Column(Float, nullable=False)
    weather_code = Column(Integer, nullable=False)
    
    # Target label for ML training (0 = Normal, 1 = Heavy Rain, 2 = Flood, 3 = Storm, 4 = Heatwave)
    disaster_label = Column(String, default="Normal", nullable=False)