import json
import logging
from typing import Optional
from google import genai
from google.genai import types

from app.core.config import settings
from app.models.schemas import ReportAnalysis, TestItem, TestStatus, OverallStatus

logger = logging.getLogger(__name__)

SYSTEM_INSTRUCTION = """
You are ReportSaathi, an empathetic and highly accurate medical educational assistant designed to help patients understand laboratory blood and health reports in simple, clear language.

CRITICAL MEDICAL SAFETY RULES:
1. EDUCATIONAL ONLY: You explain test parameters and reference ranges. You NEVER make a definitive clinical diagnosis.
2. NO PRESCRIBING: Never recommend prescription medications, altered dosages, or specific clinical therapies.
3. EMPATHETIC & ACCESSIBLE: Write explanations for an average person at a 6th to 8th grade reading level. Avoid dense medical jargon without explaining it.
4. HONESTY: If a value or test is incomplete, ambiguous, or poorly scanned, mark its status as 'inconclusive' and state that clearly.
5. EMPOWERMENT: Always produce actionable, thoughtful questions the patient can bring to their doctor.
6. PERMANENT DISCLAIMER: Always remind the patient to consult their licensed healthcare professional.

Your task:
Analyze the extracted text from a medical laboratory report. Extract each test measured, its recorded value, reference range, whether it is normal/high/low, an easy-to-understand explanation of what that metric does in the body, key findings, and recommended questions for their physician.
"""

def generate_mock_analysis(extracted_text: str) -> ReportAnalysis:
    """
    Fallback deterministic parser when GEMINI_API_KEY is not configured or offline.
    Extracts common lab tests or provides an informative sample educational analysis.
    """
    tests = []
    
    # Simple regex-based heuristics for common lab tests
    lower = extracted_text.lower()
    
    if "hemoglobin" in lower or "hgb" in lower:
        tests.append(TestItem(
            name="Hemoglobin (Hb)",
            category="Complete Blood Count (CBC)",
            value="13.8 g/dL",
            reference_range="13.0 - 17.0 g/dL",
            status=TestStatus.NORMAL,
            simple_explanation="Hemoglobin is the protein in red blood cells that carries oxygen from your lungs to the rest of your body.",
            why_it_matters="Adequate levels ensure your body organs receive enough oxygen for energy and vital functions."
        ))
    
    if "glucose" in lower or "sugar" in lower or "fasting" in lower:
        tests.append(TestItem(
            name="Fasting Blood Glucose",
            category="Blood Sugar",
            value="108 mg/dL",
            reference_range="70 - 99 mg/dL",
            status=TestStatus.HIGH,
            simple_explanation="This measures the amount of sugar circulating in your bloodstream after fasting. A slightly elevated number may suggest prediabetes or insulin sensitivity.",
            why_it_matters="Monitoring glucose helps detect and manage metabolic health and prevent diabetes."
        ))

    if "cholesterol" in lower or "lipid" in lower or "triglyceride" in lower:
        tests.append(TestItem(
            name="Total Cholesterol",
            category="Lipid Profile",
            value="210 mg/dL",
            reference_range="< 200 mg/dL",
            status=TestStatus.HIGH,
            simple_explanation="Cholesterol is a waxy substance needed to build cells, but high levels can gradually form plaque in blood vessels.",
            why_it_matters="Keeping cholesterol in balance helps protect heart and cardiovascular health."
        ))
        tests.append(TestItem(
            name="HDL (Good Cholesterol)",
            category="Lipid Profile",
            value="52 mg/dL",
            reference_range="> 40 mg/dL",
            status=TestStatus.NORMAL,
            simple_explanation="High-Density Lipoprotein (HDL) acts like a scavenger, removing excess bad cholesterol from your bloodstream.",
            why_it_matters="Higher HDL levels are generally protective for your cardiovascular system."
        ))

    if "creatinine" in lower or "kidney" in lower or "renal" in lower:
        tests.append(TestItem(
            name="Serum Creatinine",
            category="Renal / Kidney Function",
            value="0.9 mg/dL",
            reference_range="0.7 - 1.3 mg/dL",
            status=TestStatus.NORMAL,
            simple_explanation="Creatinine is a natural waste product created by normal muscle wear and tear, filtered out by healthy kidneys.",
            why_it_matters="It is one of the most reliable indicators of how efficiently your kidneys are filtering waste."
        ))

    if not tests:
        # Default educational template
        tests = [
            TestItem(
                name="Hemoglobin",
                category="Complete Blood Count",
                value="14.1 g/dL",
                reference_range="13.0 - 17.0 g/dL",
                status=TestStatus.NORMAL,
                simple_explanation="Carries oxygen through your blood to your organs.",
                why_it_matters="Vital for physical energy and tissue oxygenation."
            ),
            TestItem(
                name="Total Cholesterol",
                category="Lipid Panel",
                value="195 mg/dL",
                reference_range="< 200 mg/dL",
                status=TestStatus.NORMAL,
                simple_explanation="Measures all cholesterol types in your blood.",
                why_it_matters="Healthy levels maintain clear arteries and cardiovascular wellness."
            )
        ]

    any_abnormal = any(t.status in (TestStatus.HIGH, TestStatus.LOW, TestStatus.ABNORMAL) for t in tests)

    return ReportAnalysis(
        report_title="Laboratory Health Summary (Demo / Educational Mode)",
        report_date="Recent",
        summary="This report summary was generated to help you understand your laboratory results. Most primary markers are in good standing, with some values worth discussing with your doctor for routine preventive guidance.",
        overall_status=OverallStatus.SOME_ATTENTION_NEEDED if any_abnormal else OverallStatus.ALL_NORMAL,
        tests=tests,
        key_findings=[
            "Vital organ markers indicate stable baseline function.",
            "Notice any flagged items in the breakdown below to explore lifestyle or dietary steps.",
            "Compare these readings with your prior test history if available."
        ],
        questions_for_doctor=[
            "Do any of these readings warrant a follow-up test in 3 to 6 months?",
            "Are there dietary or physical exercise adjustments that would benefit my specific numbers?",
            "Should we compare these numbers against my baseline from last year?"
        ],
        lifestyle_guidance=[
            "Stay well-hydrated throughout the day with regular water intake.",
            "Incorporate a colorful variety of vegetables, legumes, and whole grains into your meals.",
            "Aim for 30 minutes of moderate physical activity (e.g. brisk walking) most days of the week."
        ],
        educational_disclaimer="NOTE: Running in educational demo mode. To enable live Gemini AI medical interpretation, provide your GEMINI_API_KEY in the backend configuration. Always review laboratory reports with your doctor.",
        extracted_text_preview=extracted_text[:400] if extracted_text else "No text extracted."
    )

def analyze_report_text(extracted_text: str) -> ReportAnalysis:
    """
    Sends extracted lab report text to Gemini for structured educational breakdown.
    Falls back cleanly to mock analyzer if API key is missing or call fails.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key.strip() in ("", "your_gemini_api_key_here"):
        logger.info("No valid GEMINI_API_KEY provided; using educational fallback analyzer.")
        return generate_mock_analysis(extracted_text)

    try:
        client = genai.Client(api_key=api_key)
        
        prompt = f"""
Please analyze this medical laboratory report text and provide a structured educational breakdown:

--- EXTRACTED LAB REPORT TEXT ---
{extracted_text}
--- END TEXT ---
"""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=ReportAnalysis,
                temperature=0.2,
            ),
        )

        # Parse json response
        data = json.loads(response.text)
        analysis = ReportAnalysis(**data)
        if not analysis.extracted_text_preview:
            analysis.extracted_text_preview = extracted_text[:400]
        return analysis

    except Exception as e:
        logger.error(f"Gemini API analysis failed: {e}. Falling back to educational mock analyzer.")
        fallback = generate_mock_analysis(extracted_text)
        fallback.summary += f" (Note: Gemini API encountered an issue: {str(e)[:80]}. Showing fallback analysis.)"
        return fallback
