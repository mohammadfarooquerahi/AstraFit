import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  ArrowLeft, Loader2, Plus, Pencil, Trash2, Save, X,
  FileText, ToggleLeft, ToggleRight
} from 'lucide-react';

const FEATURE_OPTIONS = ['diet_plan', 'workout_plan', 'chat_coach', 'progress_insight'];

export default function AdminPrompts() {
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const [form, setForm] = useState({
    name: '', feature: 'diet_plan', version: '1.0', content: '', isActive: true
  });

  const load = async () => {
    try {
      const { data } = await api.get('/api/admin/prompts');
      setPrompts(data?.data?.prompts || []);
    } catch {
      setActionMsg('Failed to load prompts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: '', feature: 'diet_plan', version: '1.0', content: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({ name: p.name, feature: p.feature, version: p.version, content: p.content, isActive: p.isActive });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/api/admin/prompts/${editTarget._id}`, form);
        setActionMsg('Prompt updated successfully.');
      } else {
        await api.post('/api/admin/prompts', form);
        setActionMsg('Prompt created successfully.');
      }
      setShowModal(false);
      load();
    } catch (err) {
      setActionMsg(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (p) => {
    await api.put(`/api/admin/prompts/${p._id}`, { ...p, isActive: !p.isActive });
    setActionMsg(`Prompt ${!p.isActive ? 'activated' : 'deactivated'}.`);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this prompt template?')) return;
    await api.delete(`/api/admin/prompts/${id}`);
    setActionMsg('Prompt deleted successfully.');
    load();
  };

  const FEATURE_COLOR = {
    diet_plan: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    workout_plan: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    chat_coach: 'text-purple-700 bg-purple-50 border-purple-200',
    progress_insight: 'text-blue-700 bg-blue-50 border-blue-200',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">AI Prompt Templates</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Manage generation guidelines & persona instructions</p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Prompt</span>
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        {actionMsg && (
          <div className="flex items-center justify-between mb-4 text-xs font-medium px-4 py-2.5 rounded-xl border bg-white border-slate-200 text-slate-800 shadow-xs">
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg('')} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {prompts.length === 0 && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-sm">
                <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 text-xs">No prompt templates created yet. Click "New Prompt" to add one.</p>
              </div>
            )}

            {prompts.map(p => (
              <div
                key={p._id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                  p.isActive ? 'border-slate-200' : 'border-slate-200/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      FEATURE_COLOR[p.feature] || 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}>
                      {p.feature?.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                    <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono">
                      v{p.version}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggle(p)}
                      className="text-slate-500 hover:text-slate-800 transition-colors p-1"
                      title={p.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {p.isActive ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p._id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <pre className="text-xs text-slate-700 bg-slate-50 rounded-xl p-3.5 whitespace-pre-wrap max-h-40 overflow-y-auto border border-slate-200 font-mono leading-relaxed custom-scrollbar">
                  {p.content}
                </pre>

                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                    p.isActive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'
                  }`}>
                    {p.isActive ? '● Active' : '○ Inactive'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Created: {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-2xl w-full shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-900">{editTarget ? 'Edit Prompt Template' : 'Create New Prompt Template'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Prompt Name</label>
                  <input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Diet Plan System Prompt"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Version</label>
                  <input
                    value={form.version}
                    onChange={e => setForm({ ...form, version: e.target.value })}
                    placeholder="1.0"
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Feature</label>
                <select
                  value={form.feature}
                  onChange={e => setForm({ ...form, feature: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 shadow-sm"
                >
                  {FEATURE_OPTIONS.map(f => (
                    <option key={f} value={f}>{f.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Prompt Template Content</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  placeholder="System guidance, constraints, and tone of voice for the AI agent..."
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-indigo-600 shadow-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Status:</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    form.isActive ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-slate-500 bg-slate-100 border-slate-200'
                  }`}
                >
                  {form.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                  <span>{form.isActive ? 'Active' : 'Inactive'}</span>
                </button>
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
                type="button"
                onClick={handleSave}
                disabled={saving || !form.name || !form.content}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{editTarget ? 'Update Template' : 'Create Template'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
