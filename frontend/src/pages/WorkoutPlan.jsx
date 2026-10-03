import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Dumbbell, Zap, Clock, RefreshCw, ArrowLeft, Loader2,
  AlertCircle, Shield, Check, Info, Flame,
  Activity, Play, CheckCircle2
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ExerciseCard({ exercise, completed, onToggle }) {
  return (
    <div
      className={`border rounded-2xl p-4 sm:p-5 transition-all duration-200 ${
        completed
          ? 'border-emerald-200 bg-emerald-50/40 shadow-sm'
          : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onToggle}
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
              completed
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                : 'border-slate-300 hover:border-slate-400 text-transparent bg-white'
            }`}
            aria-label="Toggle exercise complete"
          >
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
          <div>
            <h4 className={`font-bold text-sm sm:text-base leading-snug transition-all ${completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
              {exercise.name}
            </h4>
            {exercise.muscleGroup && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block mt-1 uppercase tracking-wider ${
                completed ? 'text-slate-400 bg-slate-100' : 'text-indigo-700 bg-indigo-50 border border-indigo-100'
              }`}>
                {exercise.muscleGroup}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
            completed ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            {exercise.sets} Sets
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
            completed ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
          }`}>
            {exercise.reps} Reps
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 mt-3">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className={completed ? 'text-slate-400' : 'text-slate-600'}>Rest: {exercise.restSeconds || 60}s</span>
        </div>
        {exercise.tips && (
          <p className={`text-xs italic text-right max-w-[200px] sm:max-w-xs truncate ${completed ? 'text-slate-400' : 'text-slate-500'}`}>
            💡 {exercise.tips}
          </p>
        )}
      </div>
    </div>
  );
}

export default function WorkoutPlan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [completedList, setCompletedList] = useState({});

  const fetchPlan = async () => {
    try {
      const { data } = await api.get('/api/workout');
      setPlan(data.data.workoutPlan);
      setProfile(data.data.profile);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(err.response?.data?.data?.profile || null);
      } else {
        setError('Failed to load workout plan.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlan(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await api.post('/api/workout/generate');
      setPlan(data.data.workoutPlan);
      setProfile(data.data.profile);
      setCompletedList({});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate workout plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleExercise = (dayIdx, exIdx) => {
    const key = `${dayIdx}-${exIdx}`;
    setCompletedList(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const currentDay = plan?.schedule?.[activeDay] || plan?.schedule?.find(s => s.day === DAYS[activeDay]);

  const dayExercisesCount = currentDay?.exercises?.length || 0;
  const dayCompletedCount = currentDay?.exercises?.reduce((acc, _, idx) => {
    return acc + (completedList[`${activeDay}-${idx}`] ? 1 : 0);
  }, 0) || 0;
  const dayProgressPct = dayExercisesCount ? Math.round((dayCompletedCount / dayExercisesCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
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
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">Training Program</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Personalized splits & tracking</p>
            </div>
          </div>
        </div>

        {plan && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${generating ? 'animate-spin' : ''}`} />
            <span>Regenerate Routine</span>
          </button>
        )}
      </header>

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 flex-1 space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading training schedule...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-2xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !plan && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-200/90 rounded-2xl p-8 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Build Your Training Routine</h2>
            <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
              AstraFit will construct a personalized 7-day training schedule optimized for your goal, experience level, and setup environment.
            </p>
            {profile?.workoutEnvironment && (
              <div className="mb-6 inline-flex items-center gap-2 text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl">
                <Play className="w-3.5 h-3.5 text-indigo-600" />
                <span>Target Setup: <span className="font-semibold capitalize">{profile.workoutEnvironment} Training</span></span>
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                  <span>Structuring Splits...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Generate Workout Routine</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Plan Display */}
        {!loading && plan && (
          <div className="space-y-6">
            {/* Header Details Card */}
            <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Split Routine</span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">{plan.title}</h2>
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-0.5 rounded-md font-semibold">
                    🏋️ {plan.splitType}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-md font-medium capitalize">
                    Experience: {profile?.fitnessExperience || plan.difficulty}
                  </span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-md font-medium capitalize">
                    Setup: {profile?.workoutEnvironment || 'hybrid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Objective Summary */}
            {plan.summary && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-0.5">Program Overview</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{plan.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 custom-scrollbar scrollbar-hide">
              {DAYS.map((day, i) => {
                const dayData = plan.schedule?.find(s => s.day === day) || plan.schedule?.[i];
                const isRest = dayData?.isRestDay;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(i)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeDay === i
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }`}
                  >
                    <span>{day}</span>
                    {isRest && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        activeDay === i ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                      }`}>
                        Rest
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Day Routine Content */}
            {currentDay && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{currentDay.day} Focus</p>
                    <h3 className="text-base font-bold text-slate-900">{currentDay.focus}</h3>
                  </div>

                  {!currentDay.isRestDay && currentDay.exercises?.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Daily Progress</p>
                        <p className="text-xs font-bold text-slate-900">{dayCompletedCount} of {dayExercisesCount} completed</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-indigo-700">
                        {dayProgressPct}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Exercises or Rest Day */}
                {currentDay.isRestDay || currentDay.exercises?.length === 0 ? (
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-8 text-center shadow-sm">
                    <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-indigo-600">
                      <Shield className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mb-1">Rest & Muscle Recovery</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Rest days allow muscle tissue to repair and rebuild stronger. Focus on hydration, quality nutrition, light stretching, and adequate sleep.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentDay.exercises.map((exercise, index) => (
                      <ExerciseCard
                        key={index}
                        exercise={exercise}
                        completed={!!completedList[`${activeDay}-${index}`]}
                        onToggle={() => handleToggleExercise(activeDay, index)}
                      />
                    ))}
                  </div>
                )}

                {/* Warmup & Cooldown Tips */}
                {!currentDay.isRestDay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {plan.warmupTips && (
                      <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                          <Activity className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-0.5">Dynamic Warmup</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{plan.warmupTips}</p>
                        </div>
                      </div>
                    )}
                    {plan.cooldownTips && (
                      <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-600">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-0.5">Cooldown & Mobility</p>
                          <p className="text-xs text-slate-500 leading-relaxed">{plan.cooldownTips}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
