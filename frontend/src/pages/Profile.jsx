import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  ArrowLeft, User, Mail, Target, Activity, Ruler, Scale,
  Save, Loader2, CheckCircle2, Edit3, Flame, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const GOALS = ['Weight Loss', 'Muscle Building', 'Weight Gain', 'Maintenance', 'General Fitness'];
const DIET_PREFS = ['Non-Vegetarian', 'Vegetarian', 'Vegan', 'Custom'];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const ACTIVITY_LEVELS = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Athlete'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    age: '', height: '', weight: '', gender: 'male',
    goal: 'Muscle Building', dietaryPreference: 'Non-Vegetarian',
    activityLevel: 'Moderately Active', fitnessExperience: 'Intermediate',
    allergies: [], targetWeight: '', bio: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/api/profile');
        const p = data.data.profile;
        if (p) {
          setProfile(p);
          setForm({
            age: p.age || '',
            height: p.height || '',
            weight: p.weight || '',
            gender: p.gender || 'male',
            goal: p.goal || 'Muscle Building',
            dietaryPreference: p.dietaryPreference || 'Non-Vegetarian',
            activityLevel: p.activityLevel || 'Moderately Active',
            fitnessExperience: p.fitnessExperience || 'Intermediate',
            allergies: p.allergies || [],
            targetWeight: p.targetWeight || '',
            bio: p.bio || '',
          });
        }
      } catch (err) {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put('/api/profile', form);
      setSaved(true);
      setEditMode(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const bmi = form.height && form.weight
    ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1)
    : null;
  const bmiCategory = bmi
    ? bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal Weight' : bmi < 30 ? 'Overweight' : 'Obese'
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-violet-400" />
            <h1 className="text-lg font-bold">My Profile</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
          {!editMode
            ? <button onClick={() => setEditMode(true)} className="flex items-center gap-2 text-sm font-semibold border border-violet-500/30 text-violet-400 bg-violet-500/10 px-4 py-2 rounded-xl hover:bg-violet-500/20 transition-all">
                <Edit3 className="w-3.5 h-3.5" /> Edit Profile
              </button>
            : <button onClick={handleSave} disabled={saving} className="btn-gradient text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-violet-500/20">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
          }
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          </div>
        )}

        {error && (
          <div className="text-sm text-red-300 bg-red-950/40 border border-red-800/50 px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        {!loading && (
          <div className="space-y-6">
            {/* User Identity Card */}
            <div className="glass-panel border border-slate-800 rounded-3xl p-6 bg-gradient-to-br from-violet-950/20 via-slate-900 to-slate-900">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-violet-500/20">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">{user?.name}</h2>
                  <div className="flex items-center gap-1.5 text-slate-400 text-sm mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-[10px] font-bold border px-2.5 py-1 rounded-full ${user?.role === 'admin' ? 'text-violet-400 bg-violet-500/10 border-violet-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'}`}>
                      {user?.role === 'admin' ? '👑 Admin' : '🏃 Active Member'}
                    </span>
                    {form.goal && (
                      <span className="text-[10px] font-bold border text-indigo-400 bg-indigo-500/10 border-indigo-500/30 px-2.5 py-1 rounded-full">
                        <Target className="w-2.5 h-2.5 inline mr-1" />{form.goal}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BMI Card */}
            {bmi && (
              <div className="glass-panel border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Body Mass Index (BMI)</p>
                  <p className="text-3xl font-black text-white mt-1">{bmi} <span className="text-sm font-normal text-slate-400">kg/m²</span></p>
                  <p className={`text-xs font-bold mt-0.5 ${bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-emerald-400' : bmi < 30 ? 'text-amber-400' : 'text-red-400'}`}>
                    {bmiCategory}
                  </p>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  <p>Height: <span className="text-white font-bold">{form.height} cm</span></p>
                  <p>Weight: <span className="text-white font-bold">{form.weight} kg</span></p>
                  <p className="text-[10px] mt-1 text-slate-600">Calculated from user data</p>
                </div>
              </div>
            )}

            {/* Body Measurements */}
            <div className="glass-panel border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2"><Ruler className="w-4 h-4 text-blue-400" /> Body Measurements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Age', key: 'age', unit: 'years', type: 'number' },
                  { label: 'Height', key: 'height', unit: 'cm', type: 'number' },
                  { label: 'Current Weight', key: 'weight', unit: 'kg', type: 'number' },
                  { label: 'Target Weight', key: 'targetWeight', unit: 'kg', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">{f.label} ({f.unit})</label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      disabled={!editMode}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Gender</label>
                  <select value={form.gender} disabled={!editMode} onChange={e => setForm({ ...form, gender: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fitness Preferences */}
            <div className="glass-panel border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2"><Activity className="w-4 h-4 text-violet-400" /> Fitness Preferences</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Fitness Goal</label>
                  <select value={form.goal} disabled={!editMode} onChange={e => setForm({ ...form, goal: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50">
                    {GOALS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Diet Preference</label>
                  <select value={form.dietaryPreference} disabled={!editMode} onChange={e => setForm({ ...form, dietaryPreference: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50">
                    {DIET_PREFS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Activity Level</label>
                  <select value={form.activityLevel} disabled={!editMode} onChange={e => setForm({ ...form, activityLevel: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50">
                    {ACTIVITY_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Experience Level</label>
                  <select value={form.fitnessExperience} disabled={!editMode} onChange={e => setForm({ ...form, fitnessExperience: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 disabled:opacity-50">
                    {EXPERIENCE_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className="glass-panel border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-white mb-4">🚫 Allergies & Dietary Restrictions</h3>
              <div className="flex flex-wrap gap-2">
                {['Peanuts', 'Milk', 'Egg', 'Seafood', 'Gluten', 'Soy'].map(a => (
                  <button key={a} disabled={!editMode}
                    onClick={() => {
                      const updated = form.allergies.includes(a)
                        ? form.allergies.filter(x => x !== a)
                        : [...form.allergies, a];
                      setForm({ ...form, allergies: updated });
                    }}
                    className={`text-xs font-bold px-4 py-2 rounded-xl border transition-all ${
                      form.allergies.includes(a)
                        ? 'bg-red-500/10 border-red-500/30 text-red-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    } disabled:cursor-default`}>
                    {form.allergies.includes(a) ? '✕ ' : '+ '}{a}
                  </button>
                ))}
              </div>
              {form.allergies.length === 0 && <p className="text-xs text-slate-500 mt-2">No allergies selected</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
