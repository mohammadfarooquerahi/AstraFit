import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Users, Shield, Activity, Cpu, Search, Ban, CheckCircle,
  AlertCircle, ArrowLeft, Loader2, RefreshCw, UserCheck, Key
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [aiLogs, setAiLogs] = useState([]);
  const [aiStats, setAiStats] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, aiRes] = await Promise.all([
        api.get('/api/admin/users'),
        api.get('/api/admin/ai-logs'),
      ]);
      setUsers(usersRes.data.data.users || []);
      setAiLogs(aiRes.data.data.logs || []);
      setAiStats(aiRes.data.data.stats || []);
    } catch (err) {
      setError('Failed to load admin data. Make sure your account has admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const handleStatusChange = async (userId, newStatus) => {
    setUpdatingId(userId);
    try {
      await api.put(`/api/admin/users/${userId}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      setError('Failed to update user status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      setError('Failed to update user role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPromptTokens = aiLogs.reduce((acc, l) => acc + (l.promptTokens || 0), 0);
  const totalCompletionTokens = aiLogs.reduce((acc, l) => acc + (l.completionTokens || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold">Admin Control Panel</h1>
          </div>
        </div>
        <button onClick={fetchAdminData} className="text-slate-400 hover:text-white p-2">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Total Users</span>
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-3xl font-black text-white">{users.length}</p>
          </div>

          <div className="glass-panel border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Active Admins</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-black text-emerald-400">{users.filter(u => u.role === 'admin').length}</p>
          </div>

          <div className="glass-panel border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Banned Accounts</span>
              <Ban className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-3xl font-black text-red-400">{users.filter(u => u.status === 'banned').length}</p>
          </div>

          <div className="glass-panel border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold uppercase">Total AI Tokens</span>
              <Cpu className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-3xl font-black text-sky-400">{totalPromptTokens + totalCompletionTokens}</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 mb-6 gap-6">
          <button onClick={() => setActiveTab('users')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'users' ? 'border-violet-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}>
            👥 User Management ({users.length})
          </button>
          <button onClick={() => setActiveTab('ai')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'ai' ? 'border-violet-500 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}>
            🤖 AI Consumption & Logs
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading admin telemetry...</p>
          </div>
        )}

        {!loading && activeTab === 'users' && (
          <>
            {/* Search Filter Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Users Table */}
            <div className="glass-panel border border-slate-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Goal</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-slate-900/40">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={user.role}
                          disabled={updatingId === user._id}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                          className="bg-slate-900 border border-slate-800 text-xs font-semibold text-violet-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin 👑</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          user.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                            : user.status === 'banned'
                              ? 'bg-red-500/10 text-red-300 border-red-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        {user.profile?.goal || 'Not Onboarded'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {user.status === 'banned' ? (
                          <button
                            onClick={() => handleStatusChange(user._id, 'active')}
                            disabled={updatingId === user._id}
                            className="text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Unban User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(user._id, 'banned')}
                            disabled={updatingId === user._id}
                            className="text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Ban User
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && activeTab === 'ai' && (
          <div className="space-y-6">
            {/* AI Log Table */}
            <div className="glass-panel border border-slate-800 rounded-3xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Feature</th>
                    <th className="py-3.5 px-4">Provider</th>
                    <th className="py-3.5 px-4">Tokens (Prompt / Compl)</th>
                    <th className="py-3.5 px-4">Latency</th>
                    <th className="py-3.5 px-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {aiLogs.map(log => (
                    <tr key={log._id} className="hover:bg-slate-900/40">
                      <td className="py-3.5 px-4 font-semibold text-white capitalize">{log.feature || log.requestType}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-md">
                          {log.provider}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-300">
                        {log.promptTokens} / {log.completionTokens}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-amber-400">
                        {log.latencyMs} ms
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                  {aiLogs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-500 text-sm">
                        No AI usage logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
