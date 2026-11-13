# ReportSaathi 🩺
> **AI-Powered Educational Laboratory Report Companion**

ReportSaathi is an empathetic, privacy-first web application designed to help patients understand complex laboratory reports in plain language (6th–8th grade reading level). It explains clinical biomarkers, visualizes biological reference intervals, empowers patients with informed questions for their doctors, and supports opt-in health history and Telegram notifications.

> ⚠️ **MANDATORY EDUCATIONAL DISCLAIMER**:
> ReportSaathi is designed solely for health literacy and educational awareness. It **does NOT** provide clinical diagnoses, medical pronouncements, or prescription medication treatments. Always review your original laboratory documents with a licensed healthcare physician.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons | Responsive Dark UI (Desktop & Mobile) |
| **Backend** | FastAPI, Uvicorn, Pydantic v2 | High-performance async REST API |
| **Document Processing** | `pdfplumber`, `pypdfium2`, `pytesseract`, Pillow | Dual-mode text extraction & OCR |
| **OCR Engine** | Tesseract OCR (v5.x) | Optical character recognition for scanned reports & photos |
| **AI Explanation Engine** | Google Gemini API (`gemini-2.5-flash`) | Structured JSON explanations with deterministic fallback |
| **Database & Auth (Optional)**| Supabase (PostgreSQL with RLS) | Opt-in educational history & user authentication |
| **Messaging (Optional)** | Telegram Bot API (`python-telegram-bot` 22.x) | Instant mobile report delivery & bot interactions |

---

## 🔒 Privacy & Medical Guardrails

1. **Strict Ephemeral Processing**: Uploaded documents are processed in temporary memory and deleted immediately after analysis. Files and raw medical text are never stored by default.
2. **PII Sanitization**: Automatic redaction of phone numbers, emails, and personal national IDs during extraction.
3. **No Hallucination of Reference Ranges**: If a laboratory slip omits a reference interval, the system marks it as `"N/A (Not specified in report)"` and flags it with an educational note rather than inventing clinical ranges.
4. **Report-Bounded Chat**: The interactive educational assistant answers questions exclusively from the uploaded document's extracted facts. Queries about unlisted diseases or medications are strictly declined with a referral to a doctor.
5. **Zero Token / Secret Logging**: API keys, bot tokens, and sensitive patient readings are excluded from terminal logs.

---

## ⚙️ Environment Variables Reference

Never commit real secret keys to source control. Use `.env` files locally.

### Backend (`backend/.env`)

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `8000` | Port for the FastAPI server |
| `ALLOWED_ORIGINS` | Required | `http://localhost:5173,http://localhost:3000` | Comma-separated list or JSON array of allowed CORS origins |
| `TESSERACT_CMD` | Optional | `/usr/bin/tesseract` or auto-detected | Absolute path to the Tesseract OCR executable binary |
| `GEMINI_API_KEY` | Optional | *(Leave empty for Demo Mode)* | Google Gemini API Key for live AI explanations |
| `SUPABASE_URL` | Optional | *(Leave empty for Demo Mode)* | Supabase project API URL (`https://xyz.supabase.co`) |
| `SUPABASE_KEY` | Optional | *(Leave empty for Demo Mode)* | Supabase `anon` / service role key |
| `TELEGRAM_BOT_TOKEN` | Optional | *(Leave empty for Demo Mode)* | HTTP API token from `@BotFather` |
| `TELEGRAM_DEFAULT_CHAT_ID` | Optional | `""` | Optional default Telegram chat ID for notifications |

*Note: If `GEMINI_API_KEY`, `SUPABASE_URL`, or `TELEGRAM_BOT_TOKEN` are omitted, ReportSaathi operates smoothly in **Demo Mode** using its built-in clinical rule engine without failing.*

### Frontend (`frontend/.env`)

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Required | `http://localhost:8000/api` | Base URL of the ReportSaathi backend API |
| `VITE_SUPABASE_URL` | Optional | `""` | Supabase project URL for client-side Auth & History |
| `VITE_SUPABASE_ANON_KEY` | Optional | `""` | Supabase anonymous public client key |

---

## 💻 Local Setup & Development

### Prerequisites
- Python 3.10+ (Python 3.11 recommended)
- Node.js 18+ & npm
- Tesseract OCR (Install via Homebrew on macOS: `brew install tesseract`, or on Ubuntu: `sudo apt-get install tesseract-ocr`)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy example environment configuration
cp .env.example .env

# Run FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Health Check: `http://localhost:8000/api/health`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend

# Install node dependencies
npm install

# Copy example environment configuration
cp .env.example .env

# Start Vite development server
npm run dev
```
- Web Application UI: `http://localhost:5173`

### 3. Optional: Telegram Bot Runner

```bash
cd backend
source venv/bin/activate
# Ensure TELEGRAM_BOT_TOKEN is set in backend/.env
python run_bot.py
```

---

## 🧪 Testing Commands

ReportSaathi includes an automated QA test suite verifying edge cases, OCR limits, upload bounds, and safety guardrails:

```bash
# Run comprehensive QA test suite
PYTHONPATH=backend backend/venv/bin/python backend/tests/test_qa_suite.py

# Run Report-Specific Chat & Telegram tests
PYTHONPATH=backend backend/venv/bin/python backend/tests/test_chat_and_telegram.py

# Run Synthetic Clinical Report test suite
PYTHONPATH=backend backend/venv/bin/python backend/tests/test_synthetic_reports.py

# Run Frontend Production Build verification
cd frontend && npm run build
```

---

## 🛠️ Troubleshooting Guide

### 1. `TesseractNotFoundError` or OCR fails on images
- **Cause**: Tesseract OCR binary is missing or not located at the configured path.
- **Fix**: Check that tesseract is installed (`tesseract --version`). Set `TESSERACT_CMD` in `backend/.env` to the binary path (`/opt/homebrew/bin/tesseract` on macOS Apple Silicon or `/usr/bin/tesseract` on Linux).

### 2. Telegram Bot reports `InvalidToken: Unauthorized`
- **Cause**: The token in `backend/.env` is unset or a placeholder (`123456789:ABCdef...`).
- **Fix**: Open Telegram, search for `@BotFather`, send `/newbot`, and copy the genuine token into `backend/.env`. In the web app, Telegram notifications will automatically run in **Demo Simulation Mode** if a real token is not yet provided.

### 3. CORS Error in Frontend (`Access-Control-Allow-Origin`)
- **Cause**: The backend `ALLOWED_ORIGINS` setting does not include the frontend's origin.
- **Fix**: Update `ALLOWED_ORIGINS` in `backend/.env` to include your frontend URL (e.g., `http://localhost:5173,https://your-domain.pages.dev`).

### 4. Blank or blurry upload returns HTTP 422
- **Cause**: The document has fewer than 10 alphanumeric characters after OCR processing.
- **Fix**: Upload a higher-resolution scan, ensure the page is well-lit, or test using the pre-loaded synthetic samples in the web app.

---

## 🚢 Production Deployment Instructions

### A. Deploy Backend on Render

Render Web Services provide automated HTTPS and containerized environments. Because ReportSaathi relies on Tesseract OCR, deploying via **Docker** is the recommended zero-friction approach.

#### Method 1: Using the Render Blueprint (`render.yaml`)
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), navigate to **Blueprints** → **New Blueprint Instance**.
3. Select your `Report-Saathi` repository. Render will automatically detect [render.yaml](file:///Users/dhanushj/Documents/Workshop/render.yaml) and configure the Docker service.

#### Method 2: Manual Web Service Setup on Render
1. In Render Dashboard, click **New +** → **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Configure the service settings:
   - **Name**: `reportsaathi-backend`
   - **Language / Runtime**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Docker Context**: `backend`
   - **Health Check Path**: `/api/health`
4. Add Environment Variables in Render:
   - `PORT`: `8000`
   - `ALLOWED_ORIGINS`: `https://<YOUR-FRONTEND>.pages.dev,http://localhost:5173`
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `SUPABASE_URL`: *(Your Supabase URL)*
   - `SUPABASE_KEY`: *(Your Supabase Anon or Service Key)*
   - `TELEGRAM_BOT_TOKEN`: *(Your Telegram Bot Token)*
5. Click **Create Web Service**. Once deployed, Render provides a URL like `https://reportsaathi-backend.onrender.com`.
6. Verify deployment by opening: `https://reportsaathi-backend.onrender.com/api/health`.

---

### B. Deploy Frontend on Cloudflare Pages

Cloudflare Pages provides lightning-fast global CDN delivery for Vite single-page applications.

1. Push your code to GitHub.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select your `Report-Saathi` repository.
4. Set the Build Configuration:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
5. Configure Environment Variables in Cloudflare Pages:
   - `VITE_API_BASE_URL`: `https://reportsaathi-backend.onrender.com/api` (Point to your Render backend URL)
   - `VITE_SUPABASE_URL`: *(Optional Supabase Project URL)*
   - `VITE_SUPABASE_ANON_KEY`: *(Optional Supabase Anon Key)*
6. **SPA Routing**: The repository includes `frontend/public/_redirects` which automatically maps all client-side routes to `/index.html` with HTTP 200.
7. Click **Save and Deploy**. Once finished, your frontend is accessible globally at `https://reportsaathi.pages.dev`.

---

## 📋 QA Final Audit Checklist

- [x] **Frontend Production Build**: Clean build without errors (`npm run build` completed in 1.19s).
- [x] **Upload Boundary Validation**: Rejects files $>10$ MB (HTTP 413), empty files (HTTP 400), and invalid extensions (HTTP 400).
- [x] **OCR Failure Handling**: Unreadable/blank scans gracefully return HTTP 422 with actionable guidance.
- [x] **Gemini Timeout & Quota Fallback**: Automatic recovery via deterministic medical rules engine if Gemini times out or is offline.
- [x] **Zero Secret Leakage**: No API keys, bot tokens, or database secrets exposed in frontend bundles or API error bodies.
- [x] **Database Row Level Security (RLS)**: Opt-in report history strictly isolated to `auth.uid() = user_id`.
- [x] **Mobile Responsiveness**: Viewport-safe modals (`max-h-[90vh]`), responsive chat bubbles, and wrapping action toolbars.
- [x] **Telegram Notifications**: Both live API delivery and local demo simulation mode supported.

---

## ⚠️ Known Technical Limitations

1. **Complex Multi-Column Tables in OCR**: Severely skewed or handwritten doctor notes may have low OCR accuracy; the app prompts users to upload clean digital PDFs or well-lit flat photos.
2. **Language Support**: AI educational translations and keyword matching currently target English medical terminology; multi-language support (Hindi, Spanish, etc.) is slated for subsequent releases.
3. **Render Free Tier Spin-Down**: Free-tier instances on Render sleep after 15 minutes of inactivity; the initial cold-start request may take ~30–50 seconds. Upgrading to a paid instance or utilizing an external pinger resolves cold starts.
