import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Shield, Users, BarChart3, Brain, Image, ClipboardList, MessageSquare, FileText,
  Search, Ban, CheckCircle, Crown, Trash2, Flag, Eye, ArrowLeft, Loader2,
  AlertCircle, TrendingUp, Zap, Activity, Camera, X, Edit3,
  RefreshCw, UserCheck, UserX, Clock, Star, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, XCircle, Save, ToggleLeft, ToggleRight,
  MessageCircle, ShieldOff, UserMinus
} from 'lucide-react';

const SECTIONS = [
  { id: 'analytics',   label: 'Analytics Dashboard', icon: BarChart3,      color: 'text-violet-400' },
  { id: 'users',       label: 'User Management',      icon: Users,          color: 'text-blue-400' },
  { id: 'ai-monitor',  label: 'AI Monitoring',         icon: Brain,          color: 'text-emerald-400' },
  { id: 'chat-mod',    label: 'Chat Moderation',       icon: MessageSquare,  color: 'text-pink-400' },
  { id: 'image-mod',   label: 'Image Moderation',      icon: Camera,         color: 'text-amber-400' },
  { id: 'plan-mgmt',   label: 'Plan Management',       icon: ClipboardList,  color: 'text-indigo-400' },
  { id: 'logs',        label: 'Reports & Logs',        icon: FileText,       color: 'text-rose-400' },
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

const StatusBadge = ({ status }) => {
  const map = {
    active:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    banned:   'bg-red-500/10 text-red-400 border-red-500/30',
    inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    Pending:  'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    Flagged:  'bg-red-500/10 text-red-400 border-red-500/30',
    Deleted:  'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };
  return (
    <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-lg capitalize ${map[status] || 'bg-slate-800 text-slate-400'}`}>
      {status}
    </span>
  );
};

// ── Confirm Dialog ─────────────────────────────────────────────
const ConfirmDialog = ({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-base font-black text-white">{title}</h3>
        </div>
        <p className="text-sm text-slate-400 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-slate-700 text-slate-400 text-sm font-bold hover:bg-slate-800 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Plan Edit Modal ────────────────────────────────────────────
const PlanEditModal = ({ plan, onClose, onSave }) => {
  const [calories, setCalories] = useState(plan?.dailyCalories || '');
  const [notes, setNotes] = useState(plan?.adminNotes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint = plan.planType === 'diet'
        ? `/api/admin/plans/diet/${plan._id}`
        : `/api/admin/plans/workout/${plan._id}`;
      const payload = plan.planType === 'diet'
        ? { dailyCalories: Number(calories), adminNotes: notes }
        : { adminNotes: notes };
      await api.put(endpoint, payload);
      onSave('✅ Plan updated successfully!');
      onClose();
    } catch (err) {
      onSave('❌ Failed to update plan: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-400" />
            Override {plan.planType === 'diet' ? '🥗 Diet' : '💪 Workout'} Plan
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 mb-1">User: <span className="text-white font-bold">{plan.userId?.name || '—'}</span></p>
            <p className="text-xs text-slate-400">Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
          </div>
          {plan.planType === 'diet' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">Daily Calories (kcal)</label>
              <input
                type="number"
                value={calories}
                onChange={e => setCalories(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. 2200"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Admin Notes / Override Reason</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              placeholder="Reason for override or additional notes..."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm font-bold hover:bg-slate-800 transition-all">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Override'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Toast Notification ─────────────────────────────────────────
const Toast = ({ msg, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;
  const isError = msg.startsWith('❌');
  return (
    <div className={`fixed top-4 right-4 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl text-sm font-semibold animate-slide-in ${
      isError
        ? 'bg-red-950/90 border-red-700 text-red-300'
        : 'bg-emerald-950/90 border-emerald-700 text-emerald-300'
    }`}>
      {isError ? <XCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [active, setActive]   = useState('analytics');
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState('');

  // Data states
  const [analytics,       setAnalytics]       = useState(null);
  const [users,           setUsers]           = useState([]);
  const [search,          setSearch]          = useState('');
  const [statusFilter,    setStatusFilter]    = useState('');
  const [aiPlans,         setAiPlans]         = useState([]);
  const [aiLogs,          setAiLogs]          = useState([]);
  const [aiLogStats,      setAiLogStats]      = useState([]);
  const [photos,          setPhotos]          = useState([]);
  const [photoCounts,     setPhotoCounts]     = useState({ pending: 0, flagged: 0 });
  const [chats,           setChats]           = useState([]);
  const [flaggedChatCount,setFlaggedChatCount]= useState(0);
  const [actionLogs,      setActionLogs]      = useState([]);
  const [planMgmtPlans,   setPlanMgmtPlans]   = useState([]);

  // UI states
  const [confirm,     setConfirm]     = useState(null);  // { title, message, confirmLabel, confirmClass, onConfirm }
  const [editPlan,    setEditPlan]    = useState(null);   // plan object to edit
  const [expandedChat,setExpandedChat]= useState({});

  const showToast = (msg) => setToast(msg);

  // ── Load section data ────────────────────────────────────────
  const load = useCallback(async (section) => {
    setLoading(true);
    try {
      if (section === 'analytics') {
        const { data } = await api.get('/api/admin/analytics');
        setAnalytics(data.data);
      } else if (section === 'users') {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const { data } = await api.get('/api/admin/users', { params });
        setUsers(data.data.users);
      } else if (section === 'ai-monitor') {
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
      } else if (section === 'plan-mgmt') {
        const { data } = await api.get('/api/admin/ai-plans');
        setPlanMgmtPlans(data.data.plans);
      } else if (section === 'logs') {
        const { data } = await api.get('/api/admin/action-logs');
        setActionLogs(data.data.logs);
      }
    } catch (err) {
      showToast('❌ Failed to load data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(active); }, [active, statusFilter]);

  // ── User Actions ─────────────────────────────────────────────
  const handleUserStatus = (userId, status, userName) => {
    if (userId === currentUser?._id) {
      showToast('❌ You cannot change your own account status.');
      return;
    }
    const isBan = status === 'banned';
    const isDeactivate = status === 'inactive';
    setConfirm({
      title: isBan ? 'Ban User' : isDeactivate ? 'Deactivate User' : 'Activate User',
      message: isBan
        ? `Are you sure you want to BAN "${userName}"? They will lose all access immediately.`
        : isDeactivate
        ? `Are you sure you want to deactivate "${userName}"?`
        : `Are you sure you want to activate "${userName}"?`,
      confirmLabel: isBan ? 'Ban User' : isDeactivate ? 'Deactivate' : 'Activate',
      confirmClass: isBan || isDeactivate
        ? 'bg-red-600 hover:bg-red-500 text-white'
        : 'bg-emerald-600 hover:bg-emerald-500 text-white',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.put(`/api/admin/users/${userId}/status`, { status });
          showToast(`✅ User "${userName}" ${status} successfully.`);
          load('users');
        } catch (err) {
          showToast('❌ ' + (err.response?.data?.message || 'Failed to update user status.'));
        }
      },
    });
  };

  const handleUserRole = (userId, role, userName) => {
    if (userId === currentUser?._id && role !== 'admin') {
      showToast('❌ You cannot demote yourself.');
      return;
    }
    setConfirm({
      title: role === 'admin' ? 'Promote to Admin' : 'Demote to User',
      message: role === 'admin'
        ? `Grant admin privileges to "${userName}"? They will have full control panel access.`
        : `Remove admin privileges from "${userName}"?`,
      confirmLabel: role === 'admin' ? 'Promote' : 'Demote',
      confirmClass: role === 'admin'
        ? 'bg-violet-600 hover:bg-violet-500 text-white'
        : 'bg-slate-700 hover:bg-slate-600 text-white',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.put(`/api/admin/users/${userId}/role`, { role });
          showToast(`✅ "${userName}" is now a ${role}.`);
          load('users');
        } catch (err) {
          showToast('❌ ' + (err.response?.data?.message || 'Failed to update role.'));
        }
      },
    });
  };

  // ── Photo Moderation ─────────────────────────────────────────
  const handlePhotoMod = async (id, status) => {
    try {
      await api.put(`/api/admin/photos/${id}/moderate`, { status });
      showToast(`✅ Photo marked as ${status}.`);
      setPhotos(prev => prev.map(p => p._id === id ? { ...p, moderationStatus: status } : p));
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to moderate photo.'));
    }
  };

  // ── Chat Moderation ──────────────────────────────────────────
  const handleFlagChat = async (id, flag) => {
    try {
      await api.put(`/api/admin/chats/${id}/flag`, { isFlagged: flag });
      showToast(flag ? '🚩 Message flagged.' : '✅ Message unflagged.');
      setChats(prev => prev.map(conv => ({
        ...conv,
        messages: conv.messages.map(m => m._id === id ? { ...m, isFlagged: flag } : m)
      })));
    } catch (err) {
      showToast('❌ ' + (err.response?.data?.message || 'Failed to flag message.'));
    }
  };

  const toggleChatExpand = (idx) => setExpandedChat(prev => ({ ...prev, [idx]: !prev[idx] }));

  // ── Filter ───────────────────────────────────────────────────
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  // ════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Toast */}
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

      {/* Confirm Dialog */}
      {confirm && (
        <ConfirmDialog
          open={true}
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          confirmClass={confirm.confirmClass}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Plan Edit Modal */}
      {editPlan && (
        <PlanEditModal
          plan={editPlan}
          onClose={() => setEditPlan(null)}
          onSave={(msg) => { showToast(msg); load(active); }}
        />
      )}

      {/* Header */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center gap-4 bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-xl">
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
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:block">Logged in as:</span>
          <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-lg">
            👑 {currentUser?.name || 'Admin'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-violet-400 to-indigo-500 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
                )}
                <div className={`p-1.5 rounded-lg transition-all ${isActive ? 'bg-violet-500/20 text-violet-300' : 'bg-slate-900/80 text-slate-500 group-hover:text-slate-300'}`}>
                  <s.icon className={`w-4 h-4 ${isActive ? s.color : 'text-slate-400'}`} />
                </div>
                <span className="flex-1 text-xs sm:text-sm font-bold tracking-tight">{s.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
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

          {/* ─── Analytics ─── */}
          {!loading && active === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">📊 Platform Analytics</h2>
                <button onClick={() => load('analytics')} className="text-slate-400 hover:text-white p-2 border border-slate-800 rounded-xl hover:bg-slate-900 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users"       value={analytics.overview.totalUsers}       sub="Registered accounts"      icon={Users}     color="text-blue-400" />
                <StatCard label="Active Users"      value={analytics.overview.activeUsers}      sub="Status: active"           icon={UserCheck} color="text-emerald-400" />
                <StatCard label="Banned Users"      value={analytics.overview.bannedUsers}      sub="Blocked accounts"         icon={UserX}     color="text-red-400" />
                <StatCard label="Avg Fitness Score" value={`${analytics.avgFitnessScore}/100`} sub="User progress average"    icon={Star}      color="text-amber-400" />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Diet Plans"      value={analytics.overview.totalDietPlans}     sub="AI-generated meal plans"  icon={Zap}           color="text-emerald-400" />
                <StatCard label="Workout Plans"   value={analytics.overview.totalWorkoutPlans}  sub="Training splits"          icon={Activity}      color="text-violet-400" />
                <StatCard label="AI Chats Sent"   value={analytics.overview.totalChats}         sub="User messages to AI"      icon={MessageSquare} color="text-pink-400" />
                <StatCard label="Progress Logs"   value={analytics.overview.totalProgressLogs}  sub="Weight entries tracked"   icon={TrendingUp}    color="text-blue-400" />
              </div>
              {/* AI Stats */}
              <div className="glass-panel border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Brain className="w-4 h-4 text-emerald-400" /> AI Usage This Week</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">API Calls</p>
                    <p className="text-2xl font-black text-emerald-400">{analytics.ai.aiCallsThisWeek}</p>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Total Tokens</p>
                    <p className="text-2xl font-black text-violet-400">{((analytics.ai.tokenStats.totalPromptTokens || 0) + (analytics.ai.tokenStats.totalCompletionTokens || 0)).toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                    <p className="text-xs text-slate-400 mb-1">Avg Latency</p>
                    <p className="text-2xl font-black text-amber-400">{Math.round(analytics.ai.tokenStats.avgLatency || 0)} ms</p>
                  </div>
                </div>
              </div>
              {/* Daily Signups Chart */}
              <div className="glass-panel border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Daily Registrations (Last 7 Days)</h3>
                <div className="flex items-end gap-3 h-28">
                  {analytics.dailySignups.length === 0
                    ? <p className="text-slate-500 text-sm">No signups in last 7 days.</p>
                    : analytics.dailySignups.map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div className="bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-md w-full transition-all" style={{ height: `${Math.max(8, Math.min(100, d.count * 30))}px` }} />
                        <span className="text-[10px] text-slate-500">{d._id.slice(5)}</span>
                        <span className="text-xs font-bold text-white">{d.count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── User Management ─── */}
          {!loading && active === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-black text-white">👥 User Management</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-sm text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500 transition-colors"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                  {/* Search */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email..."
                      className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-44" />
                  </div>
                  <button onClick={() => load('users')} className="p-2.5 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                    <RefreshCw className="w-4 h-4" />
                  </button>
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
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Logs</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {filteredUsers.map(u => {
                        const isSelf = u._id === currentUser?._id;
                        return (
                          <tr key={u._id} className={`hover:bg-slate-900/40 transition-colors ${isSelf ? 'bg-violet-950/10' : ''}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-xs">
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-white flex items-center gap-1">
                                    {u.name}
                                    {isSelf && <span className="text-[9px] bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded font-bold">YOU</span>}
                                  </p>
                                  <p className="text-xs text-slate-400">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-300">{u.profile?.goal || '—'}</td>
                            <td className="px-4 py-3 text-xs text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-xs text-slate-300 font-bold">{u.progressLogs || 0}</td>
                            <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-lg capitalize ${u.role === 'admin' ? 'bg-violet-500/10 text-violet-400 border-violet-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                                {u.role === 'admin' ? '👑 Admin' : 'User'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {/* Ban / Activate / Deactivate */}
                                {!isSelf && u.status !== 'banned' && (
                                  <button
                                    onClick={() => handleUserStatus(u._id, 'banned', u.name)}
                                    title="Ban User"
                                    className="text-xs font-semibold text-red-400 bg-red-950/30 border border-red-800/50 hover:bg-red-900/40 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                                  >
                                    <Ban className="w-3 h-3" /> Ban
                                  </button>
                                )}
                                {!isSelf && u.status === 'banned' && (
                                  <button
                                    onClick={() => handleUserStatus(u._id, 'active', u.name)}
                                    title="Activate User"
                                    className="text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-800/50 hover:bg-emerald-900/40 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3" /> Activate
                                  </button>
                                )}
                                {!isSelf && u.status === 'active' && (
                                  <button
                                    onClick={() => handleUserStatus(u._id, 'inactive', u.name)}
                                    title="Deactivate User"
                                    className="text-xs font-semibold text-amber-400 bg-amber-950/30 border border-amber-800/50 hover:bg-amber-900/40 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                                  >
                                    <UserMinus className="w-3 h-3" /> Deactivate
                                  </button>
                                )}
                                {/* Promote / Demote */}
                                {!isSelf && u.role !== 'admin' && (
                                  <button
                                    onClick={() => handleUserRole(u._id, 'admin', u.name)}
                                    title="Promote to Admin"
                                    className="text-xs font-semibold text-violet-400 bg-violet-950/30 border border-violet-800/50 hover:bg-violet-900/40 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                                  >
                                    <Crown className="w-3 h-3" /> Admin
                                  </button>
                                )}
                                {!isSelf && u.role === 'admin' && (
                                  <button
                                    onClick={() => handleUserRole(u._id, 'user', u.name)}
                                    title="Demote to User"
                                    className="text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                                  >
                                    <ShieldOff className="w-3 h-3" /> Demote
                                  </button>
                                )}
                                {isSelf && (
                                  <span className="text-[10px] text-slate-500 italic">— your account —</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-slate-500 text-sm">
                            No users found. Try adjusting filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-slate-800 bg-slate-900/30">
                  <p className="text-xs text-slate-500">{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} shown</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── AI Output Monitoring ─── */}
          {!loading && active === 'ai-monitor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">🧠 AI Output Monitoring</h2>
                <button onClick={() => load('ai-monitor')} className="p-2 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {/* Provider Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {aiLogStats.length === 0 && (
                  <div className="glass-panel border border-slate-800 rounded-2xl p-5 col-span-3">
                    <p className="text-slate-500 text-sm">No AI usage logs yet. Generate some plans to see stats.</p>
                  </div>
                )}
                {aiLogStats.map(s => (
                  <div key={s._id} className="glass-panel border border-slate-800 rounded-2xl p-5">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{s._id}</p>
                    <p className="text-2xl font-black text-emerald-400">{s.count} Calls</p>
                    <p className="text-xs text-slate-400 mt-1">Prompt: <span className="text-white font-bold">{(s.totalPromptTokens || 0).toLocaleString()}</span> tok</p>
                    <p className="text-xs text-slate-400">Completion: <span className="text-white font-bold">{(s.totalCompletionTokens || 0).toLocaleString()}</span> tok</p>
                    <p className="text-xs text-slate-400">Avg Latency: <span className="text-amber-400 font-bold">{Math.round(s.avgLatencyMs || 0)} ms</span></p>
                  </div>
                ))}
              </div>
              {/* Plans Table */}
              <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Generated Diet & Workout Plans</h3>
                  <span className="text-xs text-slate-400">{aiPlans.length} total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Summary</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Generated</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {aiPlans.slice(0, 25).map(p => (
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
                              {p.isAIGenerated ? '✅ AI' : '📝 Manual'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {aiPlans.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">No AI plans generated yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* API Logs */}
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
                          <td className="px-4 py-3 text-xs"><span className="text-violet-400 font-bold">{l.provider}</span></td>
                          <td className="px-4 py-3 text-xs text-slate-400 capitalize">{l.feature?.replace('_', ' ') || '—'}</td>
                          <td className="px-4 py-3 text-xs"><span className="text-emerald-400 font-bold">{(l.promptTokens || 0) + (l.completionTokens || 0)}</span> tok</td>
                          <td className="px-4 py-3 text-xs"><span className={l.latencyMs > 3000 ? 'text-red-400' : 'text-emerald-400'}>{l.latencyMs || 0} ms</span></td>
                          <td className="px-4 py-3 text-xs text-slate-400">{new Date(l.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                      {aiLogs.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">No API call logs yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── Chat Moderation ─── */}
          {!loading && active === 'chat-mod' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">💬 Chat Moderation</h2>
                <div className="flex items-center gap-2">
                  {flaggedChatCount > 0 && (
                    <span className="text-xs font-bold text-red-400 bg-red-950/40 border border-red-800/50 px-3 py-1.5 rounded-xl">
                      🚩 {flaggedChatCount} Flagged
                    </span>
                  )}
                  <button onClick={() => load('chat-mod')} className="p-2 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {chats.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No chat conversations yet.</p>}

              {chats.map((conv, i) => (
                <div key={i} className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    className="w-full px-5 py-3 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between hover:bg-slate-900/80 transition-colors"
                    onClick={() => toggleChatExpand(i)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">
                        {conv.user?.name?.charAt(0) || '?'}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">{conv.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-400">{conv.user?.email || '—'} • {conv.messages.length} messages</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {conv.messages.some(m => m.isFlagged) && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-950/30 border border-red-800/40 px-2 py-0.5 rounded-lg">🚩 Flagged</span>
                      )}
                      {expandedChat[i] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>
                  {expandedChat[i] && (
                    <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                      {conv.messages.map(m => (
                        <div key={m._id} className={`flex items-start gap-2 ${m.sender === 'ai' ? 'flex-row-reverse' : ''}`}>
                          <div className={`flex-1 text-xs px-3 py-2 rounded-xl ${
                            m.sender === 'user'
                              ? 'bg-slate-900 border border-slate-800 text-slate-300'
                              : 'bg-violet-950/30 border border-violet-800/30 text-violet-200'
                          } ${m.isFlagged ? 'border-red-500/50 bg-red-950/20' : ''}`}>
                            <span className={`font-bold text-[10px] uppercase ${m.sender === 'user' ? 'text-slate-400' : 'text-violet-400'}`}>{m.sender}</span>
                            <p className="mt-0.5">{m.message?.slice(0, 200)}{m.message?.length > 200 ? '...' : ''}</p>
                            {m.isFlagged && <span className="text-[10px] text-red-400 font-bold">🚩 FLAGGED</span>}
                          </div>
                          <button
                            onClick={() => handleFlagChat(m._id, !m.isFlagged)}
                            title={m.isFlagged ? 'Unflag message' : 'Flag message'}
                            className={`shrink-0 p-1.5 rounded-lg border text-[10px] transition-all ${
                              m.isFlagged
                                ? 'border-emerald-800/50 text-emerald-400 hover:bg-emerald-950/30 bg-emerald-950/10'
                                : 'border-slate-700 text-slate-500 hover:border-red-800/50 hover:text-red-400 hover:bg-red-950/10'
                            }`}>
                            <Flag className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ─── Image Moderation ─── */}
          {!loading && active === 'image-mod' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-black text-white">📸 Image Moderation</h2>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">⏳ {photoCounts.pending} Pending</span>
                  <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-xl">🚩 {photoCounts.flagged} Flagged</span>
                  <button onClick={() => load('image-mod')} className="p-2 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {photos.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No photos uploaded yet.</p>}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(p => (
                  <div key={p._id} className="glass-panel border border-slate-800 rounded-2xl overflow-hidden group hover:border-slate-700 transition-all">
                    <div className="relative h-44">
                      <img src={p.imagePath} alt="Progress" className="w-full h-full object-cover" onError={e => { e.target.src = 'https://via.placeholder.com/300x200/1e293b/64748b?text=Image'; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-80" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-[10px] font-bold text-white">{p.userId?.name || '?'}</p>
                        <p className="text-[9px] text-slate-300">Week {p.weekNumber} • {p.viewType}</p>
                      </div>
                      <div className="absolute top-2 right-2"><StatusBadge status={p.moderationStatus} /></div>
                    </div>
                    <div className="p-3 flex gap-1.5">
                      {['Approved', 'Flagged', 'Deleted'].map(s => (
                        <button key={s} onClick={() => handlePhotoMod(p._id, s)}
                          title={s}
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

          {/* ─── Plan Management ─── */}
          {!loading && active === 'plan-mgmt' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">📋 Plan Management (Override System)</h2>
                <button onClick={() => load('plan-mgmt')} className="p-2 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="glass-panel border border-amber-800/30 bg-amber-950/10 rounded-2xl p-5">
                <p className="text-sm text-amber-300 font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Admin Override Active</p>
                <p className="text-xs text-slate-400 mt-1">As an admin, you can override any AI-generated diet or workout plan. Click "Edit Override" to modify plan parameters.</p>
              </div>

              <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">All AI-Generated Plans</h3>
                  <span className="text-xs text-slate-400">{planMgmtPlans.length} plans</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/50">
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Details</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Override</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {planMgmtPlans.slice(0, 30).map(p => (
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
                              : <span>{p.title || p.splitType} | {p.splitType} | {p.difficulty}</span>}
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            {p.adminEdited
                              ? <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded-lg">✏️ Overridden</span>
                              : <span className="text-[10px] text-slate-500">—</span>}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setEditPlan(p)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-950/30 border border-indigo-800/50 hover:bg-indigo-900/40 px-3 py-1.5 rounded-lg transition-all"
                            >
                              <Edit3 className="w-3 h-3" /> Edit Override
                            </button>
                          </td>
                        </tr>
                      ))}
                      {planMgmtPlans.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">No plans generated yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── Reports & Logs ─── */}
          {!loading && active === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-white">🧾 Reports & Admin Action Logs</h2>
                <button onClick={() => load('logs')} className="p-2 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

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
                            <td className="px-4 py-3 text-xs text-slate-400">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-500" />
                                {new Date(l.createdAt).toLocaleString()}
                              </div>
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

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
