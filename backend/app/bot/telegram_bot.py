import os
import re
import tempfile
import logging
from typing import Optional
from telegram import Update
from telegram.error import InvalidToken
from telegram.ext import (
    Application,
    ApplicationBuilder,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters
)

from app.core.config import settings
from app.services.extractor import extract_from_pdf_file, extract_from_image_file
from app.services.analyzer import analyze_report_with_gemini

# NOTE: Privacy & Security Rule:
# Do not log sensitive medical report contents or bot tokens!
logger = logging.getLogger("reportsaathi.telegram_bot")

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

DISCLAIMER_TEXT = (
    "\n\n━━━━━━━━━━━━━━━━━━━━\n"
    "⚠️ *Educational Use Only*\n"
    "ReportSaathi provides educational literacy and is strictly non-diagnostic. "
    "It never prescribes treatment or medication adjustments. "
    "Always consult a licensed physician to evaluate your lab results."
)

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Greets the user and explains ReportSaathi's purpose and safety boundaries."""
    chat_id = update.effective_chat.id if update.effective_chat else "Unknown"
    welcome_text = (
        "👋 *Welcome to ReportSaathi Bot!*\n\n"
        "I help translate complex laboratory reports into plain, easy-to-understand language "
        "so you feel informed and prepared for your next doctor's visit.\n\n"
        f"🆔 *Your Telegram Chat ID:* `{chat_id}`\n"
        "_(Copy this Chat ID into the ReportSaathi web app to receive instant report notifications!)_\n\n"
        "📁 *Supported Formats:*\n"
        "• PDF documents\n"
        "• Photos & scans (JPG, PNG)\n"
        "• Maximum file size: 10MB\n\n"
        "🔒 *Privacy Guarantee:*\n"
        "Your files are analyzed ephemerally in memory and discarded immediately. "
        "No patient identifiers or files are stored.\n\n"
        "💡 *How to use:*\n"
        "Simply send or forward a photo or PDF of your lab report right now!"
        + DISCLAIMER_TEXT
    )
    await update.message.reply_text(welcome_text, parse_mode="Markdown")

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Provides usage guidance."""
    help_text = (
        "ℹ️ *ReportSaathi Help & Guidance*\n\n"
        "1. *Upload a Report*: Send a clear photo or PDF of your blood test, lipid panel, or metabolic slip.\n"
        "2. *Receive Explanation*: The bot extracts biomarkers, checks printed reference intervals, and explains what each test measures in simple terms.\n"
        "3. *Consult Your Physician*: Bring the generated talking points to your doctor.\n\n"
        "🚫 *Safety Guardrails:*\n"
        "• The bot never diagnoses medical conditions.\n"
        "• The bot never suggests medication dosages or treatments.\n"
        "• The bot never invents missing reference ranges or numbers."
        + DISCLAIMER_TEXT
    )
    await update.message.reply_text(help_text, parse_mode="Markdown")

async def process_report_file(file_obj, filename: str, ext: str, update: Update):
    """
    Safely downloads the file to an ephemeral temp file, extracts text,
    calls the educational analysis engine, and sends back a concise breakdown.
    Guarantees cleanup and zero logging of sensitive contents.
    """
    temp_path = None
    status_msg = await update.message.reply_text("⏳ *Analyzing your report...*\nExtracting laboratory values and reference ranges.", parse_mode="Markdown")

    try:
        # 1. Download file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            temp_path = temp_file.name
        
        await file_obj.download_to_drive(custom_path=temp_path)

        # 2. Extract text (PDF or OCR)
        if ext == ".pdf":
            extracted_text, method = extract_from_pdf_file(temp_path)
        else:
            extracted_text, method = extract_from_image_file(temp_path)

        clean_chars = re.sub(r'[^a-zA-Z0-9]', '', extracted_text)
        if len(clean_chars) < 10:
            await status_msg.edit_text(
                "❌ *Unreadable Document*\n\n"
                "No readable text could be extracted from your document. "
                "The image may be blank, blurry, or in low lighting.\n\n"
                "Please upload a clearer, well-lit photo or digital PDF."
                + DISCLAIMER_TEXT,
                parse_mode="Markdown"
            )
            return

        # 3. Analyze using Gemini / Fallback engine
        gemini_report, _ = analyze_report_with_gemini(extracted_text)

        # 4. Format concise educational summary
        overall_badge = "✅ *All Extracted Values in Range*" if gemini_report.overall_status.value == "all_normal" else "⚠️ *Attention / Outside Reference Range*"

        param_lines = []
        for p in gemini_report.parameters[:8]:  # Limit to 8 for Telegram brevity
            status_symbol = "🟢" if p.status.value == "normal" else "🔴"
            ref_str = f" (Ref: {p.reference_range})" if p.reference_range and not p.reference_range.startswith("N/A") else ""
            param_lines.append(f"{status_symbol} *{p.name}*: `{p.value} {p.unit}`{ref_str}\n  _{p.simple_explanation}_")

        params_section = "\n\n".join(param_lines) if param_lines else "No specific biomarkers could be isolated."

        doctor_q_lines = "\n".join([f"• {q}" for q in gemini_report.doctor_questions[:3]])

        response_text = (
            f"📋 *{gemini_report.report_title}*\n"
            f"Status: {overall_badge}\n\n"
            f"📖 *Educational Summary:*\n{gemini_report.summary}\n\n"
            f"🔬 *Extracted Parameters:*\n{params_section}\n\n"
            f"🩺 *Questions for Your Doctor:*\n{doctor_q_lines}"
            + DISCLAIMER_TEXT
        )

        # Telegram message length limit is 4096 characters
        if len(response_text) > 4000:
            response_text = response_text[:3950] + "..." + DISCLAIMER_TEXT

        await status_msg.edit_text(response_text, parse_mode="Markdown")
        logger.info("Successfully analyzed report for chat_id.")

    except Exception as e:
        logger.error("Error processing Telegram report file. Details withheld for privacy.")
        await status_msg.edit_text(
            "⚠️ An error occurred while analyzing your report. "
            "Please ensure the file is a standard medical lab document and try again."
            + DISCLAIMER_TEXT,
            parse_mode="Markdown"
        )
    finally:
        # Guarantee ephemeral file cleanup
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

async def handle_document(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles uploaded document files (PDF, JPG, PNG)."""
    doc = update.message.document
    if not doc:
        return

    filename = doc.file_name or "document"
    _, ext = os.path.splitext(filename.lower())

    if ext not in ALLOWED_EXTENSIONS:
        await update.message.reply_text(
            f"❌ Unsupported file format `{ext}`.\n\n"
            "Please send a medical report as a **PDF**, **JPG**, or **PNG** document.",
            parse_mode="Markdown"
        )
        return

    if doc.file_size and doc.file_size > MAX_FILE_SIZE_BYTES:
        await update.message.reply_text(
            "❌ File size exceeds the 10MB limit. Please upload a smaller file or a clearer crop.",
            parse_mode="Markdown"
        )
        return

    file_obj = await doc.get_file()
    await process_report_file(file_obj, filename, ext, update)

async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles direct photo uploads."""
    photos = update.message.photo
    if not photos:
        return

    # Telegram provides several resolutions; take highest resolution (last element)
    highest_res_photo = photos[-1]

    if highest_res_photo.file_size and highest_res_photo.file_size > MAX_FILE_SIZE_BYTES:
        await update.message.reply_text(
            "❌ Photo size exceeds 10MB. Please upload a smaller image.",
            parse_mode="Markdown"
        )
        return

    file_obj = await highest_res_photo.get_file()
    await process_report_file(file_obj, "photo_upload.jpg", ".jpg", update)

async def handle_other_messages(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handles plain text messages."""
    await update.message.reply_text(
        "👋 Please upload or send a photo/PDF of a medical laboratory report to analyze.\n"
        "Use /help to see all supported options."
        + DISCLAIMER_TEXT,
        parse_mode="Markdown"
    )

def create_telegram_application() -> Optional[Application]:
    """Creates and configures the Telegram Application instance."""
    token = settings.TELEGRAM_BOT_TOKEN
    if not token or token.strip() in ("", "your_telegram_bot_token_here"):
        logger.warning("TELEGRAM_BOT_TOKEN is not configured. Telegram bot is disabled.")
        return None

    app = ApplicationBuilder().token(token).build()

    # Register handlers
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(MessageHandler(filters.Document.ALL, handle_document))
    app.add_handler(MessageHandler(filters.PHOTO, handle_photo))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_other_messages))

    return app

def run_bot():
    """Starts the bot in polling mode if token is configured."""
    app = create_telegram_application()
    if not app:
        print("\nℹ️ ReportSaathi Telegram Bot: TELEGRAM_BOT_TOKEN is unset in backend/.env.")
        print("To enable the bot:")
        print("1. Open Telegram and search for @BotFather")
        print("2. Send /newbot to create your bot and copy the API token")
        print("3. Set TELEGRAM_BOT_TOKEN=<your_token> in backend/.env")
        print("4. Re-run: ./venv/bin/python run_bot.py\n")
        return

    print("ReportSaathi Telegram Bot is starting polling...")
    try:
        app.run_polling()
    except InvalidToken:
        print("\n❌ Error: The provided TELEGRAM_BOT_TOKEN was rejected by Telegram.")
        print("Your token in backend/.env appears to be a placeholder or invalid.")
        print("To fix this:")
        print("1. Open Telegram and message @BotFather")
        print("2. Send /token or /newbot to obtain your real bot token")
        print("3. Update TELEGRAM_BOT_TOKEN=<your_real_token> in backend/.env")
        print("4. Re-run: ./venv/bin/python run_bot.py\n")
    except Exception as e:
        print(f"\n⚠️ Telegram Bot stopped: {type(e).__name__}: {e}\n")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    run_bot()
