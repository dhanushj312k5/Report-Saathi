import io
import requests
from reportlab.pdfgen import canvas
from PIL import Image, ImageDraw

try:
    from fastapi.testclient import TestClient
    from app.main import app
    test_client = TestClient(app)
except Exception:
    test_client = None

BASE_URL = "http://127.0.0.1:8000/api"

def _get(path):
    if test_client:
        return test_client.get(f"/api{path}")
    return requests.get(f"{BASE_URL}{path}")

def _post_file(path, filename, content, mime_type):
    if test_client:
        return test_client.post(
            f"/api{path}",
            files={"file": (filename, content, mime_type)}
        )
    return requests.post(
        f"{BASE_URL}{path}",
        files={"file": (filename, content, mime_type)}
    )

def test_health():
    res = _get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["status"] == "healthy"
    print("✓ Health endpoint verified")

def test_scenario_normal_cbc():
    packet = io.BytesIO()
    c = canvas.Canvas(packet)
    c.drawString(50, 750, "ROUTINE COMPLETE BLOOD COUNT (CBC)")
    c.drawString(50, 700, "Hemoglobin: 14.5 g/dL (Reference: 13.0 - 17.0)")
    c.drawString(50, 650, "Total Leukocytes (WBC): 7200 /uL (Reference: 4000 - 11000)")
    c.drawString(50, 600, "Platelet Count: 250000 /uL (Reference: 150000 - 450000)")
    c.save()
    packet.seek(0)

    res = _post_file("/reports/analyze", "normal_cbc.pdf", packet.getvalue(), "application/pdf")
    assert res.status_code == 200
    data = res.json()
    assert data["overall_status"] == "all_normal"
    assert len(data["parameters"]) >= 3
    print("✓ Scenario 1: Normal CBC passed")

def test_scenario_elevated_lipid():
    packet = io.BytesIO()
    c = canvas.Canvas(packet)
    c.drawString(50, 750, "CARDIOVASCULAR LIPID PROFILE")
    c.drawString(50, 700, "Total Cholesterol: 240 mg/dL (Reference: < 200)")
    c.drawString(50, 650, "Triglycerides: 190 mg/dL (Reference: < 150)")
    c.drawString(50, 600, "HDL Cholesterol: 45 mg/dL (Reference: > 40)")
    c.drawString(50, 550, "LDL Cholesterol: 155 mg/dL (Reference: < 100)")
    c.save()
    packet.seek(0)

    res = _post_file("/reports/analyze", "elevated_lipid.pdf", packet.getvalue(), "application/pdf")
    assert res.status_code == 200
    data = res.json()
    assert data["overall_status"] == "attention_needed"
    print("✓ Scenario 2: Elevated Lipid Panel passed")

def test_scenario_missing_ranges_non_hallucination():
    packet = io.BytesIO()
    c = canvas.Canvas(packet)
    c.drawString(50, 750, "PATHOLOGY SLIP (NO REFERENCE RANGES)")
    c.drawString(50, 700, "Fasting Blood Glucose: 105 mg/dL")
    c.drawString(50, 650, "Serum Creatinine: 1.0 mg/dL")
    c.save()
    packet.seek(0)

    res = _post_file("/reports/analyze", "missing_ranges.pdf", packet.getvalue(), "application/pdf")
    assert res.status_code == 200
    data = res.json()
    for p in data["parameters"]:
        # Verify non-hallucination constraint
        assert "N/A" in p["reference_range"], f"Hallucinated range detected: {p['reference_range']}"
    print("✓ Scenario 3: Missing ranges non-hallucination rule verified")

if __name__ == "__main__":
    print("Running ReportSaathi Synthetic Test Suite...")
    test_health()
    test_scenario_normal_cbc()
    test_scenario_elevated_lipid()
    test_scenario_missing_ranges_non_hallucination()
    print("All tests passed successfully!")
