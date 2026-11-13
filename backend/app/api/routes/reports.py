import os
import re
import tempfile
import logging
from typing import Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Query, Body

from app.models.schemas import (
    ReportAnalysisResponse,
    ReportChatRequest,
    ReportChatResponse,
    TelegramNotificationRequest,
    TelegramNotificationResponse
)
from app.services.extractor import (
    extract_from_pdf_file,
    extract_from_image_file
)
from app.services.analyzer import analyze_report_with_gemini
from app.services.chat_service import handle_report_chat
from app.services.telegram_service import send_telegram_notification
from app.services.supabase_client import (
    save_report_to_supabase,
    fetch_user_reports_from_supabase,
    delete_report_from_supabase,
    is_supabase_enabled
)

router = APIRouter()
logger = logging.getLogger(__name__)

# Constants
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

@router.post("/analyze", response_model=ReportAnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_report_file(
    file: UploadFile = File(...)
):
    """
    Accepts a medical report upload (PDF, JPG, PNG).
    - Validates file type and size (<= 10MB).
    - Safe temporary file handling with guaranteed cleanup.
    - Extracts text using PDF parser or Tesseract OCR.
    - Sends extracted text to Gemini API for structured educational explanation.
    - Output is strictly non-diagnostic, never invents values or ranges.
    - NOTE: Uploaded files and raw medical text are EPHEMERAL and NOT saved by default.
    """
    filename = file.filename or "uploaded_report"
    _, ext = os.path.splitext(filename.lower())
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. ReportSaathi only accepts PDF, JPG, and PNG documents."
        )

    temp_path = None
    total_bytes = 0

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            temp_path = temp_file.name
            
            while chunk := await file.read(65536):
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                        detail="File size exceeds the 10MB limit. Please upload a smaller file."
                    )
                temp_file.write(chunk)

        if total_bytes == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty (0 bytes). Please upload a valid laboratory document."
            )

        try:
            if ext == ".pdf":
                extracted_text, method = extract_from_pdf_file(temp_path)
            else:
                extracted_text, method = extract_from_image_file(temp_path)
        except ValueError as val_err:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(val_err)
            )
        except Exception as proc_err:
            logger.error(f"Error during document extraction: {proc_err}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred while processing the document: {str(proc_err)}"
            )

        clean_chars = re.sub(r'[^a-zA-Z0-9]', '', extracted_text)
        if len(clean_chars) < 10:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="No readable text could be extracted from this document. The image may be blank, unreadable, or blurry. Please upload a clearer scan."
            )

        # Generate structured explanation with Gemini (or fallback engine)
        gemini_report, ai_engine = analyze_report_with_gemini(extracted_text)

        return ReportAnalysisResponse(
            status="success",
            filename=filename,
            file_type=file.content_type or f"application/{ext.lstrip('.')}",
            file_size_bytes=total_bytes,
            character_count=len(extracted_text),
            extraction_method=method,
            extracted_text=extracted_text,
            processing_status="success",
            ai_engine=ai_engine,
            is_clarity_sufficient=gemini_report.is_clarity_sufficient,
            clarity_note=gemini_report.clarity_note,
            overall_status=gemini_report.overall_status,
            parameters=gemini_report.parameters,
            summary=gemini_report.summary,
            key_takeaways=gemini_report.key_takeaways,
            doctor_questions=gemini_report.doctor_questions,
            lifestyle_tips=gemini_report.lifestyle_tips,
            educational_disclaimer=gemini_report.educational_disclaimer
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as cleanup_err:
                logger.warning(f"Failed to remove temp file {temp_path}: {cleanup_err}")

# ================= REPORT-SPECIFIC CHAT ENDPOINT =================

@router.post("/chat", response_model=ReportChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_report(
    req: ReportChatRequest = Body(...)
):
    """
    Answers user questions bounded strictly by the currently selected report's extracted information.
    - If the user asks about something not supported or not present in the report, returns:
      'This information is not available in your laboratory report. I recommend discussing this with your healthcare professional.'
    - Never diagnoses, evaluates unlisted conditions, or recommends treatment.
    """
    try:
        response = handle_report_chat(req)
        return response
    except Exception as e:
        logger.error(f"Chat processing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate an educational answer. Please try again."
        )

# ================= TELEGRAM NOTIFICATION ENDPOINT =================

@router.post("/notify-telegram", response_model=TelegramNotificationResponse, status_code=status.HTTP_200_OK)
async def send_report_telegram_notification(
    req: TelegramNotificationRequest = Body(...)
):
    """
    Sends an educational summary of the currently active lab report to a user's Telegram chat.
    Safe & non-diagnostic, attaches mandatory educational disclaimer.
    """
    return await send_telegram_notification(req)

# ================= SUPABASE OPT-IN HISTORY ENDPOINTS =================

@router.post("/save")
async def save_report_endpoint(
    payload: Dict[str, Any] = Body(...)
):
    """
    Opt-in endpoint to save a report summary to Supabase.
    Strictly strips raw document text and original files before saving.
    """
    user_id = payload.get("user_id")
    report_data = payload.get("report")

    if not user_id or not report_data:
        raise HTTPException(status_code=400, detail="Missing user_id or report payload.")

    result = save_report_to_supabase(user_id, report_data)
    return result

@router.get("/history")
async def get_report_history(
    user_id: str = Query(...)
):
    """
    Fetches the saved report history for the signed-in user from Supabase.
    """
    return fetch_user_reports_from_supabase(user_id)

@router.delete("/history/{report_id}")
async def delete_saved_report(
    report_id: str,
    user_id: str = Query(...)
):
    """
    Permanently deletes a saved report record from the user's history.
    """
    return delete_report_from_supabase(user_id, report_id)

@router.get("/status")
async def supabase_status():
    """
    Returns whether Supabase persistence is active or in demo/guest mode.
    """
    return {
        "supabase_configured": is_supabase_enabled(),
        "mode": "production" if is_supabase_enabled() else "demo_mode"
    }
