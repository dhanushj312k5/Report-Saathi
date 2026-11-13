import React, { useState } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ResultsPage from './components/ResultsPage';
import UploadModal from './components/UploadModal';
import { SAMPLE_REPORTS } from './data/sampleReports';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'dashboard', 'results'
  const [reports, setReports] = useState(SAMPLE_REPORTS);
  const [selectedReport, setSelectedReport] = useState(SAMPLE_REPORTS[0]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleSelectSample = (sampleId) => {
    const found = SAMPLE_REPORTS.find((r) => r.id === sampleId) || SAMPLE_REPORTS[0];
    setSelectedReport(found);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectReport = (report) => {
    setSelectedReport(report);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnalysisComplete = (newReport) => {
    setReports((prev) => [newReport, ...prev]);
    setSelectedReport(newReport);
    setCurrentView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearReports = () => {
    setReports([]);
  };

  const handleRestoreSamples = () => {
    setReports(SAMPLE_REPORTS);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060709] text-slate-100 font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6">
        {currentView === 'landing' && (
          <LandingPage
            onGoToDashboard={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenUpload={() => setIsUploadOpen(true)}
            onSelectSample={handleSelectSample}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            reports={reports}
            onOpenUpload={() => setIsUploadOpen(true)}
            onSelectReport={handleSelectReport}
            onClearReports={handleClearReports}
            onRestoreSamples={handleRestoreSamples}
          />
        )}

        {currentView === 'results' && (
          <ResultsPage
            report={selectedReport}
            onBackToDashboard={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Global Upload & Verification Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
      />

      {/* Global Dark Footer */}
      <footer className="border-t border-white/5 bg-[#0a0b0f] py-10 mt-16 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <p className="font-extrabold text-white text-sm">
              REPORT<span className="text-red-500">SAATHI</span>
            </p>
            <p className="text-[11px] text-slate-500">
              The Data Platform Built for Medical Laboratory Clarity. Non-diagnostic educational literacy.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-slate-400">
            <button
              onClick={() => {
                setCurrentView('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition cursor-pointer"
            >
              Product
            </button>
            <button
              onClick={() => {
                setCurrentView('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="hover:text-red-400 text-red-500 font-bold transition cursor-pointer"
            >
              Upload Lab Report
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
