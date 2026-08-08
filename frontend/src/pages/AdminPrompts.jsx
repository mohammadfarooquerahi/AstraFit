import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  ArrowLeft, Loader2, Plus, Pencil, Trash2, Save, X,
  FileText, CheckCircle2, AlertCircle, Zap, ToggleLeft, ToggleRight
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
      setPrompts(data.data.prompts || []);
    } catch {
      setActionMsg('❌ Failed to load prompts.');
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
        setActionMsg('✅ Prompt updated successfully.');
      } else {
        await api.post('/api/admin/prompts', form);
        setActionMsg('✅ Prompt created successfully.');
      }
      setShowModal(false);
      load();
    } catch (err) {
      setActionMsg(`❌ ${err.response?.data?.message || 'Save failed.'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (p) => {
    await api.put(`/api/admin/prompts/${p._id}`, { ...p, isActive: !p.isActive });
    setActionMsg(`✅ Prompt ${!p.isActive ? 'activated' : 'deactivated'}.`);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;
    await api.delete(`/api/admin/prompts/${id}`);
    setActionMsg('✅ Prompt deleted.');
    load();
  };

  const FEATURE_COLOR = {
    diet_plan: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    workout_plan: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    chat_coach: 'text-pink-400 bg-pink-500/10 border-pink-500/30',
    progress_insight: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/dashboard')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <FileText className="w-5 h-5 text-indigo-400" />
          <h1 className="text-lg font-bold">Prompt Management</h1>
        </div>
        <button onClick={openCreate} className="btn-gradient text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-violet-500/20">
          <Plus className="w-4 h-4" /> New Prompt
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {actionMsg && (
          <div className="flex items-center justify-between mb-4 text-sm px-4 py-3 rounded-xl border bg-slate-900 border-slate-800 text-slate-300">
            {actionMsg}
            <button onClick={() => setActionMsg('')}><X className="w-4 h-4" /></button>
          </div>
        )}

        {loading
          ? <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-indigo-400" /></div>
          : (
            <div className="space-y-4">
              {prompts.length === 0 && (
                <div className="glass-panel border border-slate-800 rounded-2xl p-12 text-center">
                  <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No prompt templates yet. Click "New Prompt" to create one.</p>
                </div>
              )}

              {prompts.map(p => (
                <div key={p._id} className={`glass-panel border rounded-2xl p-5 transition-all ${p.isActive ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-lg uppercase tracking-wider ${FEATURE_COLOR[p.feature] || 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                        {p.feature?.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-white text-base">{p.name}</h3>
                      <span className="text-[10px] text-slate-500 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">v{p.version}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleToggle(p)} className="text-slate-400 hover:text-white transition-colors p-1.5">
                        {p.isActive ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-500" />}
                      </button>
                      <button onClick={() => openEdit(p)} className="text-slate-400 hover:text-violet-400 transition-colors p-1.5"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p._id)} className="text-slate-400 hover:text-red-400 transition-colors p-1.5"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <pre className="text-xs text-slate-400 bg-slate-900 rounded-xl p-4 whitespace-pre-wrap max-h-40 overflow-y-auto border border-slate-800">
                    {p.content}
                  </pre>

                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${p.isActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-500 bg-slate-800 border-slate-700'}`}>
                      {p.isActive ? '● Active' : '○ Inactive'}
                    </span>
                    <span className="text-[10px] text-slate-500">
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editTarget ? 'Edit Prompt Template' : 'Create New Prompt Template'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Prompt Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Diet Plan System Prompt"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Version</label>
                  <input value={form.version} onChange={e => setForm({ ...form, version: e.target.value })}
                    placeholder="1.0"
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Feature</label>
                <select value={form.feature} onChange={e => setForm({ ...form, feature: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500">
                  {FEATURE_OPTIONS.map(f => <option key={f} value={f}>{f.replace('_', ' ')}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Prompt Content (System Template)</label>
                <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })}
                  rows={8} placeholder="You are an expert AI fitness nutritionist. Generate a personalized 7-day diet plan..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-violet-500 resize-none" />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-400 uppercase">Status:</label>
                <button onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${form.isActive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-slate-400 bg-slate-800 border-slate-700'}`}>
                  {form.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {form.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm font-semibold transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.content}
                className="flex-1 btn-gradient py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editTarget ? 'Update Prompt' : 'Create Prompt'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
