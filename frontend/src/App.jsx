import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ResultsPage from './components/ResultsPage';
import UploadModal from './components/UploadModal';
import AuthModal from './components/AuthModal';
import { SAMPLE_REPORTS } from './data/sampleReports';
import { 
  getCurrentUser, 
  onAuthStateChange, 
  signOutUser, 
  fetchUserSavedReports, 
  deleteReportFromHistory, 
  isSupabaseConfigured 
} from './services/supabase';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'dashboard', 'results'
  const [reports, setReports] = useState(SAMPLE_REPORTS);
  const [selectedReport, setSelectedReport] = useState(SAMPLE_REPORTS[0]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Initialize Auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      return;
    }

    getCurrentUser()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          loadUserReports(user.id);
        }
      })
      .catch((err) => console.warn('Could not fetch user:', err));

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        loadUserReports(user.id);
      } else {
        setReports(SAMPLE_REPORTS);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loadUserReports = async (userId) => {
    try {
      const saved = await fetchUserSavedReports(userId);
      if (saved && saved.length > 0) {
        // Format Supabase records to match App report schema
        const formatted = saved.map((r) => ({
          id: r.id,
          saved_record_id: r.id,
          is_saved_in_supabase: true,
          title: r.title,
          patientCode: 'PATIENT',
          date: r.specimen_date || new Date(r.created_at).toLocaleDateString(),
          labName: 'Saved in Health History (Supabase)',
          overallStatus: r.overall_status,
          overallSummary: r.summary,
          keyTakeaways: r.key_takeaways || [],
          parameters: (r.parameters_summary || []).map((p) => ({
            name: p.name,
            category: p.category || 'Laboratory Biomarker',
            value: p.value,
            unit: p.unit || '',
            referenceRange: p.reference_range || 'N/A',
            status: p.status || 'normal',
            statusLabel: p.status_label || 'Normal Range',
            simpleExplanation: p.simple_explanation || '',
            whyItMatters: p.why_it_matters || null,
            gaugePercentage: p.gauge_percentage || 50,
          })),
          doctorQuestions: r.doctor_questions || [],
          lifestyleTips: r.lifestyle_tips || [],
          rawExtractedText: ''
        }));
        setReports([...formatted, ...SAMPLE_REPORTS]);
      }
    } catch (err) {
      console.error('Error loading user reports:', err);
    }
  };

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
    if (currentUser) {
      loadUserReports(currentUser.id);
    } else {
      setReports(SAMPLE_REPORTS);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setReports(SAMPLE_REPORTS);
    setSelectedReport(SAMPLE_REPORTS[0]);
  };

  const handleDeleteReport = async (reportId) => {
    if (currentUser && isSupabaseConfigured()) {
      try {
        await deleteReportFromHistory(reportId, currentUser.id);
      } catch (err) {
        console.warn('Remote delete failed:', err);
      }
    }
    setReports((prev) => prev.filter((r) => r.id !== reportId && r.saved_record_id !== reportId));
    if (selectedReport?.id === reportId || selectedReport?.saved_record_id === reportId) {
      setSelectedReport(SAMPLE_REPORTS[0]);
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060709] text-slate-100 font-sans selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        currentUser={currentUser}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
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
            currentUser={currentUser}
            onOpenUpload={() => setIsUploadOpen(true)}
            onSelectReport={handleSelectReport}
            onClearReports={handleClearReports}
            onRestoreSamples={handleRestoreSamples}
            onOpenAuth={() => setIsAuthOpen(true)}
            onDeleteReport={handleDeleteReport}
          />
        )}

        {currentView === 'results' && (
          <ResultsPage
            report={selectedReport}
            currentUser={currentUser}
            onBackToDashboard={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRequireAuth={() => setIsAuthOpen(true)}
            onReportDeleted={handleDeleteReport}
          />
        )}
      </main>

      {/* Global Upload & Verification Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onAnalysisComplete={handleAnalysisComplete}
      />

      {/* Supabase Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          loadUserReports(user.id);
        }}
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
