import json
import logging
from typing import Tuple, Optional
from google import genai
from google.genai import types
from pydantic import ValidationError

from app.core.config import settings
from app.models.schemas import (
    GeminiStructuredReport,
    TestParameter,
    TestSourceFacts,
    TestAIExplanation,
    TestStatus,
    OverallStatus
)
from app.services.extractor import parse_parameters_from_text, generate_educational_insights

logger = logging.getLogger(__name__)

GEMINI_SYSTEM_INSTRUCTION = """
You are ReportSaathi, an empathetic, highly precise medical health-literacy companion.
Your mission is to help patients understand complex laboratory reports in plain, reassuring language without causing panic or giving medical advice.

MANDATORY MEDICAL SAFETY & ACCURACY RULES:
1. NON-DIAGNOSTIC: You explain what tests measure and standard reference intervals. You NEVER diagnose a medical condition, claim certainty, or provide clinical pronouncements.
2. NO PRESCRIBING: Never recommend medications, therapies, or specific dosage changes.
3. NEVER INVENT FACTS: Extract ONLY the laboratory parameters, values, units, and reference ranges explicitly present in the provided text.
   - If a reference range is NOT stated in the document, you MUST set reference_range = "N/A (Not specified in report)" and note it in unclear_or_missing_note.
   - NEVER invent, extrapolate, or guess missing decimal points, units, or standard ranges.
4. DISTINGUISH SOURCE FACTS FROM AI EXPLANATIONS:
   - source_facts must strictly mirror the original document text.
   - ai_explanation must translate the finding into clear, everyday language suitable for a 6th-to-8th grade reading level.
5. UNCLEAR OR AMBIGUOUS REPORTS: If the text is partially obscured, blurred, missing critical panels, or ambiguous:
   - Set is_clarity_sufficient = false
   - State clearly in clarity_note what is missing or ambiguous, and explicitly urge the user to consult a qualified clinician with their original physical lab document.
6. PERMANENT DISCLAIMER: Every summary must emphasize that ReportSaathi is an educational awareness tool and not a substitute for clinical physician consultation.
"""

def extract_deterministic_report(extracted_text: str, fallback_reason: Optional[str] = None) -> GeminiStructuredReport:
    """
    Deterministic educational analyzer used when GEMINI_API_KEY is not configured or offline.
    Never invents missing values; strictly parses from detected lines.
    """
    raw_params = parse_parameters_from_text(extracted_text)
    summary, overall_status, takeaways, doctor_q, lifestyle = generate_educational_insights(raw_params, extracted_text)

    # Wrap each parameter with source_facts and ai_explanation
    enhanced_params = []
    for p in raw_params:
        p.source_facts = TestSourceFacts(
            name=p.name,
            value=p.value,
            unit=p.unit,
            reference_range=p.reference_range
        )
        p.ai_explanation = TestAIExplanation(
            simple_explanation=p.simple_explanation,
            why_it_matters=p.why_it_matters,
            unclear_or_missing_note=p.unclear_or_missing_note or ("Reference range omitted in source document" if "N/A" in p.reference_range else None)
        )
        enhanced_params.append(p)

    if fallback_reason:
        summary = f"{summary} (Note: {fallback_reason})"

    return GeminiStructuredReport(
        report_title="Laboratory Health Summary",
        specimen_date="Recent",
        is_clarity_sufficient=len(raw_params) > 0,
        clarity_note=None if len(raw_params) > 0 else "Limited standardized parameters detected. Please consult your physician with your original laboratory paper.",
        overall_status=overall_status,
        summary=summary,
        parameters=enhanced_params,
        key_takeaways=takeaways,
        doctor_questions=doctor_q,
        lifestyle_tips=lifestyle
    )

def analyze_report_with_gemini(extracted_text: str) -> Tuple[GeminiStructuredReport, str]:
    """
    Sends extracted lab report text to Gemini API for structured educational breakdown.
    - Validates output with Pydantic GeminiStructuredReport.
    - Never exposes GEMINI_API_KEY in frontend or responses.
    - Provides safe deterministic fallback if GEMINI_API_KEY is unset or API call fails.
    """
    api_key = settings.GEMINI_API_KEY

    # Check if API key is configured
    if not api_key or api_key.strip() in ("", "your_gemini_api_key_here"):
        logger.info("GEMINI_API_KEY is not configured in backend environment. Utilizing deterministic educational engine.")
        report = extract_deterministic_report(
            extracted_text, 
            fallback_reason="Processed by ReportSaathi Educational Engine (Configure GEMINI_API_KEY in backend/.env for live Gemini explanations)"
        )
        return report, "educational-rules-engine"

    try:
        # Initialize Google GenAI Client
        client = genai.Client(api_key=api_key)

        prompt = f"""
Analyze the following extracted medical laboratory report text and produce a structured educational breakdown adhering strictly to your safety rules:

--- EXTRACTED LAB REPORT TEXT BEGIN ---
{extracted_text}
--- EXTRACTED LAB REPORT TEXT END ---

Remember:
- Only report parameters that appear in the extracted text above.
- If a reference range or unit is not in the text, write "N/A (Not specified in report)".
- Do not prescribe, do not diagnose, and do not claim medical certainty.
"""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=GEMINI_SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=GeminiStructuredReport,
                temperature=0.1,
            ),
        )

        # Parse and validate structured output
        raw_json = json.loads(response.text)
        validated_report = GeminiStructuredReport(**raw_json)

        # Ensure source_facts and ai_explanation exist on all parameters
        for p in validated_report.parameters:
            if not p.source_facts:
                p.source_facts = TestSourceFacts(
                    name=p.name,
                    value=p.value,
                    unit=p.unit,
                    reference_range=p.reference_range
                )
            if not p.ai_explanation:
                p.ai_explanation = TestAIExplanation(
                    simple_explanation=p.simple_explanation,
                    why_it_matters=p.why_it_matters,
                    unclear_or_missing_note=p.unclear_or_missing_note
                )

        return validated_report, "gemini-2.5-flash"

    except ValidationError as val_err:
        logger.error(f"Gemini output schema validation error: {val_err}. Falling back to deterministic engine.")
        fallback = extract_deterministic_report(
            extracted_text,
            fallback_reason="AI output validation mismatch; structured fallback provided."
        )
        return fallback, "gemini-fallback-validated"

    except Exception as e:
        logger.error(f"Gemini API request failed: {e}. Falling back to safe deterministic engine.")
        fallback = extract_deterministic_report(
            extracted_text,
            fallback_reason=f"Gemini API unavailable ({str(e)[:60]}); structured educational fallback provided."
        )
        return fallback, "gemini-fallback-offline"
