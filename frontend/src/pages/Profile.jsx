import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  ArrowLeft, User, Mail, Target, Activity, Ruler,
  Save, Loader2, CheckCircle2, Edit3
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
      setError(err.response?.data?.message || 'Failed to save profile changes.');
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
            <h1 className="text-base font-bold text-slate-900">My Profile & Health Stats</h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Changes saved
            </span>
          )}
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 text-xs font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        )}

        {error && (
          <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl mb-6">{error}</div>
        )}

        {!loading && (
          <div className="space-y-6">
            {/* User Identity Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5">
                    <span className={`text-[10px] font-semibold border px-2.5 py-0.5 rounded-full ${
                      user?.role === 'admin'
                        ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                        : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}>
                      {user?.role === 'admin' ? '👑 Admin' : '🏃 Active Athlete'}
                    </span>
                    {form.goal && (
                      <span className="text-[10px] font-semibold border text-slate-700 bg-slate-50 border-slate-200 px-2.5 py-0.5 rounded-full">
                        <Target className="w-2.5 h-2.5 inline mr-1 text-slate-500" />
                        {form.goal}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BMI Summary Card */}
            {bmi && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Body Mass Index (BMI)</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {bmi} <span className="text-xs font-normal text-slate-400">kg/m²</span>
                  </p>
                  <p className="text-xs font-semibold mt-0.5 text-emerald-600">
                    {bmiCategory}
                  </p>
                </div>
                <div className="text-xs text-slate-500 text-right space-y-0.5">
                  <p>Height: <span className="text-slate-800 font-bold">{form.height} cm</span></p>
                  <p>Weight: <span className="text-slate-800 font-bold">{form.weight} kg</span></p>
                  <p className="text-[10px] text-slate-400">Calculated from user health stats</p>
                </div>
              </div>
            )}

            {/* Body Measurements */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-indigo-600" /> Body Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Age', key: 'age', unit: 'years', type: 'number' },
                  { label: 'Height', key: 'height', unit: 'cm', type: 'number' },
                  { label: 'Current Weight', key: 'weight', unit: 'kg', type: 'number' },
                  { label: 'Target Weight', key: 'targetWeight', unit: 'kg', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">{f.label} ({f.unit})</label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      disabled={!editMode}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500 shadow-sm"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Gender</label>
                  <select
                    value={form.gender}
                    disabled={!editMode}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500 shadow-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fitness Preferences */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" /> Fitness & Dietary Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Primary Goal</label>
                  <select
                    value={form.goal}
                    disabled={!editMode}
                    onChange={e => setForm({ ...form, goal: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-500 shadow-sm"
                  >
                    {GOALS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Dietary Preference</label>
                  <select
                    value={form.dietaryPreference}
                    disabled={!editMode}
                    onChange={e => setForm({ ...form, dietaryPreference: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-500 shadow-sm"
                  >
                    {DIET_PREFS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Activity Level</label>
                  <select
                    value={form.activityLevel}
                    disabled={!editMode}
                    onChange={e => setForm({ ...form, activityLevel: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-500 shadow-sm"
                  >
                    {ACTIVITY_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider">Experience Level</label>
                  <select
                    value={form.fitnessExperience}
                    disabled={!editMode}
                    onChange={e => setForm({ ...form, fitnessExperience: e.target.value })}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-500 shadow-sm"
                  >
                    {EXPERIENCE_LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Allergies */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Allergies & Food Restrictions</h3>
              <div className="flex flex-wrap gap-2">
                {['Peanuts', 'Milk', 'Egg', 'Seafood', 'Gluten', 'Soy'].map(a => (
                  <button
                    key={a}
                    disabled={!editMode}
                    onClick={() => {
                      const updated = form.allergies.includes(a)
                        ? form.allergies.filter(x => x !== a)
                        : [...form.allergies, a];
                      setForm({ ...form, allergies: updated });
                    }}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all ${
                      form.allergies.includes(a)
                        ? 'bg-rose-50 border-rose-200 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    } disabled:cursor-default`}
                  >
                    {form.allergies.includes(a) ? '✕ ' : '+ '}{a}
                  </button>
                ))}
              </div>
              {form.allergies.length === 0 && <p className="text-xs text-slate-400 mt-2">No food allergies selected</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
