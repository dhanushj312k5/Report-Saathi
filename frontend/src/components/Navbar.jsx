import React from 'react';
import { ChevronDown, ArrowRight, User, LogOut, Lock } from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabase';

export default function Navbar({ 
  currentView, 
  onNavigate, 
  onOpenUpload, 
  currentUser, 
  onOpenAuth, 
  onSignOut 
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#060709]/80 backdrop-blur-md border-b border-white/5 py-3.5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-red-600/40">
            R
          </div>
          <span className="font-extrabold text-base tracking-wider text-white uppercase">
            REPORT<span className="text-red-500">SAATHI</span>
          </span>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`flex items-center gap-1 transition cursor-pointer ${
              currentView === 'landing' ? 'text-white font-bold' : 'hover:text-white'
            }`}
          >
            <span>Product</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-1 transition cursor-pointer ${
              currentView === 'dashboard' ? 'text-white font-bold' : 'hover:text-white'
            }`}
          >
            <span>Dashboard</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          <button
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-white transition cursor-pointer"
          >
            Features
          </button>

          <button
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('disclaimer')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-white transition cursor-pointer"
          >
            Safety
          </button>
        </nav>

        {/* Right: Account Auth + Upload Button */}
        <div className="flex items-center gap-3">
          {/* Supabase Auth State */}
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="max-w-[130px] truncate">{currentUser.email}</span>
              </span>
              <button
                onClick={onSignOut}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-white/5 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-white/5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{isSupabaseConfigured() ? 'Sign In' : 'Demo Account'}</span>
            </button>
          )}

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="bg-[#e51d38] hover:bg-red-600 text-white font-bold text-xs px-4 sm:px-5 py-2.5 rounded-full shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>Upload Lab Report</span>
          </button>
        </div>
      </div>
    </header>
  );
}
