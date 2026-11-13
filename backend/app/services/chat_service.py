import json
import logging
from typing import Dict, Any, List
from google import genai
from google.genai import types

from app.core.config import settings
from app.models.schemas import ReportChatRequest, ReportChatResponse

logger = logging.getLogger(__name__)

CHAT_SYSTEM_INSTRUCTION = """
You are the ReportSaathi Report-Specific Educational Assistant.
Your sole purpose is to answer the user's questions about THEIR CURRENTLY SELECTED LABORATORY REPORT.

STRICT OPERATIONAL RULES:
1. ONLY USE REPORT CONTEXT: Answer strictly and exclusively using the laboratory tests, values, and text provided in the Report Context below.
2. MISSING / UNSUPPORTED INFORMATION:
   If the user asks about a laboratory test, symptom, condition, medication, or organ function that is NOT explicitly present in the provided report context, you MUST state:
   "This information is not available in your laboratory report. I recommend discussing this with your healthcare professional."
   Set is_supported_by_report = false.
3. NEVER DIAGNOSE OR PRESCRIBE:
   - Do NOT say "You have condition X" or "This indicates disease Y".
   - Instead, describe what the number means relative to the document's reference interval: e.g. "Your total cholesterol was measured at 224 mg/dL, which is above the printed reference threshold of 200 mg/dL. This is an observation to review with your physician."
   - Do NOT prescribe or recommend specific medications, vitamins, or dosages.
4. READING LEVEL: Empathetic, simple, 6th-to-8th grade reading level.
5. MANDATORY DISCLAIMER: Remind the user that this is an educational literacy response and not a clinical diagnosis.
"""

def generate_deterministic_chat_response(req: ReportChatRequest) -> ReportChatResponse:
    """
    Fallback deterministic chat engine when GEMINI_API_KEY is not configured.
    Strictly checks whether the user's question relates to a parameter actually in the report.
    If not, adheres to the rule: "This information is not available in your laboratory report..."
    """
    q_lower = req.question.lower().strip()
    parameters = req.parameters or []
    
    # 1. Check for questions asking for general overview / out-of-range markers
    if any(k in q_lower for k in ["out of range", "abnormal", "high", "low", "attention", "elevated", "summary", "overview"]):
        abnormal = [p for p in parameters if p.get("status") in ("high", "low")]
        if abnormal:
            names = ", ".join([f"{p.get('name')} ({p.get('value')} {p.get('unit', '')}, {p.get('status_label', 'Outside Range')})" for p in abnormal])
            return ReportChatResponse(
                answer=f"Based on your report ({req.report_title}), the following parameters sit outside the printed reference intervals: {names}. {req.summary} We recommend bringing these specific readings to your next appointment with your doctor.",
                is_supported_by_report=True,
                related_parameters=[p.get("name") for p in abnormal]
            )
        else:
            return ReportChatResponse(
                answer=f"Good news! According to the parameters extracted from {req.report_title}, all recorded values are within the normal reference ranges noted on your document. {req.summary}",
                is_supported_by_report=True,
                related_parameters=[p.get("name") for p in parameters]
            )

    # 2. Check for questions about doctor talking points
    if any(k in q_lower for k in ["doctor", "physician", "ask", "question", "consultation", "appointment"]):
        return ReportChatResponse(
            answer="Here are tailored questions you can ask your doctor regarding this report: 1. Do any of these specific numbers warrant repeating in 3 to 6 months? 2. Are there lifestyle or nutritional steps you recommend for my numbers? 3. How do these compare with my baseline health history?",
            is_supported_by_report=True,
            related_parameters=[p.get("name") for p in parameters[:2]]
        )

    # 3. Match against specific parameters present in THIS report
    matched_param = None
    for p in parameters:
        name = p.get("name", "").lower()
        # Check if words in parameter name appear in question
        words = [w for w in name.replace("(", " ").replace(")", " ").split() if len(w) > 2]
        if any(w in q_lower for w in words):
            matched_param = p
            break

    if matched_param:
        val = matched_param.get("value")
        unit = matched_param.get("unit", "")
        ref = matched_param.get("reference_range", "N/A")
        status_label = matched_param.get("status_label", "Normal")
        explanation = matched_param.get("simple_explanation", "Standard clinical biomarker.")
        why = matched_param.get("why_it_matters", "")

        answer_text = (
            f"Regarding {matched_param.get('name')}: Your report records a reading of {val} {unit}. "
            f"The standard reference range printed on your document is {ref} ({status_label}). "
            f"{explanation} "
        )
        if why:
            answer_text += f"Why it matters: {why} "
        answer_text += "Remember to discuss this finding with your physician."

        return ReportChatResponse(
            answer=answer_text,
            is_supported_by_report=True,
            related_parameters=[matched_param.get("name")]
        )

    # 4. Out-of-bounds / Unsupported Query -> Enforce Rule: Information unavailable!
    return ReportChatResponse(
        answer="This information is not available in your laboratory report. I recommend discussing this with your healthcare professional.",
        is_supported_by_report=False,
        related_parameters=[]
    )

def handle_report_chat(req: ReportChatRequest) -> ReportChatResponse:
    """
    Answers user questions bounded strictly by the active report context.
    Uses Gemini API if configured; falls back safely to deterministic engine.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key.strip() in ("", "your_gemini_api_key_here"):
        logger.info("GEMINI_API_KEY unset. Generating report-bounded deterministic response.")
        return generate_deterministic_chat_response(req)

    try:
        client = genai.Client(api_key=api_key)

        # Build context
        param_lines = []
        for p in req.parameters:
            name = p.get("name")
            val = p.get("value")
            unit = p.get("unit", "")
            ref = p.get("reference_range", "N/A")
            status = p.get("status", "normal")
            explanation = p.get("simple_explanation", "")
            param_lines.append(f"- {name}: {val} {unit} | Printed Range: {ref} | Status: {status} | Detail: {explanation}")

        context_str = f"""
REPORT CONTEXT:
Report Title: {req.report_title}
Overall Status: {req.overall_status}
Educational Summary: {req.summary}
Extracted Parameters in this Document:
{chr(10).join(param_lines)}
Raw Extracted Text Snippet: {req.raw_extracted_text or 'N/A'}
"""

        history_str = ""
        if req.history:
            history_lines = [f"{m.role.capitalize()}: {m.content}" for m in req.history[-4:]]
            history_str = f"\nRECENT CHAT HISTORY:\n" + "\n".join(history_lines) + "\n"

        prompt = f"""
{context_str}
{history_str}
USER QUESTION:
{req.question}

Respond in structured JSON according to the schema.
Remember:
- If the question is about anything NOT mentioned in the report context above, answer:
  "This information is not available in your laboratory report. I recommend discussing this with your healthcare professional."
  and set is_supported_by_report = false.
- Do NOT diagnose or recommend treatments.
"""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=CHAT_SYSTEM_INSTRUCTION,
                response_mime_type="application/json",
                response_schema=ReportChatResponse,
                temperature=0.1,
            ),
        )

        data = json.loads(response.text)
        return ReportChatResponse(**data)

    except Exception as e:
        logger.error(f"Gemini chat processing error: {e}. Falling back to deterministic engine.")
        return generate_deterministic_chat_response(req)
