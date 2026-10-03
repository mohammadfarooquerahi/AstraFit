import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  MessageCircle, Send, Bot, User, ArrowLeft, Loader2,
  Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';

const SUGGESTIONS = [
  '⚡ Suggest a quick high-protein pre-workout snack',
  '💪 How can I improve recovery on my rest days?',
  '🥗 Review my daily macros and protein distribution',
  '💧 How much water should I drink during high-intensity training?',
];

export default function AIChatCoach() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatHistory = async () => {
    try {
      const { data } = await api.get('/api/chat/messages');
      setMessages(data?.data?.messages || []);
    } catch (err) {
      setError('Failed to load chat history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text || !text.trim() || sending) return;

    const userMsg = { _id: Date.now().toString(), sender: 'user', message: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setSending(true);
    setError('');

    try {
      const { data } = await api.post('/api/chat/send', { message: text.trim() });
      setMessages(prev => [
        ...prev.filter(m => m._id !== userMsg._id),
        data.data.userMessage,
        data.data.aiMessage,
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get coach response. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar Header */}
      <header className="border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">AstraFit Coach</h1>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Personalized advice based on your profile & goals
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchChatHistory}
          className="text-slate-500 hover:text-slate-800 p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
          title="Refresh chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Main Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Connecting with fitness coach...</p>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-16 bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Your Personal Fitness Specialist</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
                Ask questions about your daily nutrition, exercise form tips, workout adjustments, or meal suggestions tailored to your dietary goals!
              </p>
            </div>
          )}

          {!loading && messages.map((msg, idx) => (
            <div key={msg._id || idx} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-indigo-50 border border-indigo-100 text-indigo-600'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs'
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
              }`}>
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <span className={`text-[10px] block mt-1.5 text-right ${
                  msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                }`}>
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200/90 text-slate-600 rounded-2xl rounded-tl-xs px-4 py-3 text-xs flex items-center gap-2 shadow-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Coach is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl my-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Suggested Quick Prompt Chips */}
        <div className="pt-3 pb-2 flex gap-2 overflow-x-auto custom-scrollbar scrollbar-hide">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              disabled={sending}
              className="shrink-0 text-xs bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-xl transition-all shadow-xs font-medium disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Bottom Input Box */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="pt-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your coach anything about workouts, diet, or habits..."
            className="flex-1 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
