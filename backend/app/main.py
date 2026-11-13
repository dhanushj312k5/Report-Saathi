from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api.routes import health, reports

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("ReportSaathi")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Educational Medical Laboratory Report Explainer API",
    version="1.0.0"
)

# CORS configuration
origins = settings.ALLOWED_ORIGINS if isinstance(settings.ALLOWED_ORIGINS, list) else [str(settings.ALLOWED_ORIGINS)]
use_wildcard = "*" in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if use_wildcard else origins,
    allow_credentials=not use_wildcard,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

@app.get("/")
def root():
    return {
        "message": "Welcome to ReportSaathi API. Visit /docs for OpenAPI documentation.",
        "project": settings.PROJECT_NAME,
        "status": "online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
