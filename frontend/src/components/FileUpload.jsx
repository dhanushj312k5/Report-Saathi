import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image, AlertCircle, ArrowRight, Loader2, Edit3 } from 'lucide-react';

export default function FileUpload({ onAnalyzeFile, onAnalyzeText, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'text'
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef(null);

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
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp'];
    const ext = file.name.split('.').pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      alert('Please upload a PDF or Image file (PNG, JPG, WEBP).');
      return;
    }
    setSelectedFile(file);
  };

  const handleSubmitFile = (e) => {
    e.preventDefault();
    if (selectedFile) {
      onAnalyzeFile(selectedFile);
    }
  };

  const handleSubmitText = (e) => {
    e.preventDefault();
    if (pastedText.trim().length >= 10) {
      onAnalyzeText(pastedText);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'upload'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Upload Document (PDF / Scan / Photo)
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`ml-6 pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition ${
            activeTab === 'text'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Paste Lab Values Manually
        </button>
      </div>

      {activeTab === 'upload' ? (
        <form onSubmit={handleSubmitFile}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center cursor-pointer transition ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileInput}
              disabled={isLoading}
            />

            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="font-bold text-slate-800 text-base sm:text-lg mb-1">
              {selectedFile ? selectedFile.name : 'Drag & drop your lab report here'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Supports digital PDFs, photographed reports, and scanned images (PDF, PNG, JPG).
            </p>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> PDF
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Image className="w-3.5 h-3.5" /> PNG / JPG
              </span>
              <span>•</span>
              <span>Auto-OCR included</span>
            </div>
          </div>

          {selectedFile && (
            <div className="mt-5 flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Explain Report</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      ) : (
        <form onSubmit={handleSubmitText}>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Paste Report Text or Doctor Notes
            </label>
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="e.g. Hemoglobin: 13.5 g/dL (Reference 13.0 - 17.0), Fasting Sugar: 110 mg/dL, Total Cholesterol: 210 mg/dL..."
              className="w-full text-sm font-mono p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || pastedText.trim().length < 10}
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Text...</span>
              </>
            ) : (
              <>
                <span>Explain Pasted Values</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
