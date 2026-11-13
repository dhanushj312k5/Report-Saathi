import html
import logging
from typing import Dict, Any, Optional
import httpx

from app.core.config import settings
from app.models.schemas import TelegramNotificationRequest, TelegramNotificationResponse

logger = logging.getLogger("reportsaathi.telegram_service")

TELEGRAM_API_URL = "https://api.telegram.org/bot{token}/sendMessage"

def format_telegram_report_html(req: TelegramNotificationRequest) -> str:
    """
    Formats the report into clean, safe HTML for Telegram.
    Using HTML mode avoids Telegram MarkdownV2 special character parsing crashes.
    """
    title = html.escape(req.report_title or "Laboratory Report")
    date_str = html.escape(req.date or "Recent")
    
    is_normal = req.overall_status in ("all_normal", "normal")
    status_badge = "🟢 <b>All Markers Within Normal Limits</b>" if is_normal else "⚠️ <b>Attention / Values Outside Reference Intervals</b>"
    
    lines = [
        "📋 <b>ReportSaathi Educational Summary</b>",
        "━━━━━━━━━━━━━━━━━━━━",
        f"📄 <b>Report:</b> {title}",
        f"📅 <b>Date:</b> {date_str}",
        f"🏷️ <b>Status:</b> {status_badge}",
        ""
    ]

    if req.summary:
        clean_sum = html.escape(req.summary)
        lines.append(f"📖 <b>Overview:</b>\n{clean_sum}\n")

    # Parameters section (top 8)
    if req.parameters:
        lines.append("🔬 <b>Key Parameters Extracted:</b>")
        for p in req.parameters[:8]:
            p_name = html.escape(str(p.get("name", "Biomarker")))
            p_val = html.escape(str(p.get("value", "")))
            p_unit = html.escape(str(p.get("unit", "")))
            p_status = p.get("status", "normal")
            p_ref = html.escape(str(p.get("reference_range", p.get("referenceRange", "N/A"))))
            p_exp = html.escape(str(p.get("simple_explanation", p.get("simpleExplanation", ""))))

            icon = "🟢" if p_status == "normal" else "🔴"
            ref_str = f" (Ref: {p_ref})" if p_ref and not p_ref.startswith("N/A") else ""
            lines.append(f"{icon} <b>{p_name}:</b> <code>{p_val} {p_unit}</code>{ref_str}")
            if p_exp:
                lines.append(f"   <i>{p_exp}</i>")
        lines.append("")

    # Doctor questions (top 3)
    if req.doctor_questions:
        lines.append("🩺 <b>Questions for Your Next Physician Visit:</b>")
        for idx, q in enumerate(req.doctor_questions[:3], 1):
            lines.append(f"{idx}. {html.escape(q)}")
        lines.append("")

    # Medical Disclaimer
    lines.extend([
        "━━━━━━━━━━━━━━━━━━━━",
        "⚠️ <b>Educational Use Only:</b>",
        "ReportSaathi provides patient literacy and is strictly non-diagnostic. "
        "It never prescribes treatment or medication dosages. "
        "Always discuss your medical results with a licensed healthcare physician."
    ])

    full_text = "\n".join(lines)
    # Telegram max length is 4096 characters
    if len(full_text) > 4000:
        full_text = full_text[:3900] + "\n...\n\n⚠️ <i>[Report truncated for brevity]</i>"

    return full_text

def is_telegram_configured() -> bool:
    """Returns True if a real Telegram Bot Token is configured."""
    token = settings.TELEGRAM_BOT_TOKEN
    return bool(token and token.strip() not in ("", "your_telegram_bot_token_here", "123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"))

async def send_telegram_notification(req: TelegramNotificationRequest) -> TelegramNotificationResponse:
    """
    Sends an educational report summary directly to a user's Telegram via Telegram Bot API.
    Guarantees privacy: Never logs patient data or tokens.
    If no bot token is configured, runs seamlessly in Demo Simulation Mode.
    """
    target_chat_id = (req.chat_id or settings.TELEGRAM_DEFAULT_CHAT_ID or "").strip()
    if not target_chat_id:
        return TelegramNotificationResponse(
            success=False,
            mode="demo" if not is_telegram_configured() else "live",
            message="Please enter your Telegram Chat ID. (Start our bot in Telegram by sending /start to view your Chat ID)."
        )

    # Demo Mode Fallback
    if not is_telegram_configured():
        logger.info("TELEGRAM_BOT_TOKEN is unset or placeholder. Simulating demo delivery.")
        return TelegramNotificationResponse(
            success=True,
            mode="demo",
            chat_id=target_chat_id,
            message=(
                f"✅ [Demo Mode] Report notification simulated for Chat ID '{target_chat_id}'! "
                "All parameters and doctor talking points were formatted into Telegram HTML. "
                "To deliver live messages directly to your Telegram app, add your real bot token from @BotFather to backend/.env."
            )
        )

    token = settings.TELEGRAM_BOT_TOKEN
    text_body = format_telegram_report_html(req)
    url = TELEGRAM_API_URL.format(token=token)
    payload = {
        "chat_id": target_chat_id,
        "text": text_body,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, json=payload)
            res_data = resp.json()

            if resp.status_code == 200 and res_data.get("ok"):
                logger.info("Telegram notification sent successfully.")
                return TelegramNotificationResponse(
                    success=True,
                    mode="live",
                    message="Report summary successfully sent to your Telegram!",
                    chat_id=target_chat_id
                )
            
            # Handle specific Telegram Bot API error codes gracefully
            err_code = res_data.get("error_code")
            desc = res_data.get("description", "Unknown Telegram error")

            if err_code == 400 and "chat not found" in desc.lower():
                user_friendly = (
                    f"Telegram chat '{target_chat_id}' was not found. "
                    "Make sure you have opened our bot in Telegram and sent '/start' first so it can message you."
                )
            elif err_code == 401 or "unauthorized" in desc.lower():
                user_friendly = "Telegram authorization failed. The TELEGRAM_BOT_TOKEN in backend/.env is invalid or rejected."
            elif err_code == 403 or "blocked" in desc.lower():
                user_friendly = "Unable to send message: The Telegram bot was blocked by this user or lacks permission."
            else:
                user_friendly = f"Telegram error ({err_code}): {desc}"

            logger.warning(f"Telegram notification dispatch rejected: {err_code}")
            return TelegramNotificationResponse(
                success=False,
                mode="live",
                message=user_friendly,
                chat_id=target_chat_id
            )

    except httpx.RequestError as exc:
        logger.error(f"Network error connecting to Telegram API: {type(exc).__name__}")
        return TelegramNotificationResponse(
            success=False,
            message="Network error while contacting Telegram servers. Please check your internet connection.",
            chat_id=target_chat_id
        )
    except Exception as exc:
        logger.error(f"Unexpected error in send_telegram_notification: {type(exc).__name__}")
        return TelegramNotificationResponse(
            success=False,
            message="An unexpected error occurred while dispatching the Telegram notification.",
            chat_id=target_chat_id
        )
