import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle2, 
  Loader2, 
  X, 
  ArrowRight, 
  RotateCcw,
  FileWarning
} from 'lucide-react';
import { uploadAndAnalyze, normalizeReport } from '../services/api';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['pdf', 'png', 'jpg', 'jpeg'];

export default function UploadModal({ isOpen, onClose, onAnalysisComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [state, setState] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('');
  const [analyzedData, setAnalyzedData] = useState(null);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file) => {
    setErrorMessage('');
    setErrorType('');

    const extension = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setState('error');
      setErrorType('type');
      setErrorMessage(`Unsupported format ".${extension}". Only PDF, PNG, and JPG files are accepted.`);
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setState('error');
      setErrorType('size');
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(`File is too large (${sizeMB} MB). Maximum allowed size is 10 MB.`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setState('idle');
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setState('loading');
    setProgress(20);
    setProgressStep('Uploading document to FastAPI backend...');

    const timer1 = setTimeout(() => {
      setProgress(50);
      setProgressStep('Running Tesseract OCR & PDF text extraction...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(80);
      setProgressStep('Matching biological parameters and reference intervals...');
    }, 900);

    try {
      // Real API call to FastAPI backend
      const rawResponse = await uploadAndAnalyze(selectedFile);
      clearTimeout(timer1);
      clearTimeout(timer2);

      setProgress(100);
      setProgressStep('Structuring plain-language explanations...');

      const normalized = normalizeReport(rawResponse);
      setAnalyzedData(normalized);
      setState('success');
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      console.error('API Upload error:', err);

      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.message || 'Failed to process document.';

      setState('error');
      if (status === 400) {
        setErrorType('type');
      } else if (status === 413) {
        setErrorType('size');
      } else if (status === 422) {
        setErrorType('ocr');
      } else {
        setErrorType('general');
      }
      setErrorMessage(detail);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setState('idle');
    setErrorMessage('');
    setErrorType('');
    setProgress(0);
    setProgressStep('');
    setAnalyzedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFinishSuccess = () => {
    if (analyzedData) {
      onAnalysisComplete(analyzedData);
      handleReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f1015] border border-white/10 rounded-[32px] max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Upload Laboratory Document
              </h3>
              <p className="text-[11px] text-slate-400">
                PDF, PNG, JPG • Maximum 10MB • Fast OCR Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* ================= STATE 1: LOADING ================= */}
          {state === 'loading' && (
            <div className="py-10 text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-600/20 text-red-500 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-lg">
                  Analyzing Laboratory Report...
                </h4>
                <p className="text-xs text-red-400 font-medium">
                  {progressStep}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-xs mx-auto">
                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                  <span>FastAPI + Tesseract OCR</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= STATE 2: ERROR ================= */}
          {state === 'error' && (
            <div className="py-6 text-center space-y-4 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <FileWarning className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-bold text-white text-base">
                  {errorType === 'type' && 'Unsupported File Format'}
                  {errorType === 'size' && 'File Size Exceeded'}
                  {errorType === 'ocr' && 'Document Unreadable or Blurry'}
                  {errorType === 'general' && 'Processing Error'}
                </h4>
                <p className="text-xs text-rose-200 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl mt-2 max-w-md mx-auto leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs px-5 py-2.5 rounded-full transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Choose Another File</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= STATE 3: SUCCESS ================= */}
          {state === 'success' && analyzedData && (
            <div className="py-6 text-center space-y-5 animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-white text-lg">
                  Report Decoded Successfully!
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Extracted <strong>{analyzedData.parameters?.length || 0} parameters</strong> from{' '}
                  <span className="font-mono text-red-400 font-semibold">{analyzedData.title}</span>.
                </p>
                <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 mt-1.5 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <span>Engine: {analyzedData.labName}</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left max-w-md mx-auto space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Summary Preview</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Ready</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {analyzedData.overallSummary}
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleFinishSuccess}
                  className="inline-flex items-center gap-2 bg-[#e51d38] hover:bg-red-600 text-white font-bold text-sm px-7 py-3 rounded-full shadow-lg shadow-red-600/30 transition cursor-pointer"
                >
                  <span>View Full Breakdown</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= STATE 4: IDLE ================= */}
          {state === 'idle' && (
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition ${
                  dragActive
                    ? 'border-red-500 bg-red-600/10'
                    : 'border-white/15 hover:border-red-500/50 bg-white/[0.02]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileInput}
                />

                <div className="w-12 h-12 mx-auto rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <h4 className="font-bold text-white text-sm sm:text-base mb-1">
                  Drag & drop your lab report here, or <span className="text-red-400 underline">browse</span>
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Accepted formats: <strong>PDF, PNG, JPG</strong> up to <strong>10MB</strong>.
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center shrink-0">
                      {selectedFile.name.endsWith('.pdf') ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Ready for FastAPI analysis
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={startAnalysis}
                    className="inline-flex items-center gap-1.5 bg-[#e51d38] hover:bg-red-600 text-white font-bold text-xs px-4 py-2 rounded-full shadow-xs transition cursor-pointer"
                  >
                    <span>Extract & Explain</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
