import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  Sparkles, 
  FileSearch, 
  ChevronDown, 
  ChevronUp, 
  Activity,
  Layers,
  Filter
} from 'lucide-react';
import MetricCard from './MetricCard';
import DoctorQuestions from './DoctorQuestions';
import MedicalDisclaimer from './MedicalDisclaimer';

export default function ReportAnalysisView({ analysis, onReset }) {
  const [filter, setFilter] = useState('all'); // 'all', 'attention', 'normal'
  const [showRawText, setShowRawText] = useState(false);

  if (!analysis) return null;

  const abnormalCount = analysis.tests?.filter(
    (t) => t.status?.toLowerCase() === 'high' || t.status?.toLowerCase() === 'low'
  ).length || 0;

  const filteredTests = (analysis.tests || []).filter((test) => {
    if (filter === 'attention') {
      return test.status?.toLowerCase() === 'high' || test.status?.toLowerCase() === 'low';
    }
    if (filter === 'normal') {
      return test.status?.toLowerCase() === 'normal';
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Top Bar: Back / New Report & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-xs transition hover:bg-slate-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Upload Another Report</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">Report Type</span>
          <h2 className="text-sm sm:text-base font-bold text-slate-800">
            {analysis.report_title}
          </h2>
        </div>
      </div>

      {/* Medical Safety Banner */}
      <MedicalDisclaimer />

      {/* Executive Health Summary Card */}
      <div className={`p-6 rounded-2xl border mb-8 shadow-sm ${
        abnormalCount > 0 
          ? 'bg-amber-50/70 border-amber-200' 
          : 'bg-emerald-50/70 border-emerald-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            abnormalCount > 0 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {abnormalCount > 0 ? (
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            ) : (
              <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {abnormalCount > 0 
                  ? `${abnormalCount} Parameter${abnormalCount > 1 ? 's' : ''} Worth Discussing With Your Doctor` 
                  : 'All Highlighted Parameters Look Healthy!'}
              </h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                abnormalCount > 0
                  ? 'bg-amber-200 text-amber-900'
                  : 'bg-emerald-200 text-emerald-900'
              }`}>
                {abnormalCount > 0 ? 'Review Needed' : 'Good Standing'}
              </span>
            </div>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              {analysis.summary}
            </p>

            {/* Key Findings Pills */}
            {analysis.key_findings && analysis.key_findings.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200/60">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Key Takeaways
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {analysis.key_findings.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 bg-white/80 p-2.5 rounded-lg border border-slate-200/50">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tests Section */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Laboratory Parameter Breakdown ({filteredTests.length})
            </h3>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Tests ({analysis.tests?.length || 0})
            </button>
            <button
              onClick={() => setFilter('attention')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'attention'
                  ? 'bg-amber-100 text-amber-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attention Needed ({abnormalCount})
            </button>
            <button
              onClick={() => setFilter('normal')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === 'normal'
                  ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Normal ({(analysis.tests?.length || 0) - abnormalCount})
            </button>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTests.map((test, index) => (
            <MetricCard key={index} test={test} />
          ))}
        </div>
      </div>

      {/* Questions for Doctor & Lifestyle Guidance */}
      <DoctorQuestions
        questions={analysis.questions_for_doctor}
        lifestyle={analysis.lifestyle_guidance}
      />

      {/* Raw Extracted Text Transparency Drawer */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <button
          onClick={() => setShowRawText(!showRawText)}
          className="w-full flex items-center justify-between p-4 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition"
        >
          <div className="flex items-center gap-2">
            <FileSearch className="w-4 h-4 text-slate-500" />
            <span>OCR Transparency Check: View Raw Extracted Text</span>
          </div>
          {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRawText && (
          <div className="mt-3 p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-60 overflow-y-auto custom-scrollbar">
            <p className="text-slate-400 mb-2 border-b border-slate-800 pb-1 text-[11px]">
              This is the raw OCR output extracted from your file before AI interpretation:
            </p>
            <pre className="whitespace-pre-wrap">{analysis.extracted_text_preview || "No preview text recorded."}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
