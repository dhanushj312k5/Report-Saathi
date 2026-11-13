# ReportSaathi Backend API 🩺

FastAPI backend for **ReportSaathi**, an educational laboratory report explainer.

## 🌟 Key Features
- **Endpoint**: `POST /api/reports/analyze`
  - Accepts `.pdf`, `.jpg`, `.jpeg`, and `.png` files.
  - Safe chunked streaming & temporary file handling with guaranteed deletion on completion.
  - File size validation (rejects files exceeding 10MB with HTTP 413).
  - Dual-mode extraction:
    - Digital PDFs: layout-aware extraction via `pdfplumber`.
    - Scanned PDFs & Photos: optical character recognition via `pypdfium2` and `Tesseract OCR`.
  - Non-hallucination constraint: strictly parses parameters explicitly detected in document text. Never invents missing values or biological intervals.
- **Health-Check Endpoint**: `GET /api/health`
  - Returns backend status, tesseract version, supported formats, and system limits.

---

## 🛠️ Prerequisites
- Python 3.10+ (Current system: Python 3.14)
- Tesseract OCR (installed via Homebrew at `/opt/homebrew/bin/tesseract`)

---

## 🚀 Setup & Local Execution

### 1. Create and Activate Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables (`.env`)
Create a `.env` file in `backend/`:
```env
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
TESSERACT_CMD=/opt/homebrew/bin/tesseract
GEMINI_API_KEY=
```

### 4. Start the Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API is available at: `http://localhost:8000`
- Interactive OpenAPI documentation: `http://localhost:8000/docs`

---

## 🧪 Testing with cURL

### 1. Health Check
```bash
curl -X GET http://localhost:8000/api/health
```

### 2. Analyze Document
```bash
curl -X POST http://localhost:8000/api/reports/analyze \
  -F "file=@/path/to/blood_test.pdf"
```

### 3. Test File Validation (Unsupported Format)
```bash
curl -X POST http://localhost:8000/api/reports/analyze \
  -F "file=@sample.txt"
# Returns 400 Bad Request with: "Unsupported file format '.txt'..."
```
