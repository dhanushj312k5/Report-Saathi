import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Info,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { sendTelegramNotification, getHealth } from '../services/api';

export default function TelegramNotificationModal({ isOpen, onClose, report }) {
  const [chatId, setChatId] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [resultType, setResultType] = useState(null); // 'success' | 'error'
  const [isLiveConfigured, setIsLiveConfigured] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedChatId = localStorage.getItem('reportsaathi_telegram_chat_id') || '123456789';
      setChatId(savedChatId);
      setResultMessage(null);
      setResultType(null);

      getHealth()
        .then((data) => {
          setIsLiveConfigured(Boolean(data.telegram_bot_configured));
        })
        .catch(() => {
          setIsLiveConfigured(false);
        });
    }
  }, [isOpen]);

  if (!isOpen || !report) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!chatId.trim()) {
      setResultType('error');
      setResultMessage('Please enter a valid Telegram Chat ID.');
      return;
    }

    setIsSending(true);
    setResultMessage(null);
    setResultType(null);

    try {
      // Save chat ID for future convenience
      localStorage.setItem('reportsaathi_telegram_chat_id', chatId.trim());

      const res = await sendTelegramNotification({
        chatId: chatId.trim(),
        report,
      });

      if (res.success) {
        setResultType('success');
        setResultMessage(res.message || 'Report summary successfully sent to your Telegram!');
      } else {
        setResultType('error');
        setResultMessage(res.message || 'Failed to send notification to Telegram.');
      }
    } catch (err) {
      console.error('Telegram notification error:', err);
      const errMsg = err.response?.data?.detail || err.message || 'Network error sending to Telegram.';
      setResultType('error');
      setResultMessage(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-white/10 relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#229ED9]/20 to-[#229ED9]/40 border border-[#229ED9]/30 text-[#229ED9] flex items-center justify-center shrink-0">
              <Send className="w-6 h-6 transform -rotate-12 translate-x-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Send Report to Telegram
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Receive educational takeaways directly on Telegram.
              </p>
            </div>
          </div>

          <div>
            {isLiveConfigured ? (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 whitespace-nowrap">
                ● Live Bot Connected
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap" title="Running in simulated demo mode">
                ● Demo Simulation Mode
              </span>
            )}
          </div>
        </div>

        {/* Report Preview Snippet */}
        <div className="mb-5 p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Report:</span>
            <span className="text-white font-semibold">{report.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Status:</span>
            <span className={`font-semibold ${report.overallStatus === 'all_normal' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {report.overallStatus === 'all_normal' ? 'All In Range' : 'Attention Needed'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Extracted Biomarkers:</span>
            <span className="text-slate-300 font-mono">{report.parameters?.length || 0} items</span>
          </div>
        </div>

        {/* How to find Chat ID Instructions */}
        <div className="mb-5 p-3.5 rounded-2xl bg-[#229ED9]/10 border border-[#229ED9]/20 text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#229ED9] font-semibold text-xs">
              <Info className="w-4 h-4 shrink-0" />
              <span>{isLiveConfigured ? "How to get your Telegram Chat ID:" : "Demo & Live Setup Guide:"}</span>
            </div>
          </div>

          {isLiveConfigured ? (
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px] leading-relaxed pl-1">
              <li>Open your bot in Telegram and send <code className="text-white bg-black/40 px-1 py-0.5 rounded">/start</code>.</li>
              <li>The bot replies immediately with your unique <b>Chat ID</b>.</li>
              <li>Enter your Chat ID below and tap Send Notification.</li>
            </ol>
          ) : (
            <div className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              <p>
                <strong>Demo Mode Active:</strong> You can enter any number (e.g. <code className="text-white bg-black/40 px-1 py-0.5 rounded">123456789</code>) to test and preview the full notification dispatch right now!
              </p>
              <p className="text-slate-400 text-[10px] pt-1 border-t border-white/5">
                💡 <em>To send real messages to your phone: Message <b>@BotFather</b> on Telegram to create a bot, then put the token into <code>backend/.env</code>.</em>
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="e.g. 123456789"
              disabled={isSending}
              className="w-full bg-black/60 border border-white/15 focus:border-[#229ED9] focus:ring-1 focus:ring-[#229ED9] rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 transition outline-none disabled:opacity-50 font-mono"
            />
          </div>

          {/* Feedback Alerts */}
          {resultMessage && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 ${
                resultType === 'success'
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/40 border border-red-500/30 text-red-300'
              }`}
            >
              {resultType === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{resultMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !chatId.trim()}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#229ED9] to-blue-600 hover:from-[#229ED9]/90 hover:to-blue-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-[#229ED9]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sending to Telegram...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Notification</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Privacy Note */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Non-diagnostic educational summary • Ephemeral dispatch</span>
        </div>
      </div>
    </div>
  );
}
