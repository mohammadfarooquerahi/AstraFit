import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Shield, Users, BarChart3, Brain, ClipboardList, MessageSquare, FileText,
  Search, Ban, CheckCircle, Crown, Flag, ArrowLeft, Loader2,
  TrendingUp, Zap, Activity, Camera, X, Edit3,
  RefreshCw, UserCheck, UserX, Clock, Star, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle2, XCircle, Save,
  ShieldOff, UserMinus
} from 'lucide-react';

const SECTIONS = [
  { id: 'analytics',   label: 'Analytics Overview',  icon: BarChart3 },
  { id: 'users',       label: 'User Management',      icon: Users },
  { id: 'ai-monitor',  label: 'AI & Plan Monitoring', icon: Brain },
  { id: 'chat-mod',    label: 'Chat Moderation',       icon: MessageSquare },
  { id: 'image-mod',   label: 'Image Moderation',      icon: Camera },
  { id: 'plan-mgmt',   label: 'Plan Overrides',        icon: ClipboardList },
  { id: 'logs',        label: 'Admin Action Logs',     icon: FileText },
];

const StatCard = ({ label, value, sub, icon: Icon, color = 'text-indigo-600', iconBg = 'bg-indigo-50 border-indigo-100' }) => (
  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    </div>
    <div>
      <p className="text-2xl sm:text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-500 font-medium mt-1">{sub}</p>}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    banned:   'bg-rose-50 text-rose-700 border-rose-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    Pending:  'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Flagged:  'bg-rose-50 text-rose-700 border-rose-200',
    Deleted:  'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md capitalize ${map[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
};

// Confirm Action Dialog
const ConfirmDialog = ({ open, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
        </div>
        <p className="text-xs text-slate-600 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Plan Edit Override Modal
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
      onSave('Plan updated successfully!');
      onClose();
    } catch (err) {
      onSave('Failed to update plan: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-600" />
            <span>Override {plan.planType === 'diet' ? 'Diet Plan' : 'Workout Routine'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <p className="text-slate-600">User: <span className="text-slate-900 font-bold">{plan.userId?.name || '—'}</span></p>
            <p className="text-slate-500 mt-0.5">Created: {new Date(plan.createdAt).toLocaleDateString()}</p>
          </div>

          {plan.planType === 'diet' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 uppercase tracking-wider">Daily Calories (kcal)</label>
              <input
                type="number"
                value={calories}
                onChange={e => setCalories(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 shadow-sm"
                placeholder="e.g. 2200"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 uppercase tracking-wider">Admin Notes / Override Reason</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 shadow-sm resize-none"
              placeholder="Reason for override or adjustments..."
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving...' : 'Save Override'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Component
const Toast = ({ msg, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [msg, onClose]);

  if (!msg) return null;
  const isError = msg.toLowerCase().includes('fail') || msg.includes('❌');

  return (
    <div className={`fixed top-4 right-4 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-xs font-semibold ${
      isError
        ? 'bg-rose-50 border-rose-200 text-rose-800'
        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
    }`}>
      {isError ? <XCircle className="w-4 h-4 shrink-0 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
      <span>{msg}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-slate-600">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [active, setActive]   = useState('analytics');
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState('');

  // Data states
  const [analytics,        setAnalytics]        = useState(null);
  const [users,            setUsers]            = useState([]);
  const [search,           setSearch]           = useState('');
  const [statusFilter,     setStatusFilter]     = useState('');
  const [aiPlans,          setAiPlans]          = useState([]);
  const [aiLogs,           setAiLogs]           = useState([]);
  const [aiLogStats,       setAiLogStats]       = useState([]);
  const [photos,           setPhotos]           = useState([]);
  const [photoCounts,      setPhotoCounts]      = useState({ pending: 0, flagged: 0 });
  const [chats,            setChats]            = useState([]);
  const [flaggedChatCount, setFlaggedChatCount] = useState(0);
  const [actionLogs,       setActionLogs]       = useState([]);
  const [planMgmtPlans,    setPlanMgmtPlans]    = useState([]);

  // UI state
  const [confirm,      setConfirm]      = useState(null);
  const [editPlan,     setEditPlan]     = useState(null);
  const [expandedChat, setExpandedChat] = useState({});

  const showToast = (msg) => setToast(msg);

  const load = useCallback(async (section) => {
    setLoading(true);
    try {
      if (section === 'analytics') {
        const { data } = await api.get('/api/admin/analytics');
        setAnalytics(data?.data);
      } else if (section === 'users') {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const { data } = await api.get('/api/admin/users', { params });
        setUsers(data?.data?.users || []);
      } else if (section === 'ai-monitor') {
        const [plans, logs] = await Promise.all([
          api.get('/api/admin/ai-plans'),
          api.get('/api/admin/ai-logs'),
        ]);
        setAiPlans(plans.data?.data?.plans || []);
        setAiLogs(logs.data?.data?.logs || []);
        setAiLogStats(logs.data?.data?.stats || []);
      } else if (section === 'image-mod') {
        const { data } = await api.get('/api/admin/photos');
        setPhotos(data?.data?.photos || []);
        setPhotoCounts({ pending: data?.data?.pendingCount || 0, flagged: data?.data?.flaggedCount || 0 });
      } else if (section === 'chat-mod') {
        const { data } = await api.get('/api/admin/chats');
        setChats(data?.data?.conversations || []);
        setFlaggedChatCount(data?.data?.flaggedCount || 0);
      } else if (section === 'plan-mgmt') {
        const { data } = await api.get('/api/admin/ai-plans');
        setPlanMgmtPlans(data?.data?.plans || []);
      } else if (section === 'logs') {
        const { data } = await api.get('/api/admin/action-logs');
        setActionLogs(data?.data?.logs || []);
      }
    } catch (err) {
      showToast('Failed to load data: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(active); }, [active, statusFilter, load]);

  // User Status
  const handleUserStatus = (userId, status, userName) => {
    if (userId === currentUser?._id) {
      showToast('You cannot alter your own account status.');
      return;
    }
    const isBan = status === 'banned';
    const isDeactivate = status === 'inactive';
    setConfirm({
      title: isBan ? 'Ban User' : isDeactivate ? 'Deactivate User' : 'Activate User',
      message: isBan
        ? `Are you sure you want to ban "${userName}"? They will lose access immediately.`
        : isDeactivate
        ? `Are you sure you want to deactivate "${userName}"?`
        : `Activate account for "${userName}"?`,
      confirmLabel: isBan ? 'Ban User' : isDeactivate ? 'Deactivate' : 'Activate',
      confirmClass: isBan || isDeactivate
        ? 'bg-rose-600 hover:bg-rose-700 text-white'
        : 'bg-emerald-600 hover:bg-emerald-700 text-white',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.put(`/api/admin/users/${userId}/status`, { status });
          showToast(`User "${userName}" ${status} successfully.`);
          load('users');
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to update user status.');
        }
      },
    });
  };

  const handleUserRole = (userId, role, userName) => {
    if (userId === currentUser?._id && role !== 'admin') {
      showToast('You cannot demote yourself.');
      return;
    }
    setConfirm({
      title: role === 'admin' ? 'Promote to Admin' : 'Demote to User',
      message: role === 'admin'
        ? `Grant administrator privileges to "${userName}"?`
        : `Remove administrator privileges from "${userName}"?`,
      confirmLabel: role === 'admin' ? 'Promote' : 'Demote',
      confirmClass: role === 'admin'
        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
        : 'bg-slate-700 hover:bg-slate-800 text-white',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.put(`/api/admin/users/${userId}/role`, { role });
          showToast(`"${userName}" is now a ${role}.`);
          load('users');
        } catch (err) {
          showToast(err.response?.data?.message || 'Failed to update user role.');
        }
      },
    });
  };

  // Photo Moderation
  const handlePhotoMod = async (id, status) => {
    try {
      await api.put(`/api/admin/photos/${id}/moderate`, { status });
      showToast(`Photo marked as ${status}.`);
      setPhotos(prev => prev.map(p => p._id === id ? { ...p, moderationStatus: status } : p));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to moderate photo.');
    }
  };

  // Chat Moderation
  const handleFlagChat = async (id, flag) => {
    try {
      await api.put(`/api/admin/chats/${id}/flag`, { isFlagged: flag });
      showToast(flag ? 'Message flagged.' : 'Message unflagged.');
      setChats(prev => prev.map(conv => ({
        ...conv,
        messages: conv.messages.map(m => m._id === id ? { ...m, isFlagged: flag } : m)
      })));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update message flag.');
    }
  };

  const toggleChatExpand = (idx) => setExpandedChat(prev => ({ ...prev, [idx]: !prev[idx] }));

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {toast && <Toast msg={toast} onClose={() => setToast('')} />}

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

      {editPlan && (
        <PlanEditModal
          plan={editPlan}
          onClose={() => setEditPlan(null)}
          onSave={(msg) => { showToast(msg); load(active); }}
        />
      )}

      {/* Header */}
      <header className="border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">Administration Hub</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Platform governance & moderation</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/prompts')}
            className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors"
          >
            Prompt Templates
          </button>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
            👑 {currentUser?.name || 'Admin'}
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 shrink-0 border-r border-slate-200/90 bg-white flex flex-col py-5 px-3 gap-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-3 mb-1 border-b border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Navigation</span>
          </div>

          {SECTIONS.map(s => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 border-l-2 border-indigo-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <s.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="flex-1">{s.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Main Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          )}

          {/* 1. Analytics */}
          {!loading && active === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Platform Analytics Overview</h2>
                  <p className="text-xs text-slate-500">Live operational & member statistics</p>
                </div>
                <button
                  onClick={() => load('analytics')}
                  className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-all shadow-xs"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Members" value={analytics.overview.totalUsers} sub="Registered users" icon={Users} color="text-blue-600" iconBg="bg-blue-50 border-blue-100" />
                <StatCard label="Active Accounts" value={analytics.overview.activeUsers} sub="Good standing" icon={UserCheck} color="text-emerald-600" iconBg="bg-emerald-50 border-emerald-100" />
                <StatCard label="Suspended" value={analytics.overview.bannedUsers} sub="Restricted" icon={UserX} color="text-rose-600" iconBg="bg-rose-50 border-rose-100" />
                <StatCard label="Avg Fitness Score" value={`${analytics.avgFitnessScore}/100`} sub="Member average" icon={Star} color="text-amber-600" iconBg="bg-amber-50 border-amber-100" />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Meal Plans" value={analytics.overview.totalDietPlans} sub="Active routines" icon={Zap} color="text-emerald-600" iconBg="bg-emerald-50 border-emerald-100" />
                <StatCard label="Workout Splits" value={analytics.overview.totalWorkoutPlans} sub="Active routines" icon={Activity} color="text-indigo-600" iconBg="bg-indigo-50 border-indigo-100" />
                <StatCard label="Coaching Chats" value={analytics.overview.totalChats} sub="Messages sent" icon={MessageSquare} color="text-purple-600" iconBg="bg-purple-50 border-purple-100" />
                <StatCard label="Progress Logs" value={analytics.overview.totalProgressLogs} sub="Tracked weigh-ins" icon={TrendingUp} color="text-blue-600" iconBg="bg-blue-50 border-blue-100" />
              </div>

              {/* AI Token Usage */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-600" /> AI Engine Consumption (Weekly)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase">Total Requests</p>
                    <p className="text-2xl font-bold text-slate-900">{analytics.ai.aiCallsThisWeek}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase">Tokens Processed</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {((analytics.ai.tokenStats.totalPromptTokens || 0) + (analytics.ai.tokenStats.totalCompletionTokens || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase">Average Latency</p>
                    <p className="text-2xl font-bold text-slate-900">{Math.round(analytics.ai.tokenStats.avgLatency || 0)} ms</p>
                  </div>
                </div>
              </div>

              {/* Daily Signups */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" /> Registrations (Last 7 Days)
                </h3>
                <div className="flex items-end gap-3 h-28 pt-2">
                  {analytics.dailySignups.length === 0 ? (
                    <p className="text-slate-400 text-xs">No registrations logged in the last 7 days.</p>
                  ) : (
                    analytics.dailySignups.map((d, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                        <div
                          className="bg-indigo-600 rounded-t-md w-full transition-all"
                          style={{ height: `${Math.max(10, Math.min(90, d.count * 25))}px` }}
                        />
                        <span className="text-[10px] text-slate-400 font-medium">{d._id.slice(5)}</span>
                        <span className="text-xs font-bold text-slate-800">{d.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. User Management */}
          {!loading && active === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Member Accounts</h2>
                  <p className="text-xs text-slate-500">Manage user access and roles</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-600 shadow-xs"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>

                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search member..."
                      className="text-xs text-slate-900 placeholder:text-slate-400 outline-none w-36"
                    />
                  </div>

                  <button
                    onClick={() => load('users')}
                    className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Goal</th>
                        <th className="px-4 py-3">Joined</th>
                        <th className="px-4 py-3">Logs</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map(u => {
                        const isSelf = u._id === currentUser?._id;
                        return (
                          <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                  {u.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                    {u.name}
                                    {isSelf && <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1 py-0.2 rounded font-semibold">YOU</span>}
                                  </p>
                                  <p className="text-[11px] text-slate-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{u.profile?.goal || '—'}</td>
                            <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{u.progressLogs || 0}</td>
                            <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md capitalize ${
                                u.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {u.role === 'admin' ? '👑 Admin' : 'User'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {!isSelf && u.status !== 'banned' && (
                                  <button
                                    onClick={() => handleUserStatus(u._id, 'banned', u.name)}
                                    title="Ban user"
                                    className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <Ban className="w-3 h-3" /> Ban
                                  </button>
                                )}
                                {!isSelf && u.status === 'banned' && (
                                  <button
                                    onClick={() => handleUserStatus(u._id, 'active', u.name)}
                                    title="Activate user"
                                    className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <CheckCircle className="w-3 h-3" /> Activate
                                  </button>
                                )}
                                {!isSelf && u.status === 'active' && (
                                  <button
                                    onClick={() => handleUserStatus(u._id, 'inactive', u.name)}
                                    title="Deactivate user"
                                    className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <UserMinus className="w-3 h-3" /> Deactivate
                                  </button>
                                )}
                                {!isSelf && u.role !== 'admin' && (
                                  <button
                                    onClick={() => handleUserRole(u._id, 'admin', u.name)}
                                    title="Promote to admin"
                                    className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <Crown className="w-3 h-3" /> Admin
                                  </button>
                                )}
                                {!isSelf && u.role === 'admin' && (
                                  <button
                                    onClick={() => handleUserRole(u._id, 'user', u.name)}
                                    title="Demote to user"
                                    className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                  >
                                    <ShieldOff className="w-3 h-3" /> Demote
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                            No members found matching your filter criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 3. AI Monitoring */}
          {!loading && active === 'ai-monitor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Plan Generation Monitoring</h2>
                  <p className="text-xs text-slate-500">Monitor generated programs and API metrics</p>
                </div>
                <button onClick={() => load('ai-monitor')} className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 shadow-xs">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Provider Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {aiLogStats.length === 0 ? (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 col-span-3 text-xs text-slate-400 shadow-sm">
                    No AI provider metrics logged yet.
                  </div>
                ) : (
                  aiLogStats.map(s => (
                    <div key={s._id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">{s._id}</p>
                      <p className="text-2xl font-bold text-slate-900">{s.count} Calls</p>
                      <p className="text-xs text-slate-500 mt-2">Tokens: <span className="font-semibold text-slate-800">{((s.totalPromptTokens || 0) + (s.totalCompletionTokens || 0)).toLocaleString()}</span></p>
                      <p className="text-xs text-slate-500">Avg Latency: <span className="font-semibold text-slate-800">{Math.round(s.avgLatencyMs || 0)} ms</span></p>
                    </div>
                  ))
                )}
              </div>

              {/* Generated Plans List */}
              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Generated Plans</h3>
                  <span className="text-xs text-slate-500">{aiPlans.length} records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Summary</th>
                        <th className="px-4 py-3">Generated</th>
                        <th className="px-4 py-3">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aiPlans.slice(0, 20).map(p => (
                        <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md ${
                              p.planType === 'diet' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                            }`}>
                              {p.planType === 'diet' ? '🥗 Diet' : '💪 Workout'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900">{p.userId?.name || '—'}</p>
                            <p className="text-[11px] text-slate-500">{p.userId?.email || '—'}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                            {p.planType === 'diet' ? `${p.dailyCalories || '—'} kcal/day` : `${p.splitType || '—'} • ${p.difficulty || '—'}`}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md">
                              {p.isAIGenerated ? 'AI Generated' : 'Manual'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. Chat Moderation */}
          {!loading && active === 'chat-mod' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Coach Chat Moderation</h2>
                  <p className="text-xs text-slate-500">Inspect member coaching conversations</p>
                </div>
                <div className="flex items-center gap-2">
                  {flaggedChatCount > 0 && (
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                      🚩 {flaggedChatCount} Flagged
                    </span>
                  )}
                  <button onClick={() => load('chat-mod')} className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 shadow-xs">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {chats.length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-xs text-slate-400 shadow-sm">
                  No member conversations recorded yet.
                </div>
              ) : (
                chats.map((conv, i) => (
                  <div key={i} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      className="w-full px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      onClick={() => toggleChatExpand(i)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                          {conv.user?.name?.charAt(0) || '?'}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900">{conv.user?.name || 'Unknown'}</p>
                          <p className="text-[11px] text-slate-500">{conv.user?.email || '—'} • {conv.messages.length} messages</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {conv.messages.some(m => m.isFlagged) && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                            Flagged
                          </span>
                        )}
                        {expandedChat[i] ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {expandedChat[i] && (
                      <div className="p-4 space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                        {conv.messages.map(m => (
                          <div key={m._id} className={`flex items-start gap-2 ${m.sender === 'ai' ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex-1 text-xs px-3.5 py-2.5 rounded-xl border ${
                              m.sender === 'user'
                                ? 'bg-slate-50 border-slate-200 text-slate-800'
                                : 'bg-indigo-50/40 border-indigo-100 text-indigo-950'
                            } ${m.isFlagged ? 'border-rose-300 bg-rose-50/50' : ''}`}>
                              <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">{m.sender}</span>
                              <p className="mt-0.5 leading-relaxed">{m.message}</p>
                            </div>
                            <button
                              onClick={() => handleFlagChat(m._id, !m.isFlagged)}
                              className={`p-1.5 rounded-lg border text-xs transition-colors shrink-0 ${
                                m.isFlagged
                                  ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                  : 'border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200'
                              }`}
                              title={m.isFlagged ? 'Unflag message' : 'Flag message'}
                            >
                              <Flag className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. Image Moderation */}
          {!loading && active === 'image-mod' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Member Progress Photos Moderation</h2>
                  <p className="text-xs text-slate-500">Review uploaded physique documentation</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    ⏳ {photoCounts.pending} Pending
                  </span>
                  <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                    🚩 {photoCounts.flagged} Flagged
                  </span>
                  <button onClick={() => load('image-mod')} className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 shadow-xs">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {photos.length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center text-xs text-slate-400 shadow-sm">
                  No photos uploaded for moderation.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map(p => (
                    <div key={p._id} className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                      <div className="relative h-44 bg-slate-100">
                        <img
                          src={p.imagePath}
                          alt="Progress photo"
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = 'https://via.placeholder.com/300x200/f1f5f9/64748b?text=Image'; }}
                        />
                        <div className="absolute top-2 right-2">
                          <StatusBadge status={p.moderationStatus} />
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white p-1.5 rounded-lg text-[10px]">
                          <p className="font-bold truncate">{p.userId?.name || 'Member'}</p>
                          <p className="text-slate-300">Week {p.weekNumber} • {p.viewType}</p>
                        </div>
                      </div>

                      <div className="p-2.5 flex gap-1.5 bg-slate-50 border-t border-slate-100">
                        {['Approved', 'Flagged', 'Deleted'].map(s => (
                          <button
                            key={s}
                            onClick={() => handlePhotoMod(p._id, s)}
                            className={`flex-1 text-[11px] font-semibold py-1 rounded-lg border transition-all ${
                              p.moderationStatus === s
                                ? 'bg-white border-slate-300 text-slate-900 shadow-xs'
                                : 'border-slate-200 text-slate-500 hover:bg-white hover:text-slate-800'
                            }`}
                          >
                            {s === 'Approved' ? 'Approve' : s === 'Flagged' ? 'Flag' : 'Delete'}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. Plan Overrides */}
          {!loading && active === 'plan-mgmt' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Plan Management & Overrides</h2>
                  <p className="text-xs text-slate-500">Inspect and manually override member workout/diet programs</p>
                </div>
                <button onClick={() => load('plan-mgmt')} className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 shadow-xs">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Active Member Plans</h3>
                  <span className="text-xs text-slate-500">{planMgmtPlans.length} records</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Plan Details</th>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {planMgmtPlans.slice(0, 30).map(p => (
                        <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md ${
                              p.planType === 'diet' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-indigo-700 bg-indigo-50 border-indigo-200'
                            }`}>
                              {p.planType === 'diet' ? '🥗 Diet' : '💪 Workout'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900">{p.userId?.name || '—'}</p>
                            <p className="text-[11px] text-slate-500">{p.userId?.email}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-700 max-w-xs truncate">
                            {p.planType === 'diet'
                              ? <span>{p.dailyCalories} kcal | P:{p.macros?.protein}g C:{p.macros?.carbs}g F:{p.macros?.fat}g</span>
                              : <span>{p.title || p.splitType} | {p.difficulty}</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            {p.adminEdited ? (
                              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                                Overridden
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Standard</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setEditPlan(p)}
                              className="text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                            >
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

          {/* 7. Action Logs */}
          {!loading && active === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Admin Audit Trail</h2>
                  <p className="text-xs text-slate-500">Record of administrative interventions</p>
                </div>
                <button onClick={() => load('logs')} className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 shadow-xs">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="px-4 py-3">Admin</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Details</th>
                        <th className="px-4 py-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {actionLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                            No administrative actions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        actionLogs.map(l => (
                          <tr key={l._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900">{l.adminId?.name || 'System'}</p>
                              <p className="text-[11px] text-slate-500">{l.adminId?.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                                {l.action}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{l.details}</td>
                            <td className="px-4 py-3 text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {new Date(l.createdAt).toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
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
