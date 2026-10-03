import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import {
  TrendingUp, Scale, Award, Plus, ArrowLeft,
  Loader2, AlertCircle, Activity
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
      setLogs(data?.data?.logs || []);
      setStats(data?.data?.stats || {});
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
    date: l.date?.slice(5) || l.date, // MM-DD
    weight: Number(l.weight),
    score: l.fitnessScore,
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">Progress & Metrics</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Weight, girth and fitness score trends</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Log Weigh-In</span>
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading your fitness trends...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Current Weight</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {stats.currentWeight || '—'} <span className="text-xs font-normal text-slate-400">kg</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Starting weight: {stats.startWeight || '—'} kg</p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Net Weight Change</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className={`text-2xl sm:text-3xl font-bold ${Number(stats.weightChange) <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {Number(stats.weightChange) > 0 ? `+${stats.weightChange}` : stats.weightChange || '0'} <span className="text-xs font-normal text-slate-400">kg</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Recorded across {stats.logCount || 0} entries</p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Fitness Score</span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-indigo-600">
                  {stats.fitnessScore || 70} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Calculated consistency rating</p>
              </div>
            </div>

            {/* Recharts Weight Trend Chart */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Weight Progression (kg)</h3>
                  <p className="text-xs text-slate-500">Historical weigh-in curve</p>
                </div>
              </div>

              {chartData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="weightGradLight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '0.75rem',
                          color: '#0f172a',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="weight"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#weightGradLight)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-slate-400 text-xs text-center py-12">No progress data logged yet. Click "Log Weigh-In" to record your first entry!</p>
              )}
            </div>

            {/* History Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Measurement History</h3>
                <span className="text-xs text-slate-500">{logs.length} logs recorded</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Weight (kg)</th>
                      <th className="py-3 px-4">Chest (cm)</th>
                      <th className="py-3 px-4">Waist (cm)</th>
                      <th className="py-3 px-4">Hips (cm)</th>
                      <th className="py-3 px-4">Fitness Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-slate-400">No logs recorded yet.</td>
                      </tr>
                    ) : (
                      logs.slice().reverse().map((log) => (
                        <tr key={log._id || log.date} className="hover:bg-slate-50/80 transition-colors text-xs">
                          <td className="py-3 px-4 font-medium text-slate-900">{log.date}</td>
                          <td className="py-3 px-4 font-bold text-indigo-700">{log.weight} kg</td>
                          <td className="py-3 px-4 text-slate-600">{log.chestSize || '—'}</td>
                          <td className="py-3 px-4 text-slate-600">{log.waistSize || '—'}</td>
                          <td className="py-3 px-4 text-slate-600">{log.hipSize || '—'}</td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{log.fitnessScore}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Log Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Record Daily Measurement</h3>
            <p className="text-xs text-slate-500 mb-5">Keep track of body composition metrics</p>

            <form onSubmit={handleAddLog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={form.weight}
                  onChange={e => setForm({ ...form, weight: e.target.value })}
                  placeholder="e.g. 72.5"
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-1 uppercase">Chest (cm)</label>
                  <input
                    type="number"
                    value={form.chestSize}
                    onChange={e => setForm({ ...form, chestSize: e.target.value })}
                    placeholder="100"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-1 uppercase">Waist (cm)</label>
                  <input
                    type="number"
                    value={form.waistSize}
                    onChange={e => setForm({ ...form, waistSize: e.target.value })}
                    placeholder="82"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700 mb-1 uppercase">Hips (cm)</label>
                  <input
                    type="number"
                    value={form.hipSize}
                    onChange={e => setForm({ ...form, hipSize: e.target.value })}
                    placeholder="95"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-600 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
