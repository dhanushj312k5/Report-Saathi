from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class TestStatus(str, Enum):
    NORMAL = "normal"
    HIGH = "high"
    LOW = "low"
    INCONCLUSIVE = "inconclusive"

class OverallStatus(str, Enum):
    ALL_NORMAL = "all_normal"
    ATTENTION_NEEDED = "attention_needed"

class TestParameter(BaseModel):
    name: str = Field(description="Name of the laboratory test detected in document")
    category: str = Field(default="Laboratory Test", description="Category or panel name")
    value: str = Field(description="Measured value from report")
    unit: str = Field(default="", description="Measurement unit (e.g. mg/dL, g/dL, %)")
    reference_range: str = Field(default="N/A", description="Actual reference range stated in document, or 'N/A' if omitted")
    status: TestStatus = Field(default=TestStatus.NORMAL, description="Whether value is normal, high, or low")
    status_label: str = Field(default="Normal Range", description="Human-readable status label")
    simple_explanation: str = Field(description="Plain-language explanation of what this test measures in everyday words")
    why_it_matters: Optional[str] = Field(default=None, description="Why this biomarker matters for health")
    gauge_percentage: Optional[int] = Field(default=50, description="Visual gauge percentage 0-100")

class ReportAnalysisResponse(BaseModel):
    status: str = Field(default="success", description="API processing status: 'success' | 'warning' | 'error'")
    filename: str = Field(description="Name of uploaded file")
    file_type: str = Field(description="MIME type or file format detected")
    file_size_bytes: int = Field(description="Size of the uploaded file in bytes")
    character_count: int = Field(description="Total characters extracted")
    extraction_method: str = Field(description="Extraction source: digital_pdf, scanned_pdf_ocr, image_ocr")
    extracted_text: str = Field(description="Complete raw text extracted from file")
    processing_status: str = Field(default="success", description="Status indicator")
    overall_status: OverallStatus = Field(default=OverallStatus.ALL_NORMAL, description="Whether all parameters are normal or some need attention")
    parameters: List[TestParameter] = Field(default_factory=list, description="Extracted parameters explicitly present in the report")
    summary: str = Field(description="Plain-language educational summary based strictly on detected parameters")
    key_takeaways: List[str] = Field(default_factory=list, description="Key takeaway bullet points")
    doctor_questions: List[str] = Field(default_factory=list, description="Practical questions for your doctor")
    lifestyle_tips: List[str] = Field(default_factory=list, description="General, non-prescriptive wellness points")
    educational_disclaimer: str = Field(
        default="ReportSaathi is designed solely for educational awareness and health literacy. It is NOT a medical diagnosis, clinical consultation, or prescription. Always share your laboratory report with a licensed physician.",
        description="Mandatory medical safety disclaimer"
    )

class HealthResponse(BaseModel):
    status: str
    service: str
    tesseract_installed: bool
    tesseract_version: Optional[str] = None
    gemini_configured: bool
    supported_formats: List[str]
    max_file_size_mb: int

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
