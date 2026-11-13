import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Sparkles, 
  Calendar, 
  ChevronRight, 
  Inbox,
  Trash2,
  Lock,
  User,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import MedicalDisclaimer from './MedicalDisclaimer';
import { isSupabaseConfigured } from '../services/supabase';

export default function Dashboard({ 
  reports, 
  currentUser,
  onOpenUpload, 
  onSelectReport, 
  onClearReports, 
  onRestoreSamples,
  onOpenAuth,
  onDeleteReport
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'attention', 'normal'

  const filteredReports = reports.filter((rep) => {
    const titleMatch = (rep.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const labMatch = (rep.labName || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!titleMatch && !labMatch) return false;

    if (statusFilter === 'attention') return rep.overallStatus === 'attention_needed';
    if (statusFilter === 'normal') return rep.overallStatus === 'all_normal';
    return true;
  });

  const attentionCount = reports.filter((r) => r.overallStatus === 'attention_needed').length;
  const normalCount = reports.filter((r) => r.overallStatus === 'all_normal').length;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header & Primary Action Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl border-white/10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Reports Dashboard
            </h1>
            {currentUser ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                Saved User History
              </span>
            ) : !isSupabaseConfigured() ? (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-white/10 px-2.5 py-0.5 rounded-full">
                Demo Workspace
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                Guest Workspace
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            {currentUser 
              ? `Welcome back! You have ${reports.length} report${reports.length !== 1 ? 's' : ''} in your secure health history.`
              : 'Review lab results, compare biological markers, and generate doctor discussion guides.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!currentUser && isSupabaseConfigured() && (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-full transition cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Sign In to Sync</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center justify-center gap-2 bg-[#e51d38] hover:bg-red-600 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Lab Report</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <MedicalDisclaimer compact={true} />

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-3xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Reports
          </span>
          <span className="text-3xl font-black text-white font-mono mt-1 block">
            {reports.length}
          </span>
        </div>

        <div className="glass-panel p-5 rounded-3xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Doctor Discussion
          </span>
          <span className="text-3xl font-black text-amber-400 font-mono mt-1 block">
            {attentionCount}
          </span>
        </div>

        <div className="glass-panel p-5 rounded-3xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Within Normal Limits
          </span>
          <span className="text-3xl font-black text-emerald-400 font-mono mt-1 block">
            {normalCount}
          </span>
        </div>

        <div className="glass-panel p-5 rounded-3xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Data Storage
          </span>
          <span className="text-sm font-bold text-slate-300 mt-2 block">
            {isSupabaseConfigured() ? 'Supabase RLS Active' : 'Local Demo (No DB)'}
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reports by title or laboratory facility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-red-600 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setStatusFilter('attention')}
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              statusFilter === 'attention'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            Review ({attentionCount})
          </button>
          <button
            onClick={() => setStatusFilter('normal')}
            className={`px-3.5 py-1.5 rounded-full transition cursor-pointer ${
              statusFilter === 'normal'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            Normal ({normalCount})
          </button>

          {/* Test Empty State Switch */}
          {reports.length > 0 ? (
            <button
              onClick={onClearReports}
              className="text-[11px] text-slate-500 hover:text-red-400 underline ml-2 cursor-pointer"
              title="Clear to test Empty State"
            >
              Test Empty
            </button>
          ) : (
            <button
              onClick={onRestoreSamples}
              className="text-[11px] text-red-400 font-bold hover:underline ml-2 cursor-pointer"
            >
              Restore Samples
            </button>
          )}
        </div>
      </div>

      {/* ================= STATE: EMPTY STATE ================= */}
      {reports.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 border-dashed border-white/20">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-white/5 text-slate-400 flex items-center justify-center">
            <Inbox className="w-8 h-8 stroke-[1.5]" />
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-white text-lg">
              No Saved Reports
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {currentUser
                ? 'You have not saved any laboratory summaries to your account yet. Reports you analyze are kept private and only saved when you explicitly choose.'
                : 'You have not uploaded any pathology or blood reports. Upload your first document or load realistic clinical samples.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenUpload}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#e51d38] hover:bg-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-lg shadow-red-600/30 transition cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload First Report</span>
            </button>

            <button
              onClick={onRestoreSamples}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-full transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Restore 3 Clinical Samples</span>
            </button>
          </div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="glass-panel rounded-3xl p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-300">No reports matched your search.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="text-xs font-bold text-red-400 underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* ================= POPULATED STATE: REPORT LIST ================= */
        <div className="space-y-4">
          {filteredReports.map((report) => {
            const hasAttention = report.overallStatus === 'attention_needed';
            return (
              <div
                key={report.id}
                className="glass-panel hover:bg-white/[0.08] rounded-3xl p-6 transition group flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/10 hover:border-red-500/40"
              >
                <div 
                  onClick={() => onSelectReport(report)}
                  className="flex items-start gap-4 flex-1 cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                    hasAttention 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {hasAttention ? (
                      <AlertTriangle className="w-6 h-6 stroke-[2]" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 stroke-[2]" />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white text-base sm:text-lg group-hover:text-red-400 transition">
                        {report.title}
                      </h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        hasAttention 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {hasAttention ? 'Review Needed' : 'Normal Limits'}
                      </span>
                      {report.is_saved_in_supabase && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          Saved in Cloud
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-1 max-w-xl">
                      {report.overallSummary}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" /> {report.date}
                      </span>
                      <span>•</span>
                      <span>{report.labName}</span>
                      <span>•</span>
                      <span className="text-red-400 font-semibold">
                        {report.parameters?.length || 0} Parameters Extracted
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {onDeleteReport && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteReport(report.id);
                      }}
                      className="text-xs text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-white/5 transition cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => onSelectReport(report)}
                    className="text-xs font-bold text-red-400 group-hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
