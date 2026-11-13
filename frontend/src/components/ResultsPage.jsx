import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  FileSearch, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight, 
  HeartHandshake, 
  MessageSquareQuote,
  Sparkles,
  Share2
} from 'lucide-react';
import MedicalDisclaimer from './MedicalDisclaimer';

export default function ResultsPage({ report, onBackToDashboard }) {
  const [filter, setFilter] = useState('all'); // 'all', 'attention', 'normal'
  const [showRawText, setShowRawText] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  if (!report) return null;

  const abnormalCount = report.parameters?.filter(
    (p) => p.status === 'high' || p.status === 'low'
  ).length || 0;

  const filteredParams = (report.parameters || []).filter((param) => {
    if (filter === 'attention') return param.status === 'high' || param.status === 'low';
    if (filter === 'normal') return param.status === 'normal';
    return true;
  });

  const toggleExpand = (idx) => {
    setExpandedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyQuestions = () => {
    if (!report.doctorQuestions) return;
    const text = report.doctorQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(
      `Doctor Questions for ${report.title} (ReportSaathi Educational Summary):\n\n${text}`
    );
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2000);
  };

  const handleCopySummary = () => {
    const summaryText = `${report.title} - Educational Overview\nDate: ${report.date}\nLab: ${report.labName}\n\nSummary:\n${report.overallSummary}\n\nKey Takeaways:\n${report.keyTakeaways.map(k => `• ${k}`).join('\n')}\n\nDisclaimer: Educational awareness only. Consult a doctor.`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-20">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white glass-panel px-4 py-2.5 rounded-full transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Realistic Clinical Data
          </span>

          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full glass-panel text-slate-200 hover:text-white transition cursor-pointer"
            title="Copy summary"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-crimson-600 hover:bg-crimson-500 text-white transition cursor-pointer shadow-lg shadow-crimson-600/30"
            title="Print summary"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Mandatory Safety Notice */}
      <MedicalDisclaimer />

      {/* Report Header Card */}
      <div className="glass-panel rounded-[32px] p-6 sm:p-8 space-y-6 border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-crimson-300 bg-crimson-500/20 px-2.5 py-0.5 rounded-full border border-crimson-500/30">
                Diagnostic Analysis
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {report.patientCode}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {report.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Specimen Date: <strong className="text-slate-200">{report.date}</strong> • Facility: <strong className="text-slate-200">{report.labName}</strong>
            </p>
          </div>

          <div className="self-start">
            <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full ${
              abnormalCount > 0 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {abnormalCount > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{abnormalCount} Parameter{abnormalCount > 1 ? 's' : ''} Need Discussion</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>All Parameters in Normal Range</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-crimson-400">
            Plain-Language Overview
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {report.overallSummary}
          </p>
        </div>

        {/* Key Takeaways */}
        <div className="pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Key Takeaways
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.keyTakeaways.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-white/[0.03] p-4 rounded-2xl border border-white/5 text-xs sm:text-sm text-slate-200"
              >
                <span className="w-5 h-5 rounded-full bg-crimson-500/20 text-crimson-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="leading-snug">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Extracted Values & Plain-Language Explanations */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-crimson-400" />
            <h2 className="text-xl font-bold text-white">
              Extracted Parameters & Explanations ({filteredParams.length})
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 glass-panel p-1.5 rounded-full text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1 rounded-full transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-crimson-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({report.parameters?.length || 0})
            </button>
            <button
              onClick={() => setFilter('attention')}
              className={`px-3.5 py-1 rounded-full transition cursor-pointer ${
                filter === 'attention'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Review ({abnormalCount})
            </button>
            <button
              onClick={() => setFilter('normal')}
              className={`px-3.5 py-1 rounded-full transition cursor-pointer ${
                filter === 'normal'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Normal ({(report.parameters?.length || 0) - abnormalCount})
            </button>
          </div>
        </div>

        {/* Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredParams.map((param, index) => {
            const isAbnormal = param.status === 'high' || param.status === 'low';
            const isExpanded = Boolean(expandedItems[index]);

            return (
              <div
                key={index}
                className={`rounded-3xl border transition-all duration-200 glass-panel p-6 flex flex-col justify-between ${
                  isAbnormal
                    ? 'border-amber-500/30 ring-1 ring-amber-500/20'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {param.category}
                      </span>
                      <h3 className="font-bold text-white text-base sm:text-lg">
                        {param.name}
                      </h3>
                    </div>

                    {/* Status Badge */}
                    {param.status === 'normal' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        {param.statusLabel || 'Normal'}
                      </span>
                    ) : param.status === 'high' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <ArrowUpRight className="w-3 h-3 text-amber-400" />
                        {param.statusLabel || 'Above Target'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        <ArrowDownRight className="w-3 h-3 text-blue-400" />
                        {param.statusLabel || 'Below Target'}
                      </span>
                    )}
                  </div>

                  {/* Value vs Reference Range */}
                  <div className="grid grid-cols-2 gap-2 bg-black/40 rounded-2xl p-3.5 mb-4 text-xs border border-white/5">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Extracted Reading</span>
                      <span className={`font-mono font-bold text-base ${
                        isAbnormal ? 'text-amber-300' : 'text-white'
                      }`}>
                        {param.value} <span className="text-xs font-normal text-slate-400">{param.unit}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Standard Reference</span>
                      <span className="font-mono font-bold text-sm text-slate-300">
                        {param.referenceRange} <span className="text-xs font-normal text-slate-400">{param.unit}</span>
                      </span>
                    </div>
                  </div>

                  {/* Range Visualizer Bar */}
                  {param.gaugePercentage && (
                    <div className="mb-4">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Low</span>
                        <span className="text-slate-300 font-semibold">Standard Window</span>
                        <span>High</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full relative overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            param.status === 'normal' 
                              ? 'bg-emerald-500' 
                              : param.status === 'high' 
                              ? 'bg-amber-500' 
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${param.gaugePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Plain Language Explanation */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {param.simpleExplanation}
                  </p>
                </div>

                {/* Accordion: Why it matters */}
                {param.whyItMatters && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={() => toggleExpand(index)}
                      className="text-xs text-crimson-400 hover:text-crimson-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide biological role' : 'Why does my body monitor this?'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isExpanded && (
                      <p className="text-xs text-slate-400 mt-2 bg-white/[0.02] p-3 rounded-2xl border border-white/5 leading-relaxed">
                        {param.whyItMatters}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Doctor Questions & Lifestyle Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions for Doctor */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-crimson-600/20 text-crimson-400 flex items-center justify-center">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Doctor Discussion Points
                </h3>
                <p className="text-[11px] text-slate-400">
                  Empowering questions for your clinic appointment
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyQuestions}
              className="text-xs font-semibold inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              {copiedQuestions ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedQuestions ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <ul className="space-y-2.5 pt-1">
            {report.doctorQuestions.map((q, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/5 text-xs sm:text-sm text-slate-200 leading-snug"
              >
                <span className="w-5 h-5 rounded-full bg-crimson-500/20 text-crimson-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* General Lifestyle & Healthy Habits */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                General Wellness Considerations
              </h3>
              <p className="text-[11px] text-slate-400">
                Non-prescriptive evidence-based lifestyle tips
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 pt-1">
            {report.lifestyleTips.map((tip, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 bg-black/40 p-3.5 rounded-2xl border border-white/5 text-xs sm:text-sm text-slate-200 leading-snug"
              >
                <span className="text-emerald-400 font-bold text-base shrink-0 mt-[-2px]">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Raw OCR Text Verification Inspector */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border-white/10">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="w-full flex items-center justify-between p-5 hover:bg-white/[0.04] transition text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <FileSearch className="w-5 h-5 text-crimson-400" />
            <div>
              <h4 className="font-bold text-white text-sm">
                OCR Verification Inspector (Original Extracted String)
              </h4>
              <p className="text-[11px] text-slate-400">
                Cross-check the AI explanation against raw text extracted directly from the document.
              </p>
            </div>
          </div>
          {showRawText ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showRawText && (
          <div className="p-5 border-t border-white/10 bg-black/80 text-emerald-400 font-mono text-xs rounded-b-3xl overflow-x-auto max-h-72 overflow-y-auto custom-scrollbar">
            <p className="text-slate-400 mb-2 border-b border-white/10 pb-1 text-[11px]">
              Raw document text captured during OCR:
            </p>
            <pre className="whitespace-pre-wrap">{report.rawExtractedText || 'No raw text attached.'}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
