from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class TestStatus(str, Enum):
    NORMAL = "normal"
    HIGH = "high"
    LOW = "low"
    INCONCLUSIVE = "inconclusive"

class OverallStatus(str, Enum):
    ALL_NORMAL = "all_normal"
    ATTENTION_NEEDED = "attention_needed"

class TestSourceFacts(BaseModel):
    name: str = Field(description="Exact laboratory test name extracted from document")
    value: str = Field(description="Exact measured value as recorded in report")
    unit: str = Field(default="", description="Measurement unit as stated in report (e.g. mg/dL, g/dL, %), or empty if omitted")
    reference_range: str = Field(
        default="N/A (Not specified in report)",
        description="Biological reference interval printed in report. MUST be 'N/A (Not specified in report)' if not in document."
    )

class TestAIExplanation(BaseModel):
    simple_explanation: str = Field(
        description="Plain-language educational translation at a 6th-to-8th grade reading level explaining what this test measures."
    )
    why_it_matters: Optional[str] = Field(
        default=None,
        description="General biological or physiological function in the body."
    )
    unclear_or_missing_note: Optional[str] = Field(
        default=None,
        description="Explicit note if unit, range, or decimal was omitted, blurry, or ambiguous in the source document."
    )

class TestParameter(BaseModel):
    name: str = Field(description="Name of the test")
    category: str = Field(default="Laboratory Biomarker", description="Biochemical panel category")
    value: str = Field(description="Measured value")
    unit: str = Field(default="", description="Unit of measurement")
    reference_range: str = Field(default="N/A (Not specified in report)", description="Reference interval from document or N/A")
    status: TestStatus = Field(default=TestStatus.NORMAL, description="Whether value is normal, high, low, or inconclusive")
    status_label: str = Field(default="Normal Range", description="Human-readable status label")
    simple_explanation: str = Field(description="Plain-language explanation")
    why_it_matters: Optional[str] = Field(default=None, description="Physiological importance")
    unclear_or_missing_note: Optional[str] = Field(default=None, description="Note on missing/ambiguous details")
    gauge_percentage: Optional[int] = Field(default=50, description="Visual gauge percentage 0-100")
    source_facts: Optional[TestSourceFacts] = Field(default=None, description="Strict source-extracted facts")
    ai_explanation: Optional[TestAIExplanation] = Field(default=None, description="AI educational interpretation")

class GeminiStructuredReport(BaseModel):
    report_title: str = Field(default="Laboratory Test Analysis", description="Identified report type or panel")
    specimen_date: Optional[str] = Field(default="Recent", description="Collection or reporting date if mentioned")
    is_clarity_sufficient: bool = Field(default=True, description="False if text is too blurry, fragmented, or incomplete")
    clarity_note: Optional[str] = Field(default=None, description="Note advising clinical consultation if document is unclear")
    overall_status: OverallStatus = Field(default=OverallStatus.ALL_NORMAL, description="Whether all parameters are normal or some require attention")
    summary: str = Field(description="Empathetic, plain-language non-diagnostic educational overview")
    parameters: List[TestParameter] = Field(default_factory=list, description="Extracted parameters strictly from text")
    key_takeaways: List[str] = Field(default_factory=list, description="Core educational takeaways")
    doctor_questions: List[str] = Field(default_factory=list, description="Informed questions for physician consultation")
    lifestyle_tips: List[str] = Field(default_factory=list, description="General, non-prescriptive wellness habits")
    educational_disclaimer: str = Field(
        default="ReportSaathi is designed solely for educational literacy and health awareness. It is strictly non-diagnostic and never prescribes treatments or medication changes. Always review your laboratory documents with a licensed healthcare physician.",
        description="Mandatory medical safety disclaimer"
    )

class ReportAnalysisResponse(BaseModel):
    status: str = Field(default="success")
    filename: str
    file_type: str
    file_size_bytes: int
    character_count: int
    extraction_method: str
    extracted_text: str
    processing_status: str = "success"
    ai_engine: str = Field(default="gemini-2.5-flash", description="AI engine utilized")
    is_clarity_sufficient: bool = True
    clarity_note: Optional[str] = None
    overall_status: OverallStatus = OverallStatus.ALL_NORMAL
    parameters: List[TestParameter] = Field(default_factory=list)
    summary: str
    key_takeaways: List[str] = Field(default_factory=list)
    doctor_questions: List[str] = Field(default_factory=list)
    lifestyle_tips: List[str] = Field(default_factory=list)
    educational_disclaimer: str

# ================= REPORT-SPECIFIC CHAT SCHEMAS =================

class ChatMessage(BaseModel):
    role: str = Field(description="'user' or 'assistant'")
    content: str = Field(description="Message text")

class ReportChatRequest(BaseModel):
    question: str = Field(description="Patient's question about the specific report")
    report_title: str = Field(default="Laboratory Report", description="Title of the active report")
    overall_status: str = Field(default="all_normal", description="Status of the report")
    summary: str = Field(default="", description="Educational summary of the active report")
    parameters: List[Dict[str, Any]] = Field(default_factory=list, description="Parameters extracted in this report")
    raw_extracted_text: Optional[str] = Field(default=None, description="Raw extracted document snippet if available")
    history: List[ChatMessage] = Field(default_factory=list, description="Conversation history")

class ReportChatResponse(BaseModel):
    answer: str = Field(description="Educational answer strictly bounded by the report context")
    is_supported_by_report: bool = Field(description="Whether the answer is supported by the report context")
    related_parameters: List[str] = Field(default_factory=list, description="Parameters mentioned or cited")
    educational_disclaimer: str = Field(
        default="ReportSaathi answers strictly based on your report's extracted numbers. It is an educational tool and cannot diagnose, evaluate unlisted conditions, or recommend clinical treatments.",
        description="Permanent chat safety disclaimer"
    )

# ================= TELEGRAM NOTIFICATION SCHEMAS =================

class TelegramNotificationRequest(BaseModel):
    chat_id: Optional[str] = Field(default=None, description="Telegram Chat ID. If omitted, uses server default if configured.")
    report_title: str = Field(default="Laboratory Report", description="Title of report")
    date: Optional[str] = Field(default="Recent", description="Report date")
    overall_status: str = Field(default="all_normal", description="Overall status")
    summary: str = Field(default="", description="Educational overview")
    key_takeaways: List[str] = Field(default_factory=list, description="Key takeaways")
    parameters: List[Dict[str, Any]] = Field(default_factory=list, description="Extracted parameters")
    doctor_questions: List[str] = Field(default_factory=list, description="Questions for physician")

class TelegramNotificationResponse(BaseModel):
    success: bool
    message: str
    chat_id: Optional[str] = None
    mode: str = Field(default="live", description="'live' or 'demo'")

class HealthResponse(BaseModel):
    status: str
    service: str
    tesseract_installed: bool
    tesseract_version: Optional[str] = None
    gemini_configured: bool
    supabase_configured: bool
    telegram_bot_configured: bool = False
    supported_formats: List[str]
    max_file_size_mb: int

class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None
