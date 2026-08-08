import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Flame, Droplets, Utensils, Dumbbell, Moon, Footprints,
  CheckCircle2, Plus, Minus, ArrowLeft, Loader2, AlertCircle, Save
} from 'lucide-react';

export default function HabitTracker() {
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchHabits = async () => {
    try {
      const { data } = await api.get('/api/habits');
      setHabit(data.data.habit);
      setStreak(data.data.streak || 0);
    } catch (err) {
      setError('Failed to load habit tracker data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHabits(); }, []);

  const handleUpdate = async (updates) => {
    const newHabit = { ...habit, ...updates };
    setHabit(newHabit);
    setSaving(true);
    setSavedSuccess(false);

    try {
      const { data } = await api.put('/api/habits', updates);
      setHabit(data.data.habit);
      setStreak(data.data.streak || 0);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      setError('Failed to update habit.');
    } finally {
      setSaving(false);
    }
  };

  // Calculate completion percentage
  const calcProgress = () => {
    if (!habit) return 0;
    let score = 0;
    if (habit.mealsTracked >= habit.mealsTarget) score += 25;
    else score += (habit.mealsTracked / habit.mealsTarget) * 25;

    if (habit.waterIntake >= habit.waterTarget) score += 25;
    else score += (habit.waterIntake / habit.waterTarget) * 25;

    if (habit.workoutCompleted) score += 25;

    if (habit.stepsCount >= habit.stepsTarget) score += 25;
    else score += (habit.stepsCount / habit.stepsTarget) * 25;

    return Math.min(Math.round(score), 100);
  };

  const progressPct = calcProgress();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold">Daily Habit Tracker</h1>
          </div>
        </div>

        {/* Streak Counter Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-400 font-bold text-xs">
          <Flame className="w-4 h-4 fill-amber-500" />
          <span>{streak}-Day Active Streak</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading daily habits...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {!loading && habit && (
          <>
            {/* Completion Banner */}
            <div className="glass-panel border border-slate-800 rounded-3xl p-6 mb-8 bg-gradient-to-r from-amber-950/20 via-slate-900 to-indigo-950/20">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Goal Progress</span>
                  <h2 className="text-3xl font-black text-white mt-1">{progressPct}% <span className="text-sm font-normal text-slate-400">Completed</span></h2>
                </div>
                {savedSuccess && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> Saved!
                  </span>
                )}
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-gradient-to-r from-amber-500 to-violet-500 transition-all duration-500" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Habit Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Meals Logged */}
              <div className="glass-panel border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Utensils className="w-4 h-4" /> Meals Logged
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{habit.mealsTracked} / {habit.mealsTarget} meals</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button onClick={() => handleUpdate({ mealsTracked: Math.max(0, habit.mealsTracked - 1) })}
                    className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-300">
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center font-black text-2xl text-white">
                    {habit.mealsTracked}
                  </div>
                  <button onClick={() => handleUpdate({ mealsTracked: Math.min(6, habit.mealsTracked + 1) })}
                    className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-300">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. Hydration */}
              <div className="glass-panel border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                    <Droplets className="w-4 h-4" /> Water Intake
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{habit.waterIntake} / {habit.waterTarget} ml</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button onClick={() => handleUpdate({ waterIntake: habit.waterIntake + 250 })}
                    className="flex-1 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 hover:bg-sky-500/20 font-semibold text-xs transition-all">
                    +250 ml 🥤
                  </button>
                  <button onClick={() => handleUpdate({ waterIntake: habit.waterIntake + 500 })}
                    className="flex-1 py-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 hover:bg-sky-500/20 font-semibold text-xs transition-all">
                    +500 ml 💧
                  </button>
                  <button onClick={() => handleUpdate({ waterIntake: 0 })}
                    className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-semibold">
                    Reset
                  </button>
                </div>
              </div>

              {/* 3. Workout Completed */}
              <div className="glass-panel border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-violet-400 font-bold text-sm">
                    <Dumbbell className="w-4 h-4" /> Daily Workout
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{habit.workoutCompleted ? 'Completed ✓' : 'Pending'}</span>
                </div>
                <button onClick={() => handleUpdate({ workoutCompleted: !habit.workoutCompleted })}
                  className={`w-full mt-3 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border ${
                    habit.workoutCompleted
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}>
                  <CheckCircle2 className={`w-5 h-5 ${habit.workoutCompleted ? 'text-emerald-400' : 'text-slate-600'}`} />
                  {habit.workoutCompleted ? 'Workout Marked Completed!' : 'Mark Workout Finished'}
                </button>
              </div>

              {/* 4. Sleep Duration */}
              <div className="glass-panel border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <Moon className="w-4 h-4" /> Sleep Duration
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{habit.sleepHours} hrs</span>
                </div>
                <input type="range" min="0" max="12" step="0.5" value={habit.sleepHours || 0}
                  onChange={e => handleUpdate({ sleepHours: Number(e.target.value) })}
                  className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg cursor-pointer mt-4" />
              </div>

              {/* 5. Daily Steps */}
              <div className="glass-panel border border-slate-800 rounded-2xl p-5 md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Footprints className="w-4 h-4" /> Daily Steps Count
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{habit.stepsCount} / {habit.stepsTarget} steps</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <input type="range" min="0" max="20000" step="500" value={habit.stepsCount || 0}
                    onChange={e => handleUpdate({ stepsCount: Number(e.target.value) })}
                    className="flex-1 accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer" />
                  <span className="font-bold text-sm text-white w-20 text-right">{habit.stepsCount}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
