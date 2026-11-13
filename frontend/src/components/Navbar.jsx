import React from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

export default function Navbar({ currentView, onNavigate, onOpenUpload }) {
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

        {/* Center: Desktop Navigation Links matching Screenshot */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-1 hover:text-white transition cursor-pointer"
          >
            <span>Product</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1 hover:text-white transition cursor-pointer"
          >
            <span>Features</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1 hover:text-white transition cursor-pointer"
          >
            <span>Solutions</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>

          <button
            onClick={() => onNavigate('landing')}
            className="hover:text-white transition cursor-pointer"
          >
            Pricing
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="hover:text-white transition cursor-pointer"
          >
            Dashboard
          </button>

          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-1 hover:text-white transition cursor-pointer"
          >
            <span>Company</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
        </nav>

        {/* Right: Log In + Red Pill Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer hidden sm:inline"
          >
            Dashboard
          </button>

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
