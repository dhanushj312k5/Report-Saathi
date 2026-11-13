import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  ShieldAlert, 
  AlertCircle, 
  HelpCircle, 
  CheckCircle2, 
  RotateCcw,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { sendReportChatMessage } from '../services/api';

export default function ReportChatWidget({ report }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I am your ReportSaathi assistant for this specific ${report.title || 'laboratory report'}. I can help explain the biological markers, normal reference intervals, and general educational context found on this document.\n\nNote: I cannot diagnose conditions, prescribe medications, or comment on tests not present in this report.`,
      is_supported_by_report: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Suggested prompt pills based on actual parameters in report
  const firstParam = report.parameters && report.parameters.length > 0 ? report.parameters[0].name : null;
  const abnormalParam = report.parameters?.find(p => p.status === 'high' || p.status === 'low')?.name;

  const samplePrompts = [
    abnormalParam ? `Explain my ${abnormalParam} reading` : (firstParam ? `Explain my ${firstParam} reading` : "Summarize this report"),
    "What questions should I ask my doctor?",
    "Are any of my values out of the normal range?",
    "What do my liver enzymes look like?" // Great example of unsupported question to demonstrate safety guardrail
  ];

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || inputQuestion.trim();
    if (!textToSend || isLoading) return;

    setError(null);
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const response = await sendReportChatMessage({
        question: textToSend,
        report,
        history: messages.filter(m => m.id !== 'welcome')
      });

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        is_supported_by_report: response.is_supported_by_report,
        related_parameters: response.related_parameters || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setError("Unable to get an answer right now. Please check backend connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Conversation refreshed. What else would you like to explore regarding your ${report.title || 'report'}?`,
        is_supported_by_report: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setError(null);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border-white/10 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base sm:text-lg">
                Report-Specific Educational Chat
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                <Lock className="w-2.5 h-2.5" /> Bounded to this Report
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ask questions about the tests and reference ranges extracted from this document.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer"
          title="Clear conversation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Suggested Quick Questions */}
      <div className="py-4 border-b border-white/5 relative z-10">
        <span className="text-[11px] font-semibold text-slate-400 block mb-2">
          Suggested questions you can click:
        </span>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-red-500/40 hover:bg-red-500/10 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 text-red-400" />
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="py-4 space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'bg-white/10 border border-white/15 text-red-400'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-red-600 text-white rounded-tr-none'
                  : 'bg-black/60 border border-white/10 text-slate-200 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Unsupported Warning Banner if question asked about out-of-bounds parameter */}
              {msg.role === 'assistant' && msg.is_supported_by_report === false && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-amber-300/90 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Out of scope for this document. Consult a doctor for unlisted tests.</span>
                </div>
              )}

              {/* Related parameters cited */}
              {msg.related_parameters && msg.related_parameters.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Referenced:</span>
                  {msg.related_parameters.map((paramName, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/20"
                    >
                      {paramName}
                    </span>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] mt-1.5 font-mono ${
                  msg.role === 'user' ? 'text-red-200' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 text-red-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-black/60 border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-300 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin" />
              <span>Checking document parameters and reference intervals...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-3 p-3 rounded-2xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Form */}
      <div className="pt-3 border-t border-white/10 relative z-10">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this report (e.g. 'What is my fasting glucose?')..."
            disabled={isLoading}
            className="flex-1 bg-black/60 border border-white/15 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/50 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-400 transition outline-none disabled:opacity-50"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputQuestion.trim()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>

        {/* Guardrail Disclaimer */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-400 font-mono">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            Bounded strictly to this report's extracted numbers
          </span>
          <span className="hidden sm:inline text-slate-400">
            Non-diagnostic • Educational only
          </span>
        </div>
      </div>
    </div>
  );
}
