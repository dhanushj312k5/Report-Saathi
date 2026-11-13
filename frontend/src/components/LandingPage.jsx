import React from 'react';
import { 
  ArrowRight, 
  Calendar, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Database, 
  BarChart3, 
  TrendingUp, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Image as ImageIcon,
  Play,
  Flame,
  Check,
  AlertTriangle
} from 'lucide-react';

export default function LandingPage({ onGoToDashboard, onOpenUpload, onSelectSample }) {
  return (
    <div className="space-y-24 pb-24 text-slate-100 animate-fadeIn">
      {/* ================= HERO SECTION (Direct Match to Screenshot Top Section) ================= */}
      <section className="relative pt-6 pb-12 text-center max-w-4xl mx-auto space-y-6">
        {/* Subtle Background Glow behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none"></div>

        {/* Top Release Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#17181c] border border-white/10 text-xs text-slate-300 hover:border-red-500/40 transition cursor-pointer group shadow-lg">
          <span className="text-red-500">🚀</span>
          <span>New Release — ReportSaathi 2.0 is here</span>
          <span className="text-slate-500 group-hover:translate-x-0.5 transition">›</span>
        </div>

        {/* Giant Main Display Headline */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            The Data Platform <br />
            Built for <span className="text-red-500">Velocity</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto pt-2 leading-relaxed">
            Ingest, extract, and act on your medical laboratory reports in real-time. ReportSaathi helps patients understand faster and scale health literacy.
          </p>
        </div>

        {/* CTA Buttons (Matching Red Button + Dark Glass Button) */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 bg-[#e51d38] hover:bg-red-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition cursor-pointer"
          >
            <span>Upload Lab Report</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onGoToDashboard}
            className="inline-flex items-center gap-2 bg-[#121318] hover:bg-[#1a1b22] text-slate-200 border border-white/10 font-semibold text-xs sm:text-sm px-6 py-3 rounded-full transition cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Open Dashboard</span>
          </button>
        </div>

        {/* ================= 3 METRICS CARDS ROW (Matching Screenshot) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-10 text-left">
          {/* Card 1: Data Ingested */}
          <div className="md:col-span-3 bg-[#0f1015] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-red-500/30 transition">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-3">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 font-medium block">
              Reports Decoded
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              2.45 K
            </div>
            <div className="text-[11px] text-red-400 font-medium flex items-center gap-1 mt-2">
              <span>↗ 32% vs last 7 days</span>
            </div>
          </div>

          {/* Card 2: Queries Run */}
          <div className="md:col-span-3 bg-[#0f1015] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-red-500/30 transition">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-3">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-xs text-slate-400 font-medium block">
              Biomarkers Tested
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              1.82 M
            </div>
            <div className="text-[11px] text-red-400 font-medium flex items-center gap-1 mt-2">
              <span>↗ 24% vs last 7 days</span>
            </div>
          </div>

          {/* Card 3: Event Volume with Red Sparkline Area Chart */}
          <div className="md:col-span-6 bg-[#0f1015] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-red-500/30 transition flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium block">
                  Processing Volume
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                  18.6 M
                </div>
                <span className="text-[11px] text-red-400 font-medium block mt-0.5">
                  ↗ 26% vs last 7 days
                </span>
              </div>

              <div className="text-[10px] text-slate-500 font-mono text-right">
                <span>Real-time Stream</span>
              </div>
            </div>

            {/* Red Area Sparkline Chart */}
            <div className="mt-4 pt-2">
              <svg viewBox="0 0 320 60" className="w-full h-14 overflow-visible">
                <defs>
                  <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e51d38" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#e51d38" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Area Fill */}
                <path
                  d="M0,45 Q40,35 80,40 T160,20 T240,30 T320,10 L320,60 L0,60 Z"
                  fill="url(#redGradient)"
                />
                {/* Sparkline Stroke */}
                <path
                  d="M0,45 Q40,35 80,40 T160,20 T240,30 T320,10"
                  fill="none"
                  stroke="#e51d38"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1 px-1">
                <span>May 7</span>
                <span>May 8</span>
                <span>May 9</span>
                <span>May 10</span>
                <span>May 11</span>
                <span>May 12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MIDDLE SECTION: "EVERYTHING YOU NEED TO TURN DATA INTO DECISIONS" ================= */}
      <section className="max-w-6xl mx-auto pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-5 space-y-5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-red-500">
              POWERFUL. FLEXIBLE. INTUITIVE.
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Everything you <br />
              need to turn <br />
              data into <br />
              <span className="text-red-500">decisions</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              ReportSaathi unifies your medical pathology reports with real-time OCR extraction, powerful clinical reference algorithms, and intuitive educational breakdowns — all in one accessible platform.
            </p>

            <div className="pt-2">
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-2 bg-[#e51d38] hover:bg-red-600 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg shadow-red-600/30 transition cursor-pointer"
              >
                <span>Explore Features</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Dark Dashboard Mockup (Matching Screenshot) */}
          <div className="lg:col-span-7 bg-[#0b0c10] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            {/* Top row: Pipelines (Left) & Metrics Cluster (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              {/* Pipelines sub-card */}
              <div className="sm:col-span-5 bg-[#121318] border border-white/5 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">Pipelines</span>
                  <span className="text-[10px] text-slate-500">View all</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <div>
                      <p className="font-medium text-white">CBC Analysis</p>
                      <p className="text-[9px] text-slate-500">Streaming</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <div>
                      <p className="font-medium text-white">Lipid Profile</p>
                      <p className="text-[9px] text-slate-500">Streaming</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <div>
                      <p className="font-medium text-white">Metabolic Panel</p>
                      <p className="text-[9px] text-slate-500">Batch</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <div>
                      <p className="font-medium text-white">Renal Function</p>
                      <p className="text-[9px] text-slate-500">Streaming</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                </div>

                <button
                  onClick={onOpenUpload}
                  className="w-full text-center py-1.5 text-[10px] font-semibold text-slate-300 bg-white/5 hover:bg-white/10 rounded-lg transition"
                >
                  + New Document
                </button>
              </div>

              {/* Stats & Query Box */}
              <div className="sm:col-span-7 space-y-3">
                {/* 3 Metric counters */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#121318] p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] text-slate-400 block">Active Users</span>
                    <span className="text-xs font-bold text-white block mt-0.5">24.8 K</span>
                    <span className="text-[8px] text-red-400">↗ 18%</span>
                  </div>
                  <div className="bg-[#121318] p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] text-slate-400 block">Latency</span>
                    <span className="text-xs font-bold text-white block mt-0.5">120 ms</span>
                    <span className="text-[8px] text-emerald-400">↘ 19%</span>
                  </div>
                  <div className="bg-[#121318] p-2.5 rounded-xl border border-white/5 text-center">
                    <span className="text-[9px] text-slate-400 block">Success Rate</span>
                    <span className="text-xs font-bold text-white block mt-0.5">99.98%</span>
                    <span className="text-[8px] text-emerald-400">↗ 0.02%</span>
                  </div>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                    <span>⚡</span> Real-time
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                    <span>●</span> Scalable
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                    <span>🛡️</span> Secure
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                    <span>✓</span> Reliable
                  </span>
                </div>

                {/* Query Editor Box */}
                <div className="bg-[#121318] rounded-xl border border-white/5 p-3 font-mono text-[10px] space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-white/5 text-[9px]">
                    <span>Diagnostic Inspector</span>
                    <span>JSON / OCR ▾</span>
                  </div>
                  <div className="text-slate-400 leading-tight">
                    <p><span className="text-red-400">SELECT</span> test_name, value, unit</p>
                    <p><span className="text-red-400">FROM</span> pathology_report</p>
                    <p><span className="text-red-400">WHERE</span> status = <span className="text-emerald-400">'out_of_range'</span></p>
                    <p><span className="text-red-400">ORDER BY</span> severity <span className="text-red-400">DESC</span>;</p>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={onOpenUpload}
                      className="bg-[#e51d38] hover:bg-red-600 text-white font-bold text-[9px] px-2.5 py-1 rounded-md flex items-center gap-1"
                    >
                      <span>▶</span> Run Analysis
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Top Events (Left) & Data Sources (Right) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
              {/* Top Events */}
              <div className="sm:col-span-5 bg-[#121318] rounded-2xl p-4 border border-white/5 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="font-bold text-white">Top Biomarkers</span>
                  <span>View all</span>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <div className="flex justify-between text-slate-300">
                      <span>Total Cholesterol</span>
                      <span className="font-mono text-slate-400">5.2M</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full mt-1">
                      <div className="bg-red-500 h-1 rounded-full w-[85%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300">
                      <span>Fasting Glucose</span>
                      <span className="font-mono text-slate-400">4.6M</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full mt-1">
                      <div className="bg-red-500 h-1 rounded-full w-[70%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300">
                      <span>Hemoglobin</span>
                      <span className="font-mono text-slate-400">2.1M</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full mt-1">
                      <div className="bg-red-500 h-1 rounded-full w-[45%]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Sources Icons */}
              <div className="sm:col-span-7 bg-[#121318] rounded-2xl p-4 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="font-bold text-white">Document Sources</span>
                  <span>View all</span>
                </div>

                {/* 5 App Icon pills */}
                <div className="flex items-center gap-2 py-2">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 text-xs font-bold">
                    +
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Connected
                  </span>
                  <span>23 Sources Supported</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM SECTION: 3 FEATURE CARDS (Bar Chart, Line Chart, Donut Chart) ================= */}
      <section className="max-w-6xl mx-auto space-y-10 pt-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-red-500">
            BUILT FOR MODERN PATIENT EMPOWERMENT
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            A platform that <span className="text-red-500">scales with you</span>
          </h2>
        </div>

        {/* 3 Cards Matching Screenshot Bottom Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Solid Red Card with Vertical Histogram Bars */}
          <div className="bg-[#e51837] rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-2xl shadow-red-900/40 relative overflow-hidden">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-200 block">
                PERFORMANCE
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Engineered for High Precision
              </h3>
              <p className="text-xs text-red-100/90 leading-relaxed">
                Process lab reports in real-time with sub-second OCR extraction and deep biological reference matching.
              </p>
            </div>

            {/* Vertical Bar Chart Graphic */}
            <div className="mt-8 pt-4 border-t border-white/20">
              <div className="flex items-end justify-between h-20 gap-2 px-1">
                <div className="w-full bg-black/40 rounded-t h-[40%]"></div>
                <div className="w-full bg-black/40 rounded-t h-[65%]"></div>
                <div className="w-full bg-black/40 rounded-t h-[50%]"></div>
                <div className="w-full bg-black/40 rounded-t h-[80%]"></div>
                <div className="w-full bg-black/40 rounded-t h-[95%]"></div>
                <div className="w-full bg-black/40 rounded-t h-[70%]"></div>
                <div className="w-full bg-black/40 rounded-t h-[85%]"></div>
              </div>
              <div className="flex justify-between text-[9px] text-red-200 mt-2 font-mono">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Card 2: Dark Card with Upward Trending Line Chart */}
          <div className="bg-[#0e1015] border border-white/10 rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-xl hover:border-red-500/30 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                SCALABILITY
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Built to Scale Effortlessly
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamlessly decode everything from simple single-test CBC blood slips to multi-page annual pathology binders.
              </p>
            </div>

            {/* SVG Line Chart Graphic */}
            <div className="mt-8 pt-4 border-t border-white/5">
              <svg viewBox="0 0 240 80" className="w-full h-20 overflow-visible">
                {/* Horizontal reference grid lines */}
                <line x1="0" y1="20" x2="240" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
                <line x1="0" y1="50" x2="240" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />

                {/* Upward Line Path */}
                <polyline
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  points="10,65 50,70 90,45 130,55 170,25 210,15"
                />

                {/* Glowing Nodes */}
                <circle cx="10" cy="65" r="3" fill="#e51d38" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="50" cy="70" r="3" fill="#ffffff" />
                <circle cx="90" cy="45" r="3" fill="#ffffff" />
                <circle cx="130" cy="55" r="3" fill="#ffffff" />
                <circle cx="170" cy="25" r="3" fill="#ffffff" />
                <circle cx="210" cy="15" r="4" fill="#e51d38" stroke="#ffffff" strokeWidth="2" />
              </svg>
              <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-mono">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
              </div>
            </div>
          </div>

          {/* Card 3: Dark Card with Circular Donut Gauge */}
          <div className="bg-[#0e1015] border border-white/10 rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-xl hover:border-red-500/30 transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                RELIABILITY
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Enterprise-Grade Privacy
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict non-diagnostic educational guardrails with zero clinical data leakage or third-party tracking.
              </p>
            </div>

            {/* Circular Donut Gauge */}
            <div className="mt-8 pt-4 border-t border-white/5 flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background track circle */}
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Glowing Red Progress ring */}
                  <path
                    className="text-red-500"
                    strokeDasharray="99.99, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-sm font-black text-white block">99.99%</span>
                  <span className="text-[8px] text-slate-400 block">Uptime</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-3 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Accuracy
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white/20"></span>
                  Downtime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= QUICK CLINICAL SAMPLES BANNER ================= */}
      <section className="bg-[#0f1015] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-6xl mx-auto shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">
            Ready to test?
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white">
            Try Sample Pathology Reports in 1 Click
          </h3>
          <p className="text-xs text-slate-400">
            Preview Complete Blood Count (CBC), Lipid Panel, or Metabolic Screening instantly without uploading.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectSample('report-lipid-01')}
            className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
          >
            Lipid Profile
          </button>
          <button
            onClick={() => onSelectSample('report-cbc-02')}
            className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
          >
            CBC Anemia
          </button>
          <button
            onClick={() => onSelectSample('report-metabolic-03')}
            className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition cursor-pointer"
          >
            Metabolic Panel
          </button>
        </div>
      </section>
    </div>
  );
}
