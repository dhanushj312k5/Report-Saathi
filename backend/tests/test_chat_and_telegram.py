import os
from fastapi.testclient import TestClient
from app.main import app
from app.bot.telegram_bot import (
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE_BYTES,
    DISCLAIMER_TEXT,
    create_telegram_application
)

client = TestClient(app)

SAMPLE_CBC_REPORT = {
    "report_title": "Complete Blood Count (CBC)",
    "overall_status": "all_normal",
    "summary": "All cell counts are within standard clinical thresholds.",
    "parameters": [
        {
            "name": "Hemoglobin",
            "value": "14.5",
            "unit": "g/dL",
            "reference_range": "13.0 - 17.0 g/dL",
            "status": "normal",
            "status_label": "Normal",
            "simple_explanation": "Hemoglobin is the oxygen-carrying protein inside red blood cells.",
            "why_it_matters": "Adequate hemoglobin ensures tissues receive oxygen."
        },
        {
            "name": "Platelets",
            "value": "250000",
            "unit": "/uL",
            "reference_range": "150000 - 450000 /uL",
            "status": "normal",
            "status_label": "Normal",
            "simple_explanation": "Platelets help blood clot when an injury occurs.",
            "why_it_matters": "Prevents excessive bleeding."
        }
    ]
}

def test_chat_in_bounds_parameter():
    """Asking about a parameter explicitly present in the report returns the report's facts."""
    response = client.post("/api/reports/chat", json={
        "question": "What is my Hemoglobin reading?",
        **SAMPLE_CBC_REPORT
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_supported_by_report"] is True
    assert "Hemoglobin" in data["related_parameters"]
    assert "14.5" in data["answer"]
    assert "educational_disclaimer" in data
    print("✓ Chat test passed: In-bounds parameter correctly answered.")

def test_chat_out_of_bounds_unsupported():
    """
    CRITICAL SAFETY RULE:
    Asking about a test or condition NOT present in the report MUST return:
    'This information is not available in your laboratory report. I recommend discussing this with your healthcare professional.'
    and set is_supported_by_report = False.
    """
    response = client.post("/api/reports/chat", json={
        "question": "What is my cholesterol level and do I have diabetes?",
        **SAMPLE_CBC_REPORT
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_supported_by_report"] is False
    assert "This information is not available in your laboratory report. I recommend discussing this with your healthcare professional." in data["answer"]
    assert len(data["related_parameters"]) == 0
    print("✓ Chat test passed: Out-of-bounds query strictly rejected with safe clinical referral.")

def test_chat_doctor_talking_points():
    """Asking for physician talking points generates informed, non-diagnostic questions."""
    response = client.post("/api/reports/chat", json={
        "question": "What should I ask my doctor about these results?",
        **SAMPLE_CBC_REPORT
    })
    assert response.status_code == 200
    data = response.json()
    assert data["is_supported_by_report"] is True
    assert "doctor" in data["answer"].lower() or "physician" in data["answer"].lower()
    print("✓ Chat test passed: Doctor consultation questions returned.")

def test_telegram_constants_and_safety():
    """Verifies Telegram Bot validation constraints and mandatory disclaimers."""
    assert ".pdf" in ALLOWED_EXTENSIONS
    assert ".jpg" in ALLOWED_EXTENSIONS
    assert ".png" in ALLOWED_EXTENSIONS
    assert ".exe" not in ALLOWED_EXTENSIONS
    assert MAX_FILE_SIZE_BYTES == 10 * 1024 * 1024
    assert "Educational Use Only" in DISCLAIMER_TEXT
    assert "strictly non-diagnostic" in DISCLAIMER_TEXT
    print("✓ Telegram Bot test passed: File types, size boundaries and disclaimers verified.")

def test_telegram_notification_endpoint():
    """Verifies that the /api/reports/notify-telegram endpoint handles requests safely."""
    # 1. Without chat ID
    res1 = client.post("/api/reports/notify-telegram", json={
        "report_title": "Complete Blood Count (CBC)",
        "parameters": SAMPLE_CBC_REPORT["parameters"]
    })
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["success"] is False
    assert "Telegram Chat ID" in data1["message"] or "TELEGRAM_BOT_TOKEN" in data1["message"]

    # 2. With dummy chat ID
    res2 = client.post("/api/reports/notify-telegram", json={
        "chat_id": "99999999",
        "report_title": "Complete Blood Count (CBC)",
        "parameters": SAMPLE_CBC_REPORT["parameters"],
        "doctor_questions": ["What is my baseline?"]
    })
    assert res2.status_code == 200
    data2 = res2.json()
    assert "success" in data2
    print("✓ Telegram notification endpoint verified.")

if __name__ == "__main__":
    test_chat_in_bounds_parameter()
    test_chat_out_of_bounds_unsupported()
    test_chat_doctor_talking_points()
    test_telegram_constants_and_safety()
    test_telegram_notification_endpoint()
    print("\n🎉 ALL CHAT & TELEGRAM TESTS PASSED!")
