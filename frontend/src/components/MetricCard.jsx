import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownRight, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function MetricCard({ test }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Normal Range
          </span>
        );
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
            Higher than Normal
          </span>
        );
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowDownRight className="w-3.5 h-3.5 text-blue-600" />
            Lower than Normal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5" />
            Check with Doctor
          </span>
        );
    }
  };

  const isAbnormal = test.status?.toLowerCase() === 'high' || test.status?.toLowerCase() === 'low';

  return (
    <div
      className={`rounded-xl border transition-all duration-200 bg-white ${
        isAbnormal
          ? 'border-amber-200 shadow-sm hover:border-amber-300 ring-1 ring-amber-100'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header: Name and Status */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              {test.category || 'General Parameter'}
            </span>
            <h4 className="font-bold text-slate-900 text-base sm:text-lg">
              {test.name}
            </h4>
          </div>
          {getStatusBadge(test.status)}
        </div>

        {/* Value vs Reference Range */}
        <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-lg p-2.5 mb-3 text-xs sm:text-sm">
          <div>
            <span className="text-slate-500 block text-[11px]">Your Reading</span>
            <span className={`font-bold ${isAbnormal ? 'text-amber-800 font-mono text-base' : 'text-slate-900 font-mono'}`}>
              {test.value}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Standard Reference Range</span>
            <span className="text-slate-700 font-mono font-medium">
              {test.reference_range || 'Standard'}
            </span>
          </div>
        </div>

        {/* Plain Language Explanation */}
        <p className="text-sm text-slate-700 leading-relaxed">
          {test.simple_explanation}
        </p>

        {/* Why it matters accordion */}
        {test.why_it_matters && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
            >
              <span>{expanded ? 'Hide body impact' : 'Why does the body track this?'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {expanded && (
              <p className="text-xs text-slate-600 mt-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50">
                {test.why_it_matters}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
