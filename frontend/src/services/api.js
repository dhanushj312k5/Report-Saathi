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
    date: raw.date || raw.specimen_date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    labName: raw.labName || (raw.extraction_method ? `Extracted via ${raw.extraction_method.replace(/_/g, ' ').toUpperCase()}` : 'Clinical Pathology'),
    ai_engine: raw.ai_engine || 'gemini-2.5-flash',
    is_clarity_sufficient: raw.is_clarity_sufficient !== false,
    clarity_note: raw.clarity_note || null,
    overallStatus: raw.overall_status || raw.overallStatus || 'all_normal',
    overallSummary: raw.summary || raw.overallSummary || 'Laboratory parameters analyzed successfully.',
    keyTakeaways: raw.key_takeaways || raw.keyTakeaways || [],
    parameters: (raw.parameters || []).map((p) => ({
      name: p.name,
      category: p.category || 'Laboratory Biomarker',
      value: String(p.value),
      unit: p.unit || '',
      referenceRange: p.reference_range || p.referenceRange || 'N/A (Not specified in report)',
      status: p.status || 'normal',
      statusLabel: p.status_label || p.statusLabel || (p.status === 'normal' ? 'Normal' : 'Attention Needed'),
      simpleExplanation: p.simple_explanation || p.simpleExplanation || 'Measured biological metric.',
      whyItMatters: p.why_it_matters || p.whyItMatters || null,
      unclear_or_missing_note: p.unclear_or_missing_note || null,
      gaugePercentage: p.gauge_percentage || p.gaugePercentage || 50,
      source_facts: p.source_facts || null,
      ai_explanation: p.ai_explanation || null,
    })),
    doctorQuestions: raw.doctor_questions || raw.doctorQuestions || [],
    lifestyleTips: raw.lifestyle_tips || raw.lifestyleTips || [],
    rawExtractedText: raw.extracted_text || raw.rawExtractedText || '',
    extractionMethod: raw.extraction_method || raw.extractionMethod || 'direct',
    characterCount: raw.character_count || raw.characterCount || 0,
  };
};

export const sendReportChatMessage = async ({ question, report, history = [] }) => {
  const payload = {
    question,
    report_title: report.title || 'Laboratory Report',
    overall_status: report.overallStatus || 'all_normal',
    summary: report.overallSummary || '',
    parameters: (report.parameters || []).map((p) => ({
      name: p.name,
      value: String(p.value),
      unit: p.unit || '',
      reference_range: p.referenceRange || p.reference_range || 'N/A',
      status: p.status || 'normal',
      status_label: p.statusLabel || p.status_label || 'Normal',
      simple_explanation: p.simpleExplanation || p.simple_explanation || '',
      why_it_matters: p.whyItMatters || p.why_it_matters || '',
    })),
    raw_extracted_text: report.rawExtractedText ? report.rawExtractedText.slice(0, 3000) : null,
    history: history.slice(-6).map((m) => ({ role: m.role, content: m.content })),
  };

  const response = await apiClient.post('/reports/chat', payload);
  return response.data;
};

export const sendTelegramNotification = async ({ chatId, report }) => {
  const payload = {
    chat_id: chatId ? String(chatId).trim() : null,
    report_title: report.title || 'Laboratory Report',
    date: report.date || 'Recent',
    overall_status: report.overallStatus || 'all_normal',
    summary: report.overallSummary || '',
    key_takeaways: report.keyTakeaways || [],
    parameters: (report.parameters || []).map((p) => ({
      name: p.name,
      value: String(p.value),
      unit: p.unit || '',
      reference_range: p.referenceRange || p.reference_range || 'N/A',
      status: p.status || 'normal',
      simple_explanation: p.simpleExplanation || p.simple_explanation || '',
    })),
    doctor_questions: report.doctorQuestions || [],
  };

  const response = await apiClient.post('/reports/notify-telegram', payload);
  return response.data;
};
