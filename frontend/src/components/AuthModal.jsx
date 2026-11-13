import React, { useState } from 'react';
import { X, Lock, Mail, User, Loader2, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, isSupabaseConfigured } from '../services/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isSupabaseConfigured()) {
      setErrorMessage(
        'Supabase credentials are not configured in frontend/.env. The app is currently operating in local Demo / Guest Mode.'
      );
      return;
    }

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const data = await signUpWithEmail(email, password, fullName);
        setSuccessMessage('Account created! Please check your email for confirmation, or sign in.');
        setIsLoading(false);
        if (data?.user) {
          onAuthSuccess(data.user);
          setTimeout(() => onClose(), 1200);
        }
      } else {
        const data = await signInWithEmail(email, password);
        setSuccessMessage('Signed in successfully!');
        setIsLoading(false);
        if (data?.user) {
          onAuthSuccess(data.user);
          setTimeout(() => onClose(), 800);
        }
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f1015] border border-white/10 rounded-[32px] max-w-md w-full shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isSignUp ? 'Create Health Account' : 'Sign In to ReportSaathi'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Optional account for saving report history
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Privacy Note */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Account Privacy:</strong> Accounts are completely optional. Even when signed in, your original PDF/image files and raw text are <strong>never</strong> saved without explicit opt-in.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5 text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 text-xs text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="patient@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e51d38] hover:bg-red-600 text-white font-bold text-xs sm:text-sm py-3 rounded-full shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <span>{isSignUp ? 'Create Free Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Toggle between Sign In / Sign Up */}
          <div className="pt-3 border-t border-white/5 text-center text-xs text-slate-400">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-red-400 font-bold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="text-red-400 font-bold hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
