import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
  TrendingUp, Scale, Award, Calendar, Plus, ArrowLeft,
  Loader2, AlertCircle, Check, Activity
} from 'lucide-react';

export default function ProgressTracker() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ currentWeight: 0, weightChange: 0, fitnessScore: 70 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    chestSize: '',
    waistSize: '',
    hipSize: '',
  });

  const fetchProgress = async () => {
    try {
      const { data } = await api.get('/api/progress');
      setLogs(data.data.logs || []);
      setStats(data.data.stats || {});
    } catch (err) {
      setError('Failed to load progress data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProgress(); }, []);

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!form.weight) return;
    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/progress', form);
      setShowModal(false);
      setForm({ date: new Date().toISOString().split('T')[0], weight: '', chestSize: '', waistSize: '', hipSize: '' });
      await fetchProgress();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add progress entry.');
    } finally {
      setSubmitting(false);
    }
  };

  const chartData = logs.map(l => ({
    date: l.date.slice(5), // MM-DD
    weight: l.weight,
    score: l.fitnessScore,
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h1 className="text-lg font-bold">Progress Tracker</h1>
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="btn-gradient text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-violet-500/20">
          <Plus className="w-4 h-4" /> Log Entry
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading your fitness trends...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="glass-panel border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Current Weight</span>
                  <Scale className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-3xl font-black text-white">{stats.currentWeight || '—'} <span className="text-sm font-normal text-slate-400">kg</span></p>
                <p className="text-xs text-slate-500 mt-1">First logged: {stats.startWeight || '—'} kg</p>
              </div>

              <div className="glass-panel border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Net Weight Change</span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>
                <p className={`text-3xl font-black ${stats.weightChange <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {stats.weightChange > 0 ? `+${stats.weightChange}` : stats.weightChange || '0'} <span className="text-sm font-normal text-slate-400">kg</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Across {stats.logCount || 0} entries</p>
              </div>

              <div className="glass-panel border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Fitness Score</span>
                  <Award className="w-4 h-4 text-violet-400" />
                </div>
                <p className="text-3xl font-black text-violet-400">{stats.fitnessScore || 70} <span className="text-sm font-normal text-slate-400">/ 100</span></p>
                <p className="text-xs text-slate-500 mt-1">AI calculated metric</p>
              </div>
            </div>

            {/* Recharts Weight Trend Chart */}
            <div className="glass-panel border border-slate-800 rounded-3xl p-6 mb-8">
              <h3 className="text-lg font-bold text-white mb-4">Weight History Trend (kg)</h3>
              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff' }} />
                      <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-slate-500 text-sm text-center py-12">No progress data logged yet. Click "Log Entry" to start tracking!</p>
              )}
            </div>

            {/* History Table */}
            <div className="glass-panel border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Log History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="pb-3 px-2">Date</th>
                      <th className="pb-3 px-2">Weight (kg)</th>
                      <th className="pb-3 px-2">Chest (cm)</th>
                      <th className="pb-3 px-2">Waist (cm)</th>
                      <th className="pb-3 px-2">Hips (cm)</th>
                      <th className="pb-3 px-2">Fitness Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logs.slice().reverse().map((log) => (
                      <tr key={log._id || log.date} className="hover:bg-slate-900/40">
                        <td className="py-3.5 px-2 font-medium text-white">{log.date}</td>
                        <td className="py-3.5 px-2 font-bold text-blue-400">{log.weight} kg</td>
                        <td className="py-3.5 px-2 text-slate-300">{log.chestSize || '—'}</td>
                        <td className="py-3.5 px-2 text-slate-300">{log.waistSize || '—'}</td>
                        <td className="py-3.5 px-2 text-slate-300">{log.hipSize || '—'}</td>
                        <td className="py-3.5 px-2 font-semibold text-violet-400">{log.fitnessScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Log Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Log Today's Measurement</h3>
            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Date</label>
                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Weight (kg) *</label>
                <input type="number" step="0.1" required value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="72.5"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Chest (cm)</label>
                  <input type="number" value={form.chestSize} onChange={e => setForm({ ...form, chestSize: e.target.value })} placeholder="100"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Waist (cm)</label>
                  <input type="number" value={form.waistSize} onChange={e => setForm({ ...form, waistSize: e.target.value })} placeholder="82"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 mb-1 uppercase">Hips (cm)</label>
                  <input type="number" value={form.hipSize} onChange={e => setForm({ ...form, hipSize: e.target.value })} placeholder="95"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 btn-gradient py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
