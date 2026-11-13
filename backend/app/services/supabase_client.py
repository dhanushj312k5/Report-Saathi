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
    logger.info("Supabase credentials not configured. Running in local/guest mode.")

def save_report_history(user_id: str, report_dict: Dict[str, Any], filename: str) -> Optional[Dict[str, Any]]:
    """
    Saves an analyzed report to Supabase 'reports' table if configured.
    """
    if not supabase_client:
        return None
    try:
        data = {
            "user_id": user_id,
            "filename": filename,
            "report_title": report_dict.get("report_title", "Lab Report"),
            "summary": report_dict.get("summary", ""),
            "overall_status": report_dict.get("overall_status", "all_normal"),
            "data": report_dict,
        }
        res = supabase_client.table("reports").insert(data).execute()
        return res.data[0] if res.data else None
    except Exception as e:
        logger.error(f"Error saving to Supabase: {e}")
        return None

def fetch_user_reports(user_id: str) -> List[Dict[str, Any]]:
    """
    Fetches past analyzed reports for an authenticated user.
    """
    if not supabase_client:
        return []
    try:
        res = supabase_client.table("reports").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching reports from Supabase: {e}")
        return []
