from sqlalchemy import Column, Float, Integer, String, Text

from app.database import Base


class WeatherEvent(Base):
    __tablename__ = "weather_events"

    id = Column(String, primary_key=True, index=True)

    type = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)

    state = Column(String, nullable=False, index=True)
    city = Column(String, nullable=False)

    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)

    datetime = Column(String, nullable=False)

    description = Column(Text, nullable=False)

    source = Column(String, nullable=False)
    source_name = Column(String, nullable=False)

    trust_score = Column(Integer, nullable=False)

    status = Column(String, nullable=False, index=True)

    media_url = Column(String, nullable=True)

    ml_classification = Column(String, nullable=False)
    ml_confidence = Column(Float, nullable=False)

    affected_population = Column(Integer, nullable=True)