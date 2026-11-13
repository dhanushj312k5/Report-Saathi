# ReportSaathi 🩺

**ReportSaathi** is an empathetic, educational web application that translates complex medical laboratory reports (PDFs, scans, and photos) into clear, plain language (6th–8th grade reading level).

> **Important Medical Disclaimer**: ReportSaathi is designed solely for health literacy and educational awareness. It **does NOT** provide medical diagnoses, clinical consultations, or prescription treatments. Always review your laboratory reports with a licensed healthcare physician.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React Icons, Axios
- **Backend**: Python 3, FastAPI, Uvicorn, Pydantic v2
- **Text Extraction & OCR**: Tesseract OCR (via `pytesseract`), `pdfplumber`, `pypdfium2`, `Pillow`
- **AI Explanation Engine**: Google Gemini API (`gemini-2.5-flash` with structured Pydantic JSON schema + educational fallback)
- **Database & Auth (Optional)**: Supabase

---

## 🚀 Quick Start Instructions

### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# (Optional) Add your Gemini API key to .env for live Gemini explanations:
# GEMINI_API_KEY=your_key_here

uvicorn app.main:app --reload --port 8000
```
The FastAPI backend will be live at `http://localhost:8000` (API docs at `http://localhost:8000/docs`).

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
The Vite development server will be live at `http://localhost:5173`.

---

## 🌟 Key Features

1. **Dual-Mode Text Extraction**: Automatically extracts digital text from clean PDFs and falls back to Tesseract OCR for scanned papers or mobile phone photos.
2. **Plain-Language Explanations**: Translates metrics like *Hemoglobin, HbA1c, Total Cholesterol, eGFR, Creatinine* into layperson concepts with status badges (`Normal`, `Higher than Normal`, `Lower than Normal`).
3. **Doctor-Ready Questions**: Generates practical, informed questions tailored to your report for your next medical appointment.
4. **General Wellness Insights**: Provides non-prescriptive, evidence-based lifestyle tips (hydration, balanced nutrition).
5. **OCR Transparency Inspector**: Review raw extracted text side-by-side to cross-check readings against original documents.
6. **Built-in Sample Reports**: Instant one-click clinical samples (Lipid Panel, Complete Blood Count, Metabolic Panel) to test without needing a personal document.
