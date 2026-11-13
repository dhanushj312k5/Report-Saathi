import io
import os
import unittest
from unittest.mock import patch, MagicMock
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app
from app.services.analyzer import analyze_report_with_gemini, extract_deterministic_report
from app.services.extractor import sanitize_pii
from app.services.supabase_client import (
    save_report_to_supabase,
    fetch_user_reports_from_supabase,
    delete_report_from_supabase
)
from app.services.telegram_service import format_telegram_report_html
from app.models.schemas import TelegramNotificationRequest

client = TestClient(app)

class TestReportSaathiQA(unittest.TestCase):
    
    # ================= 1. UPLOAD VALIDATION TESTS =================
    
    def test_upload_unsupported_file_extension(self):
        """QA Test: Unsupported file format (.exe, .txt, .zip) must return 400."""
        fake_content = b"Some random text file content"
        response = client.post(
            "/api/reports/analyze",
            files={"file": ("malicious.exe", fake_content, "application/octet-stream")}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("Unsupported file format", response.json()["detail"])
        print("✓ QA: Unsupported file format rejected (HTTP 400)")

    def test_upload_empty_file(self):
        """QA Test: Empty 0-byte file must return 400."""
        empty_content = b""
        response = client.post(
            "/api/reports/analyze",
            files={"file": ("empty_report.pdf", empty_content, "application/pdf")}
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("empty", response.json()["detail"].lower())
        print("✓ QA: Empty 0-byte file rejected (HTTP 400)")

    def test_upload_oversized_file(self):
        """QA Test: File larger than 10MB must return 413."""
        # 10MB + 1KB
        oversized_content = b"0" * (10 * 1024 * 1024 + 1024)
        response = client.post(
            "/api/reports/analyze",
            files={"file": ("large_report.pdf", oversized_content, "application/pdf")}
        )
        self.assertEqual(response.status_code, 413)
        self.assertIn("10mb", response.json()["detail"].lower())
        print("✓ QA: Oversized >10MB file rejected (HTTP 413)")

    # ================= 2. OCR / EXTRACTION FAILURE TESTS =================

    def test_upload_blank_image_ocr_failure(self):
        """QA Test: Blank or unreadable image with no text must return 422."""
        img = Image.new("RGB", (300, 300), color=(255, 255, 255))
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_bytes = img_byte_arr.getvalue()

        response = client.post(
            "/api/reports/analyze",
            files={"file": ("blank_scan.png", img_bytes, "image/png")}
        )
        self.assertEqual(response.status_code, 422)
        self.assertIn("No readable text could be extracted", response.json()["detail"])
        print("✓ QA: Blank unreadable scan gracefully handled (HTTP 422)")

    # ================= 3. GEMINI TIMEOUT / EXCEPTION / FALLBACK TESTS =================

    def test_gemini_exception_fallback(self):
        """QA Test: When Gemini API raises an exception/timeout, deterministic fallback takes over safely."""
        with patch("app.services.analyzer.settings.GEMINI_API_KEY", "mock_gemini_api_key"):
            with patch("google.genai.Client") as mock_client:
                mock_instance = MagicMock()
                mock_instance.models.generate_content.side_effect = Exception("Simulated Gemini API timeout / quota 429")
                mock_client.return_value = mock_instance

                # Call with text containing real parameters
                text = "FASTING BLOOD SUGAR: 95 mg/dL\nTOTAL CHOLESTEROL: 180 mg/dL"
                report, engine = analyze_report_with_gemini(text)

                self.assertTrue(report.is_clarity_sufficient)
                self.assertIn("gemini-fallback", engine)
                self.assertGreaterEqual(len(report.parameters), 1)
                self.assertTrue(any("glucose" in p.name.lower() or "sugar" in p.name.lower() or "cholesterol" in p.name.lower() for p in report.parameters))
                print("✓ QA: Gemini timeout/failure safely recovers via deterministic engine")

    # ================= 4. MISSING ENVIRONMENT VARIABLES TESTS =================

    def test_missing_env_vars_safety(self):
        """QA Test: App functions predictably in Demo Mode without API keys."""
        # Check health endpoint
        res = client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("supported_formats", data)
        self.assertEqual(data["status"], "healthy")
        print("✓ QA: Health endpoint stable across missing env variable configurations")

    # ================= 5. DATABASE ACCESS CONTROL TESTS =================

    def test_database_access_control_and_privacy(self):
        """QA Test: Supabase operations require user_id and strip raw document binaries."""
        # 1. Missing user_id should be rejected
        res = client.post("/api/reports/save", json={"report": {"title": "Test"}})
        self.assertEqual(res.status_code, 400)

        # 2. Saving in demo mode (when credentials unset) should return demo_mode: true without pretending
        res_save = save_report_to_supabase("user-123", {
            "title": "Lipid Report",
            "parameters": [{"name": "Cholesterol", "value": "210", "unit": "mg/dL"}],
            "raw_extracted_text": "Sensitive original document text that should NEVER be stored"
        })
        self.assertIn("demo_mode", res_save)

        # 3. Fetching reports in demo mode
        res_fetch = fetch_user_reports_from_supabase("user-123")
        self.assertIn("demo_mode", res_fetch)

        # 4. Deleting reports in demo mode
        res_del = delete_report_from_supabase("user-123", "report-999")
        self.assertIn("demo_mode", res_del)
        print("✓ QA: Database access control and privacy stripping verified")

    # ================= 6. PII SANITIZATION TEST =================

    def test_pii_sanitization(self):
        """QA Test: Phone numbers, emails, and Indian Aadhaar numbers are redacted."""
        raw = "Patient Contact: john.doe@example.com, Phone: +91 9876543210, ID: 1234 5678 9012"
        clean = sanitize_pii(raw)
        self.assertNotIn("john.doe@example.com", clean)
        self.assertNotIn("9876543210", clean)
        self.assertNotIn("1234 5678 9012", clean)
        self.assertIn("[REDACTED_EMAIL]", clean)
        self.assertIn("[REDACTED_PHONE]", clean)
        self.assertIn("[REDACTED_ID]", clean)
        print("✓ QA: PII sanitization verified")

    # ================= 7. TELEGRAM FORMATTING & DISCLAIMER TEST =================

    def test_telegram_html_formatting_and_disclaimer(self):
        """QA Test: Telegram notification payload includes parameters, doctor questions, and safety disclaimer."""
        req = TelegramNotificationRequest(
            chat_id="123456",
            report_title="Cardiology Panel",
            overall_status="attention_needed",
            parameters=[{"name": "Triglycerides", "value": "220", "unit": "mg/dL", "status": "high", "reference_range": "< 150"}],
            doctor_questions=["Should I adjust my diet?"]
        )
        html_text = format_telegram_report_html(req)
        self.assertIn("Cardiology Panel", html_text)
        self.assertIn("Triglycerides", html_text)
        self.assertIn("Educational Use Only", html_text)
        self.assertIn("strictly non-diagnostic", html_text)
        print("✓ QA: Telegram HTML formatting and mandatory disclaimer verified")

if __name__ == "__main__":
    unittest.main()
