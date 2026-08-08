import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  MessageCircle, Send, Bot, User, ArrowLeft, Loader2,
  Sparkles, AlertCircle, RefreshCw, Zap
} from 'lucide-react';

const SUGGESTIONS = [
  '⚡ Suggest a fast high-protein pre-workout meal',
  '💪 How can I optimize my Push/Pull/Legs split?',
  '🥗 Review my daily macros (155g Protein target)',
  '💧 How much water should I drink during heavy lifts?',
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
      setMessages(data.data.messages || []);
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
      setError(err.response?.data?.message || 'Failed to get AI response. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Navbar Header */}
      <div className="border-b border-slate-800/80 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/25">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white">AstraFit AI Coach</h1>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-amber-400" /> Groq Llama-3.3 70B
                </span>
              </div>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Real-Time RAG • Personal Profile Grounded
              </p>
            </div>
          </div>
        </div>

        <button onClick={fetchChatHistory} className="text-slate-400 hover:text-white p-2 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
              <p className="text-slate-400 text-sm">Connecting to Groq High-Speed AI Engine...</p>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gradient-to-tr from-pink-500/20 to-violet-500/20 border border-pink-500/30 rounded-3xl flex items-center justify-center mx-auto mb-4 text-pink-400 shadow-xl">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white mb-1">Your Personal AI Fitness Specialist</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Powered by Groq's Llama-3.3 70B. Grounded in your profile, 2450 kcal diet plan, and PPL workout split!
              </p>
            </div>
          )}

          {!loading && messages.map((msg, idx) => (
            <div key={msg._id || idx} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                msg.sender === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gradient-to-tr from-pink-500 to-violet-600 text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-none shadow-lg shadow-violet-500/10'
                  : 'glass-panel bg-slate-900/80 border border-slate-800 text-slate-200 rounded-tl-none shadow-xl'
              }`}>
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <span className="text-[10px] text-slate-400 block mt-2 text-right opacity-60">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-violet-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div className="glass-panel border border-slate-800 text-slate-300 rounded-3xl rounded-tl-none px-5 py-4 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                <span className="text-xs font-semibold text-pink-300">Groq Llama-3 is analyzing your context...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 text-red-300 text-xs px-4 py-2.5 rounded-xl my-2">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* Suggested Quick Prompt Chips */}
        <div className="pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => handleSend(s)} disabled={sending}
              className="shrink-0 text-xs bg-slate-900/90 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800 text-slate-300 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 font-medium">
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
            placeholder="Ask your AI coach about your diet, workouts, or nutrition..."
            className="flex-1 bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-13 h-13 px-4 py-4 bg-gradient-to-tr from-pink-500 to-violet-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-pink-500/25 transition-all shrink-0 hover:scale-105"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
