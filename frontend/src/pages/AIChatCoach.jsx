import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  MessageCircle, Send, Bot, User, ArrowLeft, Loader2,
  Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';

const SUGGESTIONS = [
  'What should I eat 1 hour before workout?',
  'How can I optimize muscle recovery?',
  'Suggest 3 healthy high-protein snacks',
  'Is my current calorie intake right for weight loss?',
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
      {/* Header */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <Bot className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="text-base font-bold flex items-center gap-1.5">
                AstraFit AI Coach <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              </h1>
              <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online • Grounded in your profile
              </p>
            </div>
          </div>
        </div>
        <button onClick={fetchChatHistory} className="text-slate-400 hover:text-white transition-colors p-2">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
              <p className="text-slate-400 text-sm">Connecting to AI Fitness Coach...</p>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-pink-400">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Ask Your AI Fitness Coach</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                Ask anything about your diet plan, exercises, rest days, or nutrition tips!
              </p>
            </div>
          )}

          {!loading && messages.map((msg, idx) => (
            <div key={msg._id || idx} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-violet-600 text-white rounded-tr-none'
                  : 'glass-panel border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
              }`}>
                <p className="whitespace-pre-wrap">{msg.message}</p>
                <span className="text-[10px] text-slate-400 block mt-1 text-right opacity-70">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="glass-panel border border-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-pink-400" />
                <span>Coach is typing...</span>
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
              className="shrink-0 text-xs bg-slate-900 border border-slate-800 hover:border-pink-500/50 text-slate-300 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50">
              💡 {s}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="pt-2 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask your AI coach anything..."
            className="flex-1 bg-slate-900 border border-slate-800 text-white placeholder-slate-500 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            className="w-12 h-12 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-2xl flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-pink-500/20 transition-all shrink-0 hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
