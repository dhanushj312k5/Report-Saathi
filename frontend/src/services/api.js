import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const getHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export const uploadAndAnalyze = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/reports/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const normalizeReport = (raw) => {
  if (!raw) return null;
  return {
    id: raw.id || `report-${Date.now()}`,
    title: raw.title || raw.filename || 'Laboratory Report',
    patientCode: raw.patientCode || 'PATIENT-ANON',
    date: raw.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    labName: raw.labName || (raw.extraction_method ? `Extracted via ${raw.extraction_method.replace(/_/g, ' ').toUpperCase()}` : 'Clinical Pathology'),
    overallStatus: raw.overall_status || raw.overallStatus || 'all_normal',
    overallSummary: raw.summary || raw.overallSummary || 'Laboratory parameters analyzed successfully.',
    keyTakeaways: raw.key_takeaways || raw.keyTakeaways || [],
    parameters: (raw.parameters || []).map((p) => ({
      name: p.name,
      category: p.category || 'Laboratory Test',
      value: String(p.value),
      unit: p.unit || '',
      referenceRange: p.reference_range || p.referenceRange || 'N/A',
      status: p.status || 'normal',
      statusLabel: p.status_label || p.statusLabel || (p.status === 'normal' ? 'Normal' : 'Attention Needed'),
      simpleExplanation: p.simple_explanation || p.simpleExplanation || 'Measured biological metric.',
      whyItMatters: p.why_it_matters || p.whyItMatters || null,
      gaugePercentage: p.gauge_percentage || p.gaugePercentage || 50,
    })),
    doctorQuestions: raw.doctor_questions || raw.doctorQuestions || [],
    lifestyleTips: raw.lifestyle_tips || raw.lifestyleTips || [],
    rawExtractedText: raw.extracted_text || raw.rawExtractedText || '',
    extractionMethod: raw.extraction_method || raw.extractionMethod || 'direct',
    characterCount: raw.character_count || raw.characterCount || 0,
  };
};
