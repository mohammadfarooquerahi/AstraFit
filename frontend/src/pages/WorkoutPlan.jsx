import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Dumbbell, Zap, Clock, RefreshCw, ArrowLeft, Loader2,
  AlertCircle, Shield, Check, Info, Flame,
  Activity, Play, CheckCircle2, Award, Sparkles, ChevronRight
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function ExerciseCard({ exercise, index, completed, onToggle }) {
  return (
    <div className={`glass-panel border rounded-2xl p-4 sm:p-5 transition-all duration-300 ${
      completed
        ? 'border-emerald-500/30 bg-emerald-950/5 shadow-md shadow-emerald-500/5'
        : 'border-slate-800/80 hover:border-slate-700 bg-slate-900/20'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
              completed
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                : 'border-slate-700 hover:border-slate-500 text-transparent bg-slate-900'
            }`}
          >
            <Check className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
          <div>
            <h4 className={`font-bold text-base leading-snug transition-all ${completed ? 'text-slate-500 line-through' : 'text-white'}`}>
              {exercise.name}
            </h4>
            {exercise.muscleGroup && (
              <span className={`text-[10px] font-bold bg-violet-500/10 border border-violet-500/25 px-2 py-0.5 rounded-md inline-block mt-1 uppercase tracking-wider ${
                completed ? 'text-slate-600 border-slate-800/80 bg-slate-950' : 'text-violet-400'
              }`}>
                {exercise.muscleGroup}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
            completed ? 'bg-slate-950 text-slate-655 border-slate-900' : 'bg-slate-800/80 text-slate-300 border-slate-700'
          }`}>
            {exercise.sets} Sets
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
            completed ? 'bg-slate-950 text-slate-655 border-slate-900' : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25'
          }`}>
            {exercise.reps} Reps
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-805/50 mt-3">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-600" />
          <span className={completed ? 'text-slate-600' : 'text-slate-400'}>Rest: {exercise.restSeconds || 60}s</span>
        </div>
        {exercise.tips && (
          <p className={`text-xs italic text-right max-w-[200px] sm:max-w-xs truncate ${completed ? 'text-slate-600' : 'text-slate-400'}`}>
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
  
  // Completed exercises tracking per day: { dayIdx-exerciseIdx: boolean }
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

  // Calculate day completion rate
  const dayExercisesCount = currentDay?.exercises?.length || 0;
  const dayCompletedCount = currentDay?.exercises?.reduce((acc, _, idx) => {
    return acc + (completedList[`${activeDay}-${idx}`] ? 1 : 0);
  }, 0) || 0;
  const dayProgressPct = dayExercisesCount ? Math.round((dayCompletedCount / dayExercisesCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.06), transparent)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-slate-800/80 px-4 sm:px-6 py-4 flex items-center gap-4 bg-slate-950/80 backdrop-blur sticky top-0">
        <button onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-905 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">AI Training Hub</h1>
            <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mt-0.5">Custom splits & workout tracking</p>
          </div>
        </div>
        {plan && (
          <button onClick={handleGenerate} disabled={generating}
            className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-350 bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            Regenerate Split
          </button>
        )}
      </div>

      <div className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        
        {/* Loading UI */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-slate-450 text-xs font-bold uppercase tracking-wider">Configuring Workout Schedule...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-red-950/40 border border-red-800/50 text-red-355 text-xs px-4 py-3 rounded-2xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* No plan yet */}
        {!loading && !plan && (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-panel border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-gradient-to-tr from-violet-600/20 to-indigo-600/10 border border-violet-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/5">
              <Dumbbell className="w-9 h-9 text-violet-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Build Your Training Routine</h2>
            <p className="text-slate-400 text-sm max-w-md mb-8">
              AstraFit will construct a personalized 7-day training schedule optimized for your splits, sets/reps target, and exercise environments (Home/Gym).
            </p>
            {profile?.workoutEnvironment && (
              <div className="mb-6 flex items-center gap-2 text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-4 py-2 rounded-xl">
                <Play className="w-4 h-4 text-violet-400 shrink-0" />
                <span>Target Setup: <span className="font-bold capitalize">{profile.workoutEnvironment} Training</span></span>
              </div>
            )}
            <button onClick={handleGenerate} disabled={generating}
              className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-lg shadow-violet-500/15 disabled:opacity-50">
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Structuring Splits...</>
                : <><Zap className="w-4 h-4 text-amber-300" /> Generate Workout Plan</>
              }
            </button>
          </div>
        )}

        {/* Plan display screen */}
        {!loading && plan && (
          <div className="space-y-6">
            
            {/* Header Details */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/30 border border-slate-800/80 p-5 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Split Program</span>
                <h2 className="text-xl font-black text-white mt-0.5">{plan.title}</h2>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/25 px-2.5 py-0.5 rounded-full font-bold uppercase">
                    🏋️ {plan.splitType}
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 rounded-full font-bold capitalize">
                    Experience: {profile?.fitnessExperience || plan.difficulty}
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold capitalize">
                    Setup: {profile?.workoutEnvironment || 'hybrid'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Summary */}
            {plan.summary && (
              <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-violet-450 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-0.5">Split Overview & Objective</p>
                    <p className="text-xs text-slate-350 leading-relaxed">{plan.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800/60 custom-scrollbar scrollbar-hide">
              {DAYS.map((day, i) => {
                const dayData = plan.schedule?.find(s => s.day === day) || plan.schedule?.[i];
                const isRest = dayData?.isRestDay;
                return (
                  <button key={day} onClick={() => setActiveDay(i)}
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      activeDay === i
                        ? 'bg-gradient-to-r from-violet-650 to-indigo-650 text-white shadow-lg shadow-violet-500/10'
                        : 'bg-slate-900/60 text-slate-405 hover:bg-slate-900 border border-slate-850 hover:border-slate-750'
                    }`}>
                    <span>{day}</span>
                    {isRest && <span className="text-[8px] bg-slate-800 text-slate-500 px-1 py-0.5 rounded-md font-bold uppercase">Rest</span>}
                  </button>
                );
              })}
            </div>

            {/* Day Meals Container */}
            {currentDay && (
              <div className="space-y-4">
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 flex-wrap gap-2">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{currentDay.day} Target Focus</p>
                    <h3 className="text-base font-black text-white">{currentDay.focus}</h3>
                  </div>
                  {!currentDay.isRestDay && currentDay.exercises?.length > 0 && (
                    <div className="flex items-center gap-3">
                      {/* Workout progress indicator */}
                      <div className="text-right">
                        <p className="text-[9px] text-slate-550 font-bold uppercase">Workout Progress</p>
                        <p className="text-xs font-black text-white">{dayCompletedCount}/{dayExercisesCount} Done</p>
                      </div>
                      <div className="relative w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-black text-violet-400">
                        {dayProgressPct}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Exercises / Rest Card */}
                {currentDay.isRestDay || currentDay.exercises?.length === 0 ? (
                  <div className="glass-panel border border-slate-850 rounded-3xl p-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h4 className="text-lg font-black text-white mb-1">Rest & Muscle Hypertrophy Recovery</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Muscles grow and adapt during rest, not during training. Ensure optimal protein intake, keep hydrated, and do light foam rolling or mobility stretching.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {currentDay.exercises.map((exercise, index) => (
                      <ExerciseCard
                        key={index}
                        exercise={exercise}
                        index={index}
                        completed={!!completedList[`${activeDay}-${index}`]}
                        onToggle={() => handleToggleExercise(activeDay, index)}
                      />
                    ))}
                  </div>
                )}

                {/* Warmup & Cooldown Tips */}
                {!currentDay.isRestDay && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {plan.warmupTips && (
                      <div className="glass-panel border border-slate-850 rounded-2xl p-4 flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                          <Activity className="w-4.5 h-4.5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-amber-400 uppercase tracking-wider mb-0.5">Dynamic Warmup</p>
                          <p className="text-xs text-slate-350 leading-relaxed">{plan.warmupTips}</p>
                        </div>
                      </div>
                    )}
                    {plan.cooldownTips && (
                      <div className="glass-panel border border-slate-850 rounded-2xl p-4 flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <Clock className="w-4.5 h-4.5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-indigo-400 uppercase tracking-wider mb-0.5">Post-Workout Recovery</p>
                          <p className="text-xs text-slate-350 leading-relaxed">{plan.cooldownTips}</p>
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
