import React from 'react';
import { X, FileText, ArrowRight, Heart, Droplets, Zap } from 'lucide-react';

const SAMPLES = [
  {
    id: 'lipid',
    title: 'Lipid Profile (Cholesterol & Heart Health)',
    desc: 'Simulates a standard cardiovascular blood panel with elevated total cholesterol and borderline triglycerides.',
    icon: Heart,
    color: 'rose',
    text: `LABORATORY REPORT: COMPREHENSIVE LIPID PANEL
Patient ID: PT-90124 (Redacted)
Date: 12-Nov-2026

Test Name                      Result      Unit       Reference Interval
Total Cholesterol              224         mg/dL      < 200 (Desirable)
Triglycerides                  168         mg/dL      < 150 (Normal)
HDL Cholesterol (Good)          46          mg/dL      > 40 (Optimal)
LDL Cholesterol (Bad)          144         mg/dL      < 100 (Optimal)
VLDL Cholesterol                34          mg/dL      5 - 40
Total / HDL Ratio               4.8                    < 5.0

Notes: Specimen was drawn following 12-hour overnight fast.`,
  },
  {
    id: 'cbc',
    title: 'Complete Blood Count (CBC & Anemia Screen)',
    desc: 'Simulates red/white blood cell count with slightly low hemoglobin and hematocrit.',
    icon: Droplets,
    color: 'blue',
    text: `LABORATORY REPORT: COMPLETE BLOOD COUNT (CBC)
Specimen: Whole Blood EDTA
Date: 10-Nov-2026

Test Name                      Result      Unit       Reference Interval
Hemoglobin (Hb)                11.2        g/dL       13.0 - 17.0 (Low)
RBC Count                      3.9         mil/uL     4.5 - 5.9
Hematocrit (PCV)               33.6        %          38.0 - 50.0 (Low)
MCV                            76.4        fL         80.0 - 98.0
MCH                            25.1        pg         27.0 - 33.0
White Blood Cells (WBC)        7,400       /cumm      4,000 - 11,000
Platelet Count                 240,000     /cumm      150,000 - 450,000

Impression: Mild microcytic hypochromic picture. Correlate with iron studies.`,
  },
  {
    id: 'metabolic',
    title: 'Metabolic & Kidney Panel (Glucose + Renal)',
    desc: 'Simulates fasting blood sugar, HbA1c, and serum creatinine for metabolic health assessment.',
    icon: Zap,
    color: 'amber',
    text: `LABORATORY REPORT: DIABETIC & RENAL PROFILE
Clinical Laboratory Services
Date: 08-Nov-2026

Test Name                      Result      Unit       Reference Interval
Fasting Plasma Glucose         112         mg/dL      70 - 99 (Elevated: Impaired Fasting)
HbA1c (Glycated Hemoglobin)    5.9         %          < 5.7 (Prediabetes: 5.7 - 6.4)
Estimated Average Glucose     123         mg/dL
Serum Creatinine               0.85        mg/dL      0.7 - 1.2 (Normal)
Blood Urea Nitrogen (BUN)      14          mg/dL      7 - 20 (Normal)
eGFR                           98          mL/min     > 90 (Normal Kidney Function)

Advice: Patient reports fasting duration was 10 hours. Consult physician for dietary counseling.`,
  },
];

export default function SampleReportsModal({ isOpen, onClose, onSelectSample }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Sample Laboratory Reports
            </h3>
            <p className="text-xs text-slate-500">
              Choose a realistic clinical sample to test ReportSaathi instantly:
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3.5 my-5">
          {SAMPLES.map((sample) => {
            const IconComponent = sample.icon;
            return (
              <div
                key={sample.id}
                onClick={() => {
                  onSelectSample(sample.text, sample.title);
                  onClose();
                }}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 text-slate-700 group-hover:text-emerald-700 flex items-center justify-center shrink-0 transition">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-emerald-800">
                      {sample.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {sample.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-1 transition group-hover:translate-x-1" />
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
