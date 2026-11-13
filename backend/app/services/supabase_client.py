import logging
from typing import Optional, List, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

supabase_client = None

if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase_client: Optional[Client] = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_KEY
        )
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.warning(f"Could not initialize Supabase client: {e}")
        supabase_client = None
else:
    logger.info("Supabase credentials not configured in backend environment. Running in Demo / Guest mode.")

def is_supabase_enabled() -> bool:
    return supabase_client is not None

def save_report_to_supabase(user_id: str, report_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Opt-in storage for educational report history.
    PRIVACY RULES:
    - Strips original files, binary data, and raw OCR text.
    - Saves ONLY educational summary, parameter values, ranges, and doctor questions.
    """
    if not supabase_client:
        return {
            "success": False,
            "demo_mode": True,
            "message": "Supabase credentials are not configured. Running in demo mode without remote persistence."
        }

    try:
        # Strip raw extracted text or sensitive file binaries
        parameters_cleaned = []
        for p in report_dict.get("parameters", []):
            parameters_cleaned.append({
                "name": p.get("name"),
                "category": p.get("category"),
                "value": str(p.get("value")),
                "unit": p.get("unit", ""),
                "reference_range": p.get("reference_range", "N/A"),
                "status": p.get("status", "normal"),
                "status_label": p.get("status_label", "Normal Range"),
                "simple_explanation": p.get("simple_explanation", ""),
                "why_it_matters": p.get("why_it_matters"),
                "gauge_percentage": p.get("gauge_percentage", 50)
            })

        data = {
            "user_id": user_id,
            "title": report_dict.get("title") or report_dict.get("filename") or "Laboratory Report",
            "specimen_date": report_dict.get("specimen_date") or report_dict.get("date") or "Recent",
            "overall_status": report_dict.get("overall_status") or "all_normal",
            "summary": report_dict.get("summary", ""),
            "key_takeaways": report_dict.get("key_takeaways", []),
            "parameters_summary": parameters_cleaned,
            "doctor_questions": report_dict.get("doctor_questions", []),
            "lifestyle_tips": report_dict.get("lifestyle_tips", [])
        }

        res = supabase_client.table("saved_reports").insert(data).execute()
        saved_record = res.data[0] if res.data else None
        
        return {
            "success": True,
            "demo_mode": False,
            "saved_record": saved_record,
            "message": "Report summary securely saved to your health history."
        }
    except Exception as e:
        logger.error(f"Error saving report to Supabase: {e}")
        return {
            "success": False,
            "demo_mode": False,
            "error": str(e),
            "message": f"Failed to save report: {str(e)}"
        }

def fetch_user_reports_from_supabase(user_id: str) -> Dict[str, Any]:
    """
    Fetches past saved reports for an authenticated user.
    """
    if not supabase_client:
        return {
            "success": False,
            "demo_mode": True,
            "reports": [],
            "message": "Supabase not configured. Running in demo mode."
        }
    try:
        res = supabase_client.table("saved_reports").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return {
            "success": True,
            "demo_mode": False,
            "reports": res.data or []
        }
    except Exception as e:
        logger.error(f"Error fetching reports: {e}")
        return {
            "success": False,
            "demo_mode": False,
            "error": str(e),
            "reports": []
        }

def delete_report_from_supabase(user_id: str, report_id: str) -> Dict[str, Any]:
    """
    Permanently deletes a saved report record from Supabase.
    """
    if not supabase_client:
        return {
            "success": False,
            "demo_mode": True,
            "message": "Supabase not configured."
        }
    try:
        res = supabase_client.table("saved_reports").delete().eq("id", report_id).eq("user_id", user_id).execute()
        return {
            "success": True,
            "demo_mode": False,
            "message": "Report record permanently deleted from database."
        }
    except Exception as e:
        logger.error(f"Error deleting report from Supabase: {e}")
        return {
            "success": False,
            "demo_mode": False,
            "error": str(e)
        }
