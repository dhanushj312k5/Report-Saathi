import os
import re
import tempfile
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status

from app.models.schemas import ReportAnalysisResponse
from app.services.extractor import (
    extract_from_pdf_file,
    extract_from_image_file,
    parse_parameters_from_text,
    generate_educational_insights
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
    - Uses safe temporary file handling with guaranteed cleanup.
    - Extracts text from digital PDFs, or runs Tesseract OCR on images / scanned PDFs.
    - Handles unreadable files, empty OCR output, and unsupported formats with useful error messages.
    - Never invents missing report values or reference ranges.
    - Returns structured JSON containing extracted text, processing status, and plain-language insights.
    """
    # 1. Validate Filename & Extension
    filename = file.filename or "uploaded_report"
    _, ext = os.path.splitext(filename.lower())
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. ReportSaathi only accepts PDF, JPG, and PNG documents."
        )

    # 2. Safe Temporary File Handling with Chunk-by-Chunk Size Validation
    temp_path = None
    total_bytes = 0

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            temp_path = temp_file.name
            
            # Read in chunks (64KB) to avoid memory spikes and strictly enforce max size
            while chunk := await file.read(65536):
                total_bytes += len(chunk)
                if total_bytes > MAX_FILE_SIZE_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="File size exceeds the 10MB limit. Please upload a smaller file."
                    )
                temp_file.write(chunk)

        if total_bytes == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is empty (0 bytes). Please upload a valid laboratory document."
            )

        # 3. Extract Text via PDF Parser or Tesseract OCR
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

        # 4. Handle Empty or Unreadable OCR Output
        clean_chars = re.sub(r'[^a-zA-Z0-9]', '', extracted_text)
        if len(clean_chars) < 10:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No readable text could be extracted from this document. The image may be blank, unreadable, or blurry. Please upload a clearer scan."
            )

        # 5. Parse Parameters (Strictly never inventing missing values or ranges)
        parameters = parse_parameters_from_text(extracted_text)
        summary, overall_status, takeaways, doctor_q, lifestyle = generate_educational_insights(parameters, extracted_text)

        # 6. Return Structured JSON
        return ReportAnalysisResponse(
            status="success",
            filename=filename,
            file_type=file.content_type or f"application/{ext.lstrip('.')}",
            file_size_bytes=total_bytes,
            character_count=len(extracted_text),
            extraction_method=method,
            extracted_text=extracted_text,
            processing_status="success",
            overall_status=overall_status,
            parameters=parameters,
            summary=summary,
            key_takeaways=takeaways,
            doctor_questions=doctor_q,
            lifestyle_tips=lifestyle
        )

    finally:
        # Guaranteed Cleanup of Temporary File
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as cleanup_err:
                logger.warning(f"Failed to remove temp file {temp_path}: {cleanup_err}")
