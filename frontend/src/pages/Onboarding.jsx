import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  User, Target, Utensils, AlertTriangle, Dumbbell,
  Camera, ChevronRight, ChevronLeft, Check, Loader2
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Fitness Goal', icon: Target },
  { id: 3, title: 'Diet Preference', icon: Utensils },
  { id: 4, title: 'Allergies', icon: AlertTriangle },
  { id: 5, title: 'Workout Setup', icon: Dumbbell },
  { id: 6, title: 'Body Images', icon: Camera },
];

const GOALS = ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Maintenance', 'General Fitness'];
const DIETS = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Custom'];
const ALLERGIES = ['Peanuts', 'Milk', 'Egg', 'Seafood', 'Gluten', 'Soy'];
const ENVIRONMENTS = ['Home', 'Gym', 'Both'];
const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { value: 'lightly_active', label: 'Lightly Active', desc: '1-3 days/week' },
  { value: 'moderately_active', label: 'Moderately Active', desc: '3-5 days/week' },
  { value: 'very_active', label: 'Very Active', desc: '6-7 days/week' },
  { value: 'extra_active', label: 'Extra Active', desc: 'Very hard exercise daily' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    age: '', gender: '', height: '', weight: '',
    activityLevel: '', fitnessExperience: 'beginner',
    goal: '', dietaryPreference: '', allergies: [],
    workoutEnvironment: '',
    images: { front: null, back: null, left: null, right: null },
  });

  const toggleAllergy = (a) => {
    setForm(f => ({
      ...f,
      allergies: f.allergies.includes(a)
        ? f.allergies.filter(x => x !== a)
        : [...f.allergies, a],
    }));
  };

  const handleImageUpload = (view, file) => {
    setForm(f => ({ ...f, images: { ...f.images, [view]: file } }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/api/profile', {
        age: Number(form.age), gender: form.gender,
        height: Number(form.height), weight: Number(form.weight),
        activityLevel: form.activityLevel,
        fitnessExperience: form.fitnessExperience,
        goal: form.goal, dietaryPreference: form.dietaryPreference,
        allergies: form.allergies, workoutEnvironment: form.workoutEnvironment,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const CardOption = ({ value, label, desc, selected, onClick }) => (
    <button type="button" onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected
          ? 'border-violet-500 bg-violet-500/10 text-white'
          : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
      }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm">{label}</p>
          {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
        </div>
        {selected && <Check className="w-4 h-4 text-violet-400 shrink-0" />}
      </div>
    </button>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Age</label>
                <input type="number" min="13" max="99" value={form.age}
                  onChange={e => setForm({ ...form, age: e.target.value })}
                  placeholder="25"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Gender</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all">
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Height (cm)</label>
                <input type="number" value={form.height}
                  onChange={e => setForm({ ...form, height: e.target.value })}
                  placeholder="175"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Weight (kg)</label>
                <input type="number" value={form.weight}
                  onChange={e => setForm({ ...form, weight: e.target.value })}
                  placeholder="70"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Activity Level</label>
              <div className="space-y-2">
                {ACTIVITY_LEVELS.map(a => (
                  <CardOption key={a.value} value={a.value} label={a.label} desc={a.desc}
                    selected={form.activityLevel === a.value}
                    onClick={() => setForm({ ...form, activityLevel: a.value })} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Experience Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['beginner', 'intermediate', 'advanced'].map(e => (
                  <button key={e} type="button"
                    onClick={() => setForm({ ...form, fitnessExperience: e })}
                    className={`py-2.5 rounded-xl text-sm font-semibold capitalize border transition-all ${
                      form.fitnessExperience === e
                        ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                    }`}>{e}</button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-4">What is your primary fitness goal?</p>
            {GOALS.map(g => (
              <CardOption key={g} label={g} selected={form.goal === g}
                onClick={() => setForm({ ...form, goal: g })} />
            ))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-4">Select your dietary preference</p>
            {DIETS.map(d => (
              <CardOption key={d} label={d} selected={form.dietaryPreference === d}
                onClick={() => setForm({ ...form, dietaryPreference: d })} />
            ))}
          </div>
        );

      case 4:
        return (
          <div>
            <p className="text-sm text-slate-400 mb-4">Select any food allergies you have (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              {ALLERGIES.map(a => (
                <button key={a} type="button" onClick={() => toggleAllergy(a)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all ${
                    form.allergies.includes(a)
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700'
                  }`}>
                  {a}
                  {form.allergies.includes(a) && <Check className="w-4 h-4 text-violet-400" />}
                </button>
              ))}
            </div>
            {form.allergies.length === 0 && (
              <p className="text-xs text-slate-500 mt-4 text-center">No allergies selected — you can skip this step</p>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 mb-4">Where will you be working out?</p>
            {ENVIRONMENTS.map(e => (
              <CardOption key={e} label={e} selected={form.workoutEnvironment === e}
                onClick={() => setForm({ ...form, workoutEnvironment: e })} />
            ))}
          </div>
        );

      case 6:
        return (
          <div>
            <p className="text-sm text-slate-400 mb-1">Upload body photos for AI pose analysis</p>
            <p className="text-xs text-slate-500 mb-5">
              ⚠️ This is an approximate fitness-oriented estimation — not a medical diagnosis.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {['front', 'back', 'left', 'right'].map(view => (
                <label key={view} className={`relative flex flex-col items-center justify-center h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                  form.images[view]
                    ? 'border-violet-500 bg-violet-500/5'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-900/30'
                }`}>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => handleImageUpload(view, e.target.files[0])} />
                  {form.images[view] ? (
                    <>
                      <img src={URL.createObjectURL(form.images[view])}
                        alt={view} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-60" />
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <Check className="w-6 h-6 text-violet-400" />
                        <span className="text-xs text-violet-300 font-semibold capitalize">{view} ✓</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-7 h-7 text-slate-500 mb-2" />
                      <span className="text-xs text-slate-400 font-semibold capitalize">{view} view</span>
                      <span className="text-[10px] text-slate-500">Tap to upload</span>
                    </>
                  )}
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">You can skip this step and upload later</p>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (step === 1) return form.age && form.gender && form.height && form.weight && form.activityLevel;
    if (step === 2) return form.goal;
    if (step === 3) return form.dietaryPreference;
    if (step === 4) return true;
    if (step === 5) return form.workoutEnvironment;
    if (step === 6) return true;
    return false;
  };

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white">Set Up Your Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Step {step} of {STEPS.length} — {currentStep.title}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.map((s) => (
            <div key={s.id} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              s.id <= step ? 'bg-violet-500' : 'bg-slate-800'
            }`} />
          ))}
        </div>

        {/* Card */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          {/* Step Icon + Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <StepIcon className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-lg font-bold text-white">{currentStep.title}</h2>
          </div>

          {/* Step Content */}
          {renderStep()}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-xl mt-4">
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            <button onClick={() => step > 1 && setStep(s => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 border border-slate-800 hover:bg-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length ? (
              <button onClick={() => canProceed() && setStep(s => s + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 btn-gradient px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 transition-all">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 btn-gradient px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 shadow-lg shadow-violet-500/20">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Complete Setup</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
