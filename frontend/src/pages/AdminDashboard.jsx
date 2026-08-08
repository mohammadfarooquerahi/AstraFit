import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Shield, Users, BarChart3, Brain, Image, ClipboardList, MessageSquare, FileText,
  Search, Ban, CheckCircle, Crown, Trash2, Flag, Eye, ArrowLeft, Loader2,
  AlertCircle, TrendingUp, Zap, Activity, Camera, ChevronRight, X, Edit3,
  RefreshCw, UserCheck, UserX, Clock, Star
} from 'lucide-react';

const SECTIONS = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-violet-400' },
  { id: 'users', label: 'User Management', icon: Users, color: 'text-blue-400' },
  { id: 'ai-monitoring', label: 'AI Monitoring', icon: Brain, color: 'text-emerald-400' },
  { id: 'chat-mod', label: 'Chat Moderation', icon: MessageSquare, color: 'text-pink-400' },
  { id: 'image-mod', label: 'Image Moderation', icon: Camera, color: 'text-amber-400' },
  { id: 'plan-mgmt', label: 'Plan Management', icon: ClipboardList, color: 'text-indigo-400' },
  { id: 'logs', label: 'Reports & Logs', icon: FileText, color: 'text-rose-400' },
];

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className="glass-panel border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</span>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
  </div>
);

const Badge = ({ status }) => {
  const map = {
    active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    banned: 'bg-red-500/10 text-red-400 border-red-500/30',
    inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Flagged: 'bg-red-500/10 text-red-400 border-red-500/30',
    Deleted: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };
  return (
    <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-lg capitalize ${map[status] || 'bg-slate-800 text-slate-400'}`}>
      {status}
    </span>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState('analytics');
  const [loading, setLoading] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [aiPlans, setAiPlans] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [aiLogStats, setAiLogStats] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [photoCounts, setPhotoCounts] = useState({ pending: 0, flagged: 0 });
  const [chats, setChats] = useState([]);
  const [flaggedChatCount, setFlaggedChatCount] = useState(0);
  const [actionLogs, setActionLogs] = useState([]);
  const [actionMsg, setActionMsg] = useState('');

  const load = async (section) => {
    setLoading(true);
    setActionMsg('');
    try {
      if (section === 'analytics') {
        const { data } = await api.get('/api/admin/analytics');
        setAnalytics(data.data);
      } else if (section === 'users') {
        const { data } = await api.get('/api/admin/users');
        setUsers(data.data.users);
      } else if (section === 'ai-monitoring') {
        const [plans, logs] = await Promise.all([
          api.get('/api/admin/ai-plans'),
          api.get('/api/admin/ai-logs'),
        ]);
        setAiPlans(plans.data.data.plans);
        setAiLogs(logs.data.data.logs);
        setAiLogStats(logs.data.data.stats);
      } else if (section === 'image-mod') {
        const { data } = await api.get('/api/admin/photos');
        setPhotos(data.data.photos);
        setPhotoCounts({ pending: data.data.pendingCount, flagged: data.data.flaggedCount });
      } else if (section === 'chat-mod') {
        const { data } = await api.get('/api/admin/chats');
        setChats(data.data.conversations);
        setFlaggedChatCount(data.data.flaggedCount);
      } else if (section === 'logs') {
        const { data } = await api.get('/api/admin/action-logs');
        setActionLogs(data.data.logs);
      }
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(active); }, [active]);

  const handleUserStatus = async (id, status) => {
    await api.put(`/api/admin/users/${id}/status`, { status });
    setActionMsg(`✅ User ${status} successfully.`);
    load('users');
  };

  const handleUserRole = async (id, role) => {
    await api.put(`/api/admin/users/${id}/role`, { role });
    setActionMsg(`✅ User promoted to ${role}.`);
    load('users');
  };

  const handlePhotoMod = async (id, status) => {
    await api.put(`/api/admin/photos/${id}/moderate`, { status });
    setActionMsg(`✅ Photo marked as ${status}.`);
    load('image-mod');
  };

  const handleFlagChat = async (id, flag) => {
    await api.put(`/api/admin/chats/${id}/flag`, { isFlagged: flag });
    setActionMsg(flag ? '🚩 Message flagged.' : '✅ Message unflagged.');
    load('chat-mod');
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center gap-4 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white leading-none">Admin Control Panel</h1>
            <p className="text-[11px] text-violet-400 font-semibold">AstraFit Platform Management</p>
          </div>
        </div>
        {actionMsg && (
          <div className="ml-auto flex items-center gap-2 text-xs bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 px-4 py-2 rounded-xl">
            {actionMsg}
            <button onClick={() => setActionMsg('')}><X className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-60 shrink-0 border-r border-slate-800/80 bg-slate-950/95 flex flex-col py-5 px-3 gap-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-3 mb-1 border-b border-slate-800/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dashboard Menu</span>
          </div>
          {SECTIONS.map(s => {
            const isActive = active === s.id;
            return (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all text-left group ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 via-indigo-600/10 to-transparent border border-violet-500/30 text-white shadow-lg shadow-violet-500/5'
                    : 'text-slate-400 hover:bg-slate-900/60 hover:text-white border border-transparent'
                }`}>
                {/* Active left glowing pill indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-violet-400 to-indigo-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                )}
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-900/80 text-slate-500 group-hover:text-slate-300'}`}>
                  <s.icon className={`w-4 h-4 ${isActive ? s.color : 'text-slate-400'}`} />
                </div>
                <span className="flex-1 text-xs sm:text-sm font-bold tracking-tight">{s.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            </div>
          )}

          {/* ─────── 5.2 Analytics Dashboard ─────── */}
          {!loading && active === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">📊 Platform Analytics</h2>
                <button onClick={() => load('analytics')} className="text-slate-400 hover:text-white p-2 border border-slate-800 rounded-xl hover:bg-slate-900 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={analytics.overview.totalUsers} sub="Registered accounts" icon={Users} color="text-blue-400" />
                <StatCard label="Active Users" value={analytics.overview.activeUsers} sub="Status: active" icon={UserCheck} color="text-emerald-400" />
                <StatCard label="Banned Users" value={analytics.overview.bannedUsers} sub="Blocked accounts" icon={UserX} color="text-red-400" />
                <StatCard label="Avg Fitness Score" value={`${analytics.avgFitnessScore}/100`} sub="User progress average" icon={Star} color="text-amber-400" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Diet Plans Generated" value={analytics.overview.totalDietPlans} sub="AI-generated meal plans" icon={Zap} color="text-emerald-400" />
                <StatCard label="Workout Plans" value={analytics.overview.totalWorkoutPlans} sub="Training splits" icon={Activity} color="text-violet-400" />
                <StatCard label="AI Chats Sent" value={analytics.overview.totalChats} sub="User messages to AI coach" icon={MessageSquare} color="text-pink-400" />
                <StatCard label="Progress Logs" value={analytics.overview.totalProgressLogs} sub="Weight entries tracked" icon={TrendingUp} color="text-blue-400" />
              </div>

              {/* AI Usage Stats */}
              <div className="glass-panel border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-emerald-400" /> AI Usage This Week</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">API Calls</p>
                    <p className="text-2xl font-black text-emerald-400">{analytics.ai.aiCallsThisWeek}</p>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Total Tokens Used</p>
                    <p className="text-2xl font-black text-violet-400">{((analytics.ai.tokenStats.totalPromptTokens || 0) + (analytics.ai.tokenStats.totalCompletionTokens || 0)).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Avg Latency</p>
                    <p className="text-2xl font-black text-amber-400">{Math.round(analytics.ai.tokenStats.avgLatency || 0)} ms</p>
                  </div>
                </div>
              </div>

              {/* Daily Signups */}
              <div className="glass-panel border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Daily User Registrations (Last 7 Days)</h3>
                <div className="flex items-end gap-3 h-24">
                  {analytics.dailySignups.length === 0
                    ? <p className="text-slate-500 text-sm">No signups in the last 7 days.</p>
                    : analytics.dailySignups.map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div className="bg-violet-500 rounded-t-md w-full" style={{ height: `${Math.min(100, d.count * 30)}px` }} />
                        <span className="text-[10px] text-slate-500">{d._id.slice(5)}</span>
                        <span className="text-xs font-bold text-white">{d.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ─────── 5.1 User Management ─────── */}
          {!loading && active === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-black text-white">👥 User Management</h2>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
                    className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-56" />
                </div>
              </div>

              <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Goal</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Progress Logs</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs">
                                {u.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{u.name}</p>
                                <p className="text-xs text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300">{u.profile?.goal || '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3 text-xs text-slate-300 font-bold">{u.progressLogs || 0} entries</td>
                          <td className="px-4 py-3"><Badge status={u.status} /></td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-lg capitalize ${u.role === 'admin' ? 'bg-violet-500/10 text-violet-400 border-violet-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                              {u.role === 'admin' ? '👑 Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {u.status !== 'banned'
                                ? <button onClick={() => handleUserStatus(u._id, 'banned')} className="text-xs font-semibold text-red-400 bg-red-950/30 border border-red-800/50 hover:bg-red-900/40 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
                                    <Ban className="w-3 h-3" /> Ban
                                  </button>
                                : <button onClick={() => handleUserStatus(u._id, 'active')} className="text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-800/50 hover:bg-emerald-900/40 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Activate
                                  </button>
                              }
                              {u.role !== 'admin'
                                ? <button onClick={() => handleUserRole(u._id, 'admin')} className="text-xs font-semibold text-violet-400 bg-violet-950/30 border border-violet-800/50 hover:bg-violet-900/40 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
                                    <Crown className="w-3 h-3" /> Admin
                                  </button>
                                : <button onClick={() => handleUserRole(u._id, 'user')} className="text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg transition-all">
                                    Demote
                                  </button>
                              }
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <p className="text-center text-slate-500 py-8 text-sm">No users found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─────── 5.3 AI Output Monitoring ─────── */}
          {!loading && active === 'ai-monitoring' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white">🧠 AI Output Monitoring</h2>

              {/* Token Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {aiLogStats.map(s => (
                  <div key={s._id} className="glass-panel border border-slate-800 rounded-2xl p-5">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{s._id}</p>
                    <p className="text-2xl font-black text-emerald-400">{s.count} Calls</p>
                    <p className="text-xs text-slate-400 mt-1">Prompt Tokens: <span className="text-white font-bold">{(s.totalPromptTokens || 0).toLocaleString()}</span></p>
                    <p className="text-xs text-slate-400">Completion: <span className="text-white font-bold">{(s.totalCompletionTokens || 0).toLocaleString()}</span></p>
                    <p className="text-xs text-slate-400">Avg Latency: <span className="text-amber-400 font-bold">{Math.round(s.avgLatencyMs || 0)} ms</span></p>
                  </div>
                ))}
              </div>

              {/* Generated Plans Table */}
              <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Generated Diet & Workout Plans</h3>
                  <span className="text-xs text-slate-400">{aiPlans.length} total plans</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Type</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Summary</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Generated</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">AI Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {aiPlans.slice(0, 20).map(p => (
                        <tr key={p._id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-lg ${p.planType === 'diet' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-violet-400 bg-violet-500/10 border-violet-500/30'}`}>
                              {p.planType === 'diet' ? '🥗 Diet' : '💪 Workout'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-white font-medium">{p.userId?.name || '—'}</p>
                            <p className="text-xs text-slate-400">{p.userId?.email || '—'}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300 max-w-xs truncate">
                            {p.planType === 'diet' ? `${p.dailyCalories || '—'} kcal/day` : `${p.splitType || '—'} • ${p.difficulty || '—'}`}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-lg ${p.isAIGenerated ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'}`}>
                              {p.isAIGenerated ? '✅ AI Generated' : '📝 Seeded'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* API Call Logs */}
              <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">AI API Call Logs</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Provider</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Feature</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tokens</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Latency</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {aiLogs.slice(0, 20).map(l => (
                        <tr key={l._id} className="hover:bg-slate-900/30">
                          <td className="px-4 py-3 text-xs text-slate-300">{l.userId?.name || '—'}</td>
                          <td className="px-4 py-3 text-xs">
                            <span className="text-violet-400 font-bold">{l.provider}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400 capitalize">{l.feature?.replace('_', ' ') || '—'}</td>
                          <td className="px-4 py-3 text-xs text-slate-300">
                            <span className="text-emerald-400 font-bold">{(l.promptTokens || 0) + (l.completionTokens || 0)}</span> tok
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className={l.latencyMs > 3000 ? 'text-red-400' : 'text-emerald-400'}>{l.latencyMs || 0} ms</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────── 5.6 Chat Moderation ─────── */}
          {!loading && active === 'chat-mod' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">💬 Chat Moderation</h2>
                <div className="flex items-center gap-2">
                  {flaggedChatCount > 0 && (
                    <span className="text-xs font-bold text-red-400 bg-red-950/40 border border-red-800/50 px-3 py-1.5 rounded-xl">
                      🚩 {flaggedChatCount} Flagged Messages
                    </span>
                  )}
                </div>
              </div>

              {chats.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No chat conversations yet.</p>}

              {chats.map((conv, i) => (
                <div key={i} className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                        {conv.user?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{conv.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{conv.user?.email || '—'} • {conv.messages.length} messages</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                    {conv.messages.slice(0, 6).map(m => (
                      <div key={m._id} className={`flex items-start gap-3 ${m.sender === 'ai' ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex-1 text-xs px-3 py-2 rounded-xl ${m.sender === 'user' ? 'bg-slate-900 border border-slate-800 text-slate-300' : 'bg-violet-950/30 border border-violet-800/30 text-violet-200'} ${m.isFlagged ? 'border-red-500/50 bg-red-950/20' : ''}`}>
                          <span className={`font-bold text-[10px] uppercase ${m.sender === 'user' ? 'text-slate-400' : 'text-violet-400'}`}>{m.sender}</span>
                          <p className="mt-0.5">{m.message.slice(0, 180)}{m.message.length > 180 ? '...' : ''}</p>
                          {m.isFlagged && <span className="text-[10px] text-red-400 font-bold">🚩 FLAGGED</span>}
                        </div>
                        <button onClick={() => handleFlagChat(m._id, !m.isFlagged)}
                          className={`shrink-0 p-1.5 rounded-lg border text-[10px] transition-all ${m.isFlagged ? 'border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/30' : 'border-slate-700 text-slate-500 hover:border-red-800/50 hover:text-red-400'}`}>
                          <Flag className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─────── 5.4 Image Moderation ─────── */}
          {!loading && active === 'image-mod' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-black text-white">📸 Image Moderation</h2>
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">⏳ {photoCounts.pending} Pending</span>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-xl">🚩 {photoCounts.flagged} Flagged</span>
                </div>
              </div>

              {photos.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No photos uploaded yet.</p>}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(p => (
                  <div key={p._id} className="glass-panel border border-slate-800 rounded-2xl overflow-hidden group">
                    <div className="relative h-44">
                      <img src={p.imagePath} alt="Progress" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-80" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-[10px] font-bold text-white">{p.userId?.name || '?'}</p>
                        <p className="text-[9px] text-slate-300">Week {p.weekNumber} • {p.viewType}</p>
                      </div>
                      <div className="absolute top-2 right-2"><Badge status={p.moderationStatus} /></div>
                    </div>
                    <div className="p-3 flex gap-2">
                      {['Approved', 'Flagged', 'Deleted'].map(s => (
                        <button key={s} onClick={() => handlePhotoMod(p._id, s)}
                          className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg border transition-all ${
                            p.moderationStatus === s
                              ? s === 'Approved' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                : s === 'Flagged' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                : 'bg-red-500/20 border-red-500/50 text-red-400'
                              : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-white'
                          }`}>
                          {s === 'Approved' ? '✅' : s === 'Flagged' ? '🚩' : '🗑️'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─────── 5.5 Plan Management ─────── */}
          {!loading && active === 'plan-mgmt' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white">📋 Plan Management (Override System)</h2>
              <div className="glass-panel border border-amber-800/30 bg-amber-950/10 rounded-2xl p-5">
                <p className="text-sm text-amber-300 font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Admin Override Active</p>
                <p className="text-xs text-slate-400 mt-1">As an admin, you can view, flag, and override any AI-generated diet or workout plan. Plans are loaded from the AI Monitoring tab with edit capabilities.</p>
              </div>

              <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">All Generated Plans (Override Enabled)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Details</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Override Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {aiPlans.slice(0, 20).map(p => (
                        <tr key={p._id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-lg ${p.planType === 'diet' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-violet-400 bg-violet-500/10 border-violet-500/30'}`}>
                              {p.planType === 'diet' ? '🥗 Diet' : '💪 Workout'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-white font-medium">{p.userId?.name || '—'}</p>
                            <p className="text-xs text-slate-400">{p.userId?.email}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-300 max-w-xs">
                            {p.planType === 'diet'
                              ? <span>{p.dailyCalories} kcal | P:{p.macros?.protein}g C:{p.macros?.carbs}g F:{p.macros?.fat}g</span>
                              : <span>{p.title} | {p.splitType}</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <button className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-950/30 border border-indigo-800/50 hover:bg-indigo-900/40 px-3 py-1.5 rounded-lg transition-all">
                              <Edit3 className="w-3 h-3" /> Override
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─────── 5.7 Reports & Logs ─────── */}
          {!loading && active === 'logs' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-white">🧾 Reports & Admin Action Logs</h2>

              <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Admin Audit Trail</h3>
                  <span className="text-xs text-slate-400">{actionLogs.length} actions recorded</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Admin</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Details</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {actionLogs.length === 0
                        ? <tr><td colSpan="4" className="px-4 py-8 text-center text-slate-500 text-sm">No admin actions recorded yet.</td></tr>
                        : actionLogs.map(l => (
                          <tr key={l._id} className="hover:bg-slate-900/30 transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-sm text-white font-medium">{l.adminId?.name || 'System'}</p>
                              <p className="text-xs text-slate-400">{l.adminId?.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-bold bg-violet-500/10 border border-violet-500/30 text-violet-400 px-2 py-0.5 rounded-lg">
                                {l.action}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-300">{l.details}</td>
                            <td className="px-4 py-3 text-xs text-slate-400 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              {new Date(l.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
