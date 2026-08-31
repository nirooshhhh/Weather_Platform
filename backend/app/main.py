from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routes.events import router as events_router
from app.routes.dashboard import router as dashboard_router
from app.routes.alerts import router as alerts_router
from app.routes.reports import router as reports_router
from app.routes.admin import router as admin_router
from app.routes import weather

# Import models so SQLAlchemy knows about them
from app.models import event
from app.models import report

Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="WeatherPulse India API",
    description="National Weather Big Data Analytics Platform",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(events_router)
app.include_router(dashboard_router)
app.include_router(alerts_router)
app.include_router(reports_router)
app.include_router(admin_router)
app.include_router(weather.router)

@app.get("/")
def root():
    return {
        "name": "WeatherPulse India",
        "status": "running",
        "message": "National Weather Intelligence API",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
    }