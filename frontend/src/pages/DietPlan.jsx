import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Utensils, Zap, Droplets, ChevronDown, ChevronUp,
  RefreshCw, ArrowLeft, Loader2, AlertCircle, Flame,
  Beef, Wheat, Droplet
} from 'lucide-react';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_COLORS = {
  Breakfast: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
  Lunch: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
  Dinner: 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30',
  'Snack 1': 'from-pink-500/20 to-rose-500/10 border-pink-500/30',
  'Snack 2': 'from-sky-500/20 to-blue-500/10 border-sky-500/30',
};
const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', 'Snack 1': '🍎', 'Snack 2': '🥜' };

function MacroBadge({ icon: Icon, label, value, unit, color }) {
  return (
    <div className={`flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3`}>
      <Icon className={`w-4 h-4 ${color}`} />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-bold text-white">{value}<span className="text-xs text-slate-400 ml-1">{unit}</span></p>
      </div>
    </div>
  );
}

function MealCard({ meal }) {
  const [open, setOpen] = useState(false);
  const colorClass = MEAL_COLORS[meal.type] || 'from-slate-700/20 to-slate-800/10 border-slate-700/30';
  return (
    <div className={`bg-gradient-to-r ${colorClass} border rounded-xl overflow-hidden transition-all`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-3">
          <span className="text-lg">{MEAL_ICONS[meal.type] || '🍽️'}</span>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{meal.type}</p>
            <p className="text-sm font-bold text-white">{meal.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-amber-400">{meal.calories} kcal</span>
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5">
          <p className="text-xs text-slate-300 mt-3 mb-3">{meal.description}</p>
          <div className="flex gap-3 mb-3 flex-wrap">
            <span className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-lg px-2 py-1">P: {meal.protein}g</span>
            <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-lg px-2 py-1">C: {meal.carbs}g</span>
            <span className="text-xs bg-red-500/10 text-red-300 border border-red-500/20 rounded-lg px-2 py-1">F: {meal.fat}g</span>
          </div>
          {meal.ingredients?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1.5">INGREDIENTS</p>
              <ul className="space-y-1">
                {meal.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="text-violet-400 mt-0.5">•</span>{ing}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DietPlan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const fetchPlan = async () => {
    try {
      const { data } = await api.get('/api/diet');
      setPlan(data.data.dietPlan);
    } catch (err) {
      if (err.response?.status !== 404) setError('Failed to load diet plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlan(); }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const { data } = await api.post('/api/diet/generate');
      setPlan(data.data.dietPlan);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate diet plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const currentDay = plan?.days?.[activeDay];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Utensils className="w-5 h-5 text-emerald-400" />
          <h1 className="text-lg font-bold">AI Diet Plan</h1>
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
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading your diet plan...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* No plan yet */}
        {!loading && !plan && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600/20 to-green-600/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mb-6">
              <Utensils className="w-9 h-9 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Generate Your Diet Plan</h2>
            <p className="text-slate-400 text-sm max-w-sm mb-8">
              Our AI will create a personalized 7-day meal plan based on your fitness profile, goals, and dietary preferences.
            </p>
            <button onClick={handleGenerate} disabled={generating}
              className="btn-gradient px-8 py-3.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating... (takes ~15 sec)</>
                : <><Zap className="w-4 h-4" /> Generate with AI</>
              }
            </button>
          </div>
        )}

        {/* Plan loaded */}
        {!loading && plan && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <MacroBadge icon={Flame} label="Daily Calories" value={plan.dailyCalories} unit="kcal" color="text-amber-400" />
              <MacroBadge icon={Beef} label="Protein" value={plan.macros?.protein} unit="g" color="text-blue-400" />
              <MacroBadge icon={Wheat} label="Carbs" value={plan.macros?.carbs} unit="g" color="text-orange-400" />
              <MacroBadge icon={Droplet} label="Water" value={plan.waterIntakeLiters} unit="L/day" color="text-sky-400" />
            </div>

            {/* AI Summary */}
            {plan.summary && (
              <div className="glass-panel border border-slate-800 rounded-2xl p-4 mb-8">
                <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">AI Summary</p>
                <p className="text-sm text-slate-300">{plan.summary}</p>
              </div>
            )}

            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {DAYS.map((day, i) => (
                <button key={day} onClick={() => setActiveDay(i)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeDay === i
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Day Meals */}
            {currentDay && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">{currentDay.day}</h2>
                  <span className="text-sm text-amber-400 font-semibold">
                    {currentDay.totalCalories} kcal total
                  </span>
                </div>
                <div className="space-y-3">
                  {currentDay.meals?.map((meal, i) => (
                    <MealCard key={i} meal={meal} />
                  ))}
                </div>
              </div>
            )}

            {/* Generated at */}
            <p className="text-center text-xs text-slate-600 mt-8">
              Generated {plan.generatedAt ? new Date(plan.generatedAt).toLocaleDateString() : 'recently'} by AI
            </p>
          </>
        )}
      </div>
    </div>
  );
}
