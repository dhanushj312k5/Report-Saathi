import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.trim() !== '' && 
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isSupabaseConfigured = () => isConfigured;

// ================= AUTH METHODS =================

export const signUpWithEmail = async (email, password, fullName = '') => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Running in Demo Mode.');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName }
    }
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email, password) => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Running in Demo Mode.');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthStateChange = (callback) => {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange(callback);
};

// ================= REPORT HISTORY DATABASE METHODS =================

/**
 * Opt-in persistence for educational summary.
 * PRIVACY GUARANTEE:
 * - NEVER saves original PDF/image files.
 * - NEVER saves raw unredacted OCR text.
 * - Saves ONLY the educational breakdown, parameters, and doctor questions.
 */
export const saveReportToHistory = async (report, userId) => {
  if (!isConfigured || !supabase) {
    return {
      success: false,
      demoMode: true,
      message: 'Running in Demo Mode: Supabase credentials are not configured in your environment. Report is kept in local memory only.'
    };
  }

  if (!userId) {
    throw new Error('You must be signed in to save reports to your history.');
  }

  // Sanitize parameters to avoid storing raw text
  const cleanedParams = (report.parameters || []).map((p) => ({
    name: p.name,
    category: p.category,
    value: p.value,
    unit: p.unit || '',
    reference_range: p.referenceRange || p.reference_range || 'N/A',
    status: p.status || 'normal',
    status_label: p.statusLabel || p.status_label || 'Normal Range',
    simple_explanation: p.simpleExplanation || p.simple_explanation || '',
    why_it_matters: p.whyItMatters || p.why_it_matters || null,
    gauge_percentage: p.gaugePercentage || p.gauge_percentage || 50
  }));

  const payload = {
    user_id: userId,
    title: report.title || 'Laboratory Report',
    specimen_date: report.date || 'Recent',
    overall_status: report.overallStatus || 'all_normal',
    summary: report.overallSummary || report.summary || '',
    key_takeaways: report.keyTakeaways || [],
    parameters_summary: cleanedParams,
    doctor_questions: report.doctorQuestions || [],
    lifestyle_tips: report.lifestyleTips || []
  };

  const { data, error } = await supabase
    .from('saved_reports')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;

  return {
    success: true,
    demoMode: false,
    record: data,
    message: 'Report educational summary securely saved to your health history.'
  };
};

export const fetchUserSavedReports = async (userId) => {
  if (!isConfigured || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('saved_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteReportFromHistory = async (reportId, userId) => {
  if (!isConfigured || !supabase) {
    return {
      success: true,
      demoMode: true,
      message: 'Removed from local session.'
    };
  }

  const { error } = await supabase
    .from('saved_reports')
    .delete()
    .eq('id', reportId)
    .eq('user_id', userId);

  if (error) throw error;

  return {
    success: true,
    demoMode: false,
    message: 'Report permanently deleted from your health history.'
  };
};
