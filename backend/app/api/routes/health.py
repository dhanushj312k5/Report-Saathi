from fastapi import APIRouter
import shutil
import os
import pytesseract

from app.core.config import settings
from app.models.schemas import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    """
    Returns system health status, tesseract binary presence and version,
    and configured capabilities.
    """
    tesseract_version = None
    tesseract_found = False
    
    try:
        if settings.TESSERACT_CMD and os.path.exists(settings.TESSERACT_CMD):
            pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
            tesseract_version = str(pytesseract.get_tesseract_version())
            tesseract_found = True
        elif shutil.which("tesseract"):
            tesseract_version = str(pytesseract.get_tesseract_version())
            tesseract_found = True
    except Exception:
        tesseract_found = False

    return HealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME + " Backend API",
        tesseract_installed=tesseract_found,
        tesseract_version=tesseract_version,
        gemini_configured=bool(settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key_here"),
        supported_formats=["pdf", "jpg", "jpeg", "png"],
        max_file_size_mb=10
    )
