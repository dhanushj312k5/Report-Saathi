import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function MedicalDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Educational Notice:</strong> Strictly non-diagnostic health literacy companion. Always consult your doctor.
        </span>
      </div>
    );
  }

  return (
    <aside aria-label="Medical safety notice" className="glass-card-crimson p-5 sm:p-6 rounded-3xl shadow-xl border border-crimson-500/30">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-crimson-600/30 text-crimson-400 flex items-center justify-center shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-1">
          <h2 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
            Educational Purpose Only
            <span className="text-[10px] uppercase font-bold bg-crimson-500/20 text-crimson-300 px-2 py-0.5 rounded-full border border-crimson-500/30">
              Non-Diagnostic
            </span>
          </h2>
          <p className="text-slate-300">
            <strong>ReportSaathi</strong> translates complex laboratory abbreviations, reference intervals, and chemical markers into plain language to boost health literacy. It <strong>never</strong> prescribes medical treatments, alters drug dosages, or issues diagnostic judgments. Always share laboratory documents with a certified medical physician.
          </p>
        </div>
      </div>
    </aside>
  );
}
