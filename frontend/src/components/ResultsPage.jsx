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
  Share2,
  FileQuestion,
  Cpu,
  Bookmark,
  Save,
  Trash2,
  Loader2,
  Lock,
  ShieldCheck,
  Info,
  Send
} from 'lucide-react';
import MedicalDisclaimer from './MedicalDisclaimer';
import ReportChatWidget from './ReportChatWidget';
import TelegramNotificationModal from './TelegramNotificationModal';
import { saveReportToHistory, deleteReportFromHistory, isSupabaseConfigured } from '../services/supabase';

export default function ResultsPage({ 
  report, 
  currentUser, 
  onBackToDashboard, 
  onRequireAuth,
  onReportDeleted
}) {
  const [filter, setFilter] = useState('all');
  const [showRawText, setShowRawText] = useState(false);
  const [copiedQuestions, setCopiedQuestions] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  // Save / Delete states
  const [isSaved, setIsSaved] = useState(Boolean(report.is_saved_in_supabase || report.saved_record_id));
  const [savedRecordId, setSavedRecordId] = useState(report.saved_record_id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

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

  const handleSaveReport = async () => {
    setSaveError('');
    setSaveMessage('');

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setSaveMessage(
        'Demo Mode: Supabase credentials are not configured in your environment. Report is retained in your current local session only and was NOT saved to a database.'
      );
      return;
    }

    // Check if user is signed in
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveReportToHistory(report, currentUser.id);
      setIsSaving(false);
      if (res.success) {
        setIsSaved(true);
        if (res.record?.id) {
          setSavedRecordId(res.record.id);
        }
        setSaveMessage(res.message);
      } else {
        setSaveMessage(res.message);
      }
    } catch (err) {
      setIsSaving(false);
      console.error('Save report error:', err);
      setSaveError(err.message || 'Failed to save report to database.');
    }
  };

  const handleDeleteReport = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this report from your history?')) {
      return;
    }

    setIsDeleting(true);
    setSaveError('');

    try {
      if (savedRecordId && currentUser) {
        await deleteReportFromHistory(savedRecordId, currentUser.id);
      }
      setIsDeleting(false);
      setIsSaved(false);
      setSavedRecordId(null);
      setSaveMessage('Report record was permanently deleted from your database.');
      if (onReportDeleted) {
        onReportDeleted(savedRecordId || report.id);
      }
    } catch (err) {
      setIsDeleting(false);
      console.error('Delete error:', err);
      setSaveError(err.message || 'Failed to delete report.');
    }
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

        <div className="flex flex-wrap items-center gap-2">
          {report.ai_engine && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-red-500/10 text-red-300 border border-red-500/20">
              <Cpu className="w-3.5 h-3.5 text-red-400" />
              <span>{report.ai_engine}</span>
            </span>
          )}

          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full glass-panel text-slate-200 hover:text-white transition cursor-pointer"
            title="Copy summary"
          >
            {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedSummary ? 'Copied' : 'Share'}</span>
          </button>

          <button
            onClick={() => setShowTelegramModal(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full glass-panel text-[#229ED9] hover:text-white hover:bg-[#229ED9]/20 border border-[#229ED9]/30 transition cursor-pointer"
            title="Send report summary to Telegram"
          >
            <Send className="w-3.5 h-3.5 transform -rotate-12" />
            <span className="hidden sm:inline">Send to Telegram</span>
            <span className="sm:hidden">Telegram</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white transition cursor-pointer shadow-lg shadow-red-600/30"
            title="Print summary"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Mandatory Visible Educational-Use-Only Disclaimer */}
      <MedicalDisclaimer />

      {/* ================= OPT-IN SUPABASE HEALTH HISTORY SAVE SECTION ================= */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border-white/10 space-y-3.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Health History Persistence
              </span>
              {!isSupabaseConfigured() ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/10">
                  Demo Mode (Supabase Not Configured)
                </span>
              ) : currentUser ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Signed In as {currentUser.email}
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Guest Session (Not Signed In)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              By default, all reports are <strong>ephemeral</strong> and never saved. You can choose whether to store this educational summary to review in your history.
            </p>
          </div>

          {/* Action Button: Save or Delete */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {isSaved ? (
              <button
                onClick={handleDeleteReport}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete from History</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleSaveReport}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save to History</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Explain what is stored vs what is NEVER stored */}
        <div className="bg-black/40 rounded-2xl p-3.5 border border-white/5 text-[11px] text-slate-400 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Privacy Transparency:</span>
          </div>
          <p>
            • <strong>What is saved:</strong> Report title, test names, recorded numerical values, units, biological reference intervals, and doctor questions.
          </p>
          <p>
            • <strong>What is NEVER saved:</strong> Original PDF/image files, document scans, and unredacted raw medical text are <strong>never</strong> uploaded or persisted.
          </p>
        </div>

        {/* Status / Error Alerts */}
        {saveMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-xs text-emerald-200 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>{saveMessage}</p>
          </div>
        )}

        {saveError && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-xs text-rose-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>{saveError}</p>
          </div>
        )}
      </div>

      {/* Warning if Document Clarity is Insufficient */}
      {report.is_clarity_sufficient === false && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 sm:p-6 text-amber-200 flex items-start gap-3.5">
          <FileQuestion className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs sm:text-sm leading-relaxed">
            <h4 className="font-bold text-amber-300 text-base">
              Partial or Unclear Document Text
            </h4>
            <p>
              {report.clarity_note || "Some sections of your document could not be extracted with high confidence due to image compression, angle, or handwriting."}
            </p>
            <p className="font-semibold text-white pt-1">
              ⚠️ Please bring your original, physical laboratory printout to a qualified healthcare physician for complete clinical evaluation.
            </p>
          </div>
        </div>
      )}

      {/* Report Header Card */}
      <div className="glass-panel rounded-[32px] p-6 sm:p-8 space-y-6 border-white/10 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-300 bg-red-500/20 px-2.5 py-0.5 rounded-full border border-red-500/30">
                Medical Literacy Breakdown
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
                  <span>All Detected Parameters in Normal Range</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-red-400">
            Plain-Language Overview
          </h2>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {report.overallSummary}
          </p>
        </div>

        {/* Key Takeaways */}
        {report.keyTakeaways && report.keyTakeaways.length > 0 && (
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
                  <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Parameters: Clearly Distinguishing Source-Extracted Facts vs AI Explanations */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Layers className="w-5 h-5 text-red-400" />
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
                  ? 'bg-red-600 text-white font-bold'
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

                  {/* SECTION 1: SOURCE-EXTRACTED FACTS */}
                  <div className="bg-black/50 rounded-2xl p-3.5 mb-3.5 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-white/5">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Bookmark className="w-3 h-3 text-red-400" />
                        Source-Extracted Facts (From Document)
                      </span>
                      <span className="text-slate-500 font-mono">Verbatim</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Recorded Result</span>
                        <span className={`font-mono font-bold text-base ${
                          isAbnormal ? 'text-amber-300' : 'text-white'
                        }`}>
                          {param.value} <span className="text-xs font-normal text-slate-400">{param.unit}</span>
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Printed Reference Range</span>
                        <span className={`font-mono font-bold text-xs ${
                          param.referenceRange?.includes('N/A') ? 'text-slate-400 italic font-normal' : 'text-slate-300'
                        }`}>
                          {param.referenceRange} {param.referenceRange?.includes('N/A') ? '' : param.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Note if info was missing/unclear */}
                  {param.unclear_or_missing_note && (
                    <div className="mb-3 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                      <span>{param.unclear_or_missing_note}</span>
                    </div>
                  )}

                  {/* Visual Range Indicator Bar */}
                  {param.gaugePercentage && !param.referenceRange?.includes('N/A') && (
                    <div className="mb-3.5">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-mono">
                        <span>Lower Bound</span>
                        <span className="text-slate-300 font-semibold">Normal Interval</span>
                        <span>Upper Bound</span>
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

                  {/* SECTION 2: AI EDUCATIONAL EXPLANATION */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block">
                      AI Plain-Language Translation
                    </span>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                      {param.simpleExplanation}
                    </p>
                  </div>
                </div>

                {/* Accordion: Why it matters */}
                {param.whyItMatters && (
                  <div className="mt-4 pt-3 border-t border-white/5">
                    <button
                      onClick={() => toggleExpand(index)}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide physiological role' : 'Why does my body monitor this?'}</span>
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

      {/* REPORT-SPECIFIC EDUCATIONAL CHAT WIDGET */}
      <ReportChatWidget report={report} />

      {/* Doctor Questions & Lifestyle Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questions for Doctor */}
        <div className="glass-panel rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-red-600/20 text-red-400 flex items-center justify-center">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Doctor Consultation Talking Points
                </h3>
                <p className="text-[11px] text-slate-400">
                  Empowering questions tailored to your results
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
                <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
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
            <FileSearch className="w-5 h-5 text-red-400" />
            <div>
              <h4 className="font-bold text-white text-sm">
                OCR Verification Inspector (Original Extracted Document Text)
              </h4>
              <p className="text-[11px] text-slate-400">
                Verify the exact verbatim string read from your file before any AI analysis occurred.
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

      {/* TELEGRAM NOTIFICATION MODAL */}
      <TelegramNotificationModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        report={report}
      />
    </div>
  );
}
