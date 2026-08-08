import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Dumbbell, Zap, Clock, RefreshCw, ArrowLeft, Loader2,
  AlertCircle, Flame, Shield, CheckCircle2, ChevronRight, Play
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ExerciseCard({ exercise, index }) {
  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl p-4 sm:p-5 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold text-xs flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div>
            <h4 className="font-bold text-white text-base leading-snug">{exercise.name}</h4>
            {exercise.muscleGroup && (
              <span className="text-[11px] text-violet-400 font-semibold bg-violet-500/10 px-2 py-0.5 rounded-md inline-block mt-1">
                {exercise.muscleGroup}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
            {exercise.sets} Sets
          </span>
          <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
            {exercise.reps} Reps
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/60 mt-3">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Rest: {exercise.restSeconds || 60}s</span>
        </div>
        {exercise.tips && (
          <p className="text-xs text-slate-400 italic text-right max-w-xs truncate">
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
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchPlan = async () => {
    try {
      const { data } = await api.get('/api/workout');
      setPlan(data.data.workoutPlan);
    } catch (err) {
      if (err.response?.status !== 404) setError('Failed to load workout plan.');
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate workout plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const currentDay = plan?.schedule?.[activeDay] || plan?.schedule?.find(s => s.day === DAYS[activeDay]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-violet-400" />
          <h1 className="text-lg font-bold">AI Workout Plan</h1>
        </div>
        {plan && (
          <button onClick={handleGenerate} disabled={generating}
            className="ml-auto flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 px-3 py-1.5 rounded-lg transition-all">
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            Regenerate
          </button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading your workout schedule...</p>
          </div>
        )}

        {/* Error notice */}
        {error && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* No plan exists yet */}
        {!loading && !plan && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-3xl flex items-center justify-center mb-6">
              <Dumbbell className="w-9 h-9 text-violet-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Generate Your Training Split</h2>
            <p className="text-slate-400 text-sm max-w-sm mb-8">
              Our AI creates a custom 7-day training routine based on your fitness goals, experience level, and equipment environment.
            </p>
            <button onClick={handleGenerate} disabled={generating}
              className="btn-gradient px-8 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-violet-500/20">
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating... (takes ~15 sec)</>
                : <><Zap className="w-4 h-4" /> Generate Workout Plan</>
              }
            </button>
          </div>
        )}

        {/* Plan loaded */}
        {!loading && plan && (
          <>
            {/* Header Title & Split Banner */}
            <div className="glass-panel border border-slate-800 rounded-3xl p-6 mb-8 bg-gradient-to-r from-violet-950/30 via-slate-900 to-indigo-950/20">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div>
                  <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                    {plan.splitType}
                  </span>
                  <h2 className="text-2xl font-black text-white mt-2">{plan.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-xl capitalize font-semibold border border-slate-700">
                    Difficulty: {plan.difficulty}
                  </span>
                </div>
              </div>
              {plan.summary && <p className="text-sm text-slate-300 mt-2">{plan.summary}</p>}
            </div>

            {/* Day Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {DAYS.map((day, i) => {
                const dayData = plan.schedule?.find(s => s.day === day) || plan.schedule?.[i];
                const isRest = dayData?.isRestDay;
                return (
                  <button key={day} onClick={() => setActiveDay(i)}
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                      activeDay === i
                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                        : isRest
                          ? 'bg-slate-900/50 text-slate-500 border border-slate-800/80 hover:bg-slate-800/80'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}>
                    <span>{day.slice(0, 3)}</span>
                    {isRest && <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Rest</span>}
                  </button>
                );
              })}
            </div>

            {/* Day Detail */}
            {currentDay && (
              <div>
                <div className="flex items-center justify-between mb-5 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{currentDay.day}</span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{currentDay.focus}</h3>
                  </div>
                  {currentDay.estimatedMinutes > 0 && (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                      <Clock className="w-4 h-4 text-violet-400" />
                      <span>{currentDay.estimatedMinutes} mins</span>
                    </div>
                  )}
                </div>

                {/* Rest Day view */}
                {currentDay.isRestDay || currentDay.exercises?.length === 0 ? (
                  <div className="glass-panel border border-slate-800 rounded-3xl p-10 text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">Rest & Active Recovery</h4>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto">
                      Rest days allow your muscles to repair, rebuild, and grow stronger. Focus on hydration, light walking, and foam rolling.
                    </p>
                  </div>
                ) : (
                  /* Exercises List */
                  <div className="space-y-3">
                    {currentDay.exercises.map((exercise, index) => (
                      <ExerciseCard key={index} exercise={exercise} index={index} />
                    ))}
                  </div>
                )}

                {/* Warmup & Cooldown Tips */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  {plan.warmupTips && (
                    <div className="glass-panel border border-slate-800 rounded-2xl p-4">
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">🔥 Dynamic Warmup</p>
                      <p className="text-xs text-slate-300">{plan.warmupTips}</p>
                    </div>
                  )}
                  {plan.cooldownTips && (
                    <div className="glass-panel border border-slate-800 rounded-2xl p-4">
                      <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">🧊 Cooldown & Recovery</p>
                      <p className="text-xs text-slate-300">{plan.cooldownTips}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
