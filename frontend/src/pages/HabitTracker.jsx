import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Flame, Droplets, Utensils, Dumbbell, Moon, Footprints,
  CheckCircle2, Plus, Minus, ArrowLeft, Loader2, AlertCircle
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
      setHabit(data?.data?.habit);
      setStreak(data?.data?.streak || 0);
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
      setHabit(data?.data?.habit);
      setStreak(data?.data?.streak || 0);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      setError('Failed to update habit.');
    } finally {
      setSaving(false);
    }
  };

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
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">Daily Habits & Consistency</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Track daily routines that build results</p>
            </div>
          </div>
        </div>

        {/* Streak Counter Badge */}
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-full font-bold text-xs shadow-xs">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{streak}-Day Active Streak</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading daily habits...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {!loading && habit && (
          <>
            {/* Completion Banner */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 mb-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Daily Target</span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                    {progressPct}% <span className="text-sm font-normal text-slate-500">Completed</span>
                  </h2>
                </div>
                {savedSuccess && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved!
                  </span>
                )}
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
                <div
                  className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Habit Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Meals Logged */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Utensils className="w-3.5 h-3.5" />
                    </div>
                    <span>Meals Logged</span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{habit.mealsTracked} / {habit.mealsTarget} meals</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => handleUpdate({ mealsTracked: Math.max(0, habit.mealsTracked - 1) })}
                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center font-bold text-2xl text-slate-900">
                    {habit.mealsTracked}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ mealsTracked: Math.min(6, habit.mealsTracked + 1) })}
                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 2. Hydration */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
                      <Droplets className="w-3.5 h-3.5" />
                    </div>
                    <span>Water Intake</span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{habit.waterIntake} / {habit.waterTarget} ml</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleUpdate({ waterIntake: habit.waterIntake + 250 })}
                    className="flex-1 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 font-semibold text-xs transition-all"
                  >
                    +250 ml
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ waterIntake: habit.waterIntake + 500 })}
                    className="flex-1 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100 font-semibold text-xs transition-all"
                  >
                    +500 ml
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate({ waterIntake: 0 })}
                    className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* 3. Workout Completed */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                    <span>Daily Workout</span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{habit.workoutCompleted ? 'Finished ✓' : 'Pending'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdate({ workoutCompleted: !habit.workoutCompleted })}
                  className={`w-full mt-3 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all border ${
                    habit.workoutCompleted
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${habit.workoutCompleted ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{habit.workoutCompleted ? 'Workout Marked Complete' : 'Mark Workout Complete'}</span>
                </button>
              </div>

              {/* 4. Sleep Duration */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                      <Moon className="w-3.5 h-3.5" />
                    </div>
                    <span>Sleep & Recovery</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900">{habit.sleepHours} hrs</span>
                </div>
                <input
                  type="range" min="0" max="12" step="0.5" value={habit.sleepHours || 0}
                  onChange={e => handleUpdate({ sleepHours: Number(e.target.value) })}
                  className="w-full accent-indigo-600 bg-slate-100 h-2 rounded-lg cursor-pointer mt-4"
                  aria-label="Sleep hours slider"
                />
              </div>

              {/* 5. Daily Steps */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                      <Footprints className="w-3.5 h-3.5" />
                    </div>
                    <span>Daily Steps</span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{habit.stepsCount} / {habit.stepsTarget} steps</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="range" min="0" max="20000" step="500" value={habit.stepsCount || 0}
                    onChange={e => handleUpdate({ stepsCount: Number(e.target.value) })}
                    className="flex-1 accent-indigo-600 bg-slate-100 h-2 rounded-lg cursor-pointer"
                    aria-label="Steps count slider"
                  />
                  <span className="font-bold text-sm text-slate-900 w-24 text-right">{habit.stepsCount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
