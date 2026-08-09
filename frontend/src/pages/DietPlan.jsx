import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Utensils, Zap, Droplets, ChevronDown, ChevronUp,
  RefreshCw, ArrowLeft, Loader2, AlertCircle, Flame,
  Beef, Wheat, Droplet, ShieldCheck, Heart, Info, Plus, Minus
} from 'lucide-react';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_COLORS = {
  Breakfast: 'from-amber-500/15 via-orange-500/5 to-transparent border-amber-500/30 text-amber-400',
  Lunch: 'from-emerald-500/15 via-green-500/5 to-transparent border-emerald-500/30 text-emerald-400',
  Dinner: 'from-indigo-500/15 via-violet-500/5 to-transparent border-indigo-500/30 text-indigo-400',
  'Snack 1': 'from-pink-500/15 via-rose-500/5 to-transparent border-pink-500/30 text-pink-400',
  'Snack 2': 'from-sky-500/15 via-blue-500/5 to-transparent border-sky-500/30 text-sky-400',
};
const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', 'Snack 1': '🍎', 'Snack 2': '🥜' };

function MacroCard({ label, value, unit, total, color, bgBar, icon: Icon }) {
  const pct = total ? Math.min(Math.round((value / total) * 100), 100) : 0;
  return (
    <div className="glass-panel border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}<span className="text-xs text-slate-500 font-normal ml-1">{unit}</span></p>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-1000 ${bgBar}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[9px] font-bold text-slate-500">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal }) {
  const [open, setOpen] = useState(false);
  const colorClass = MEAL_COLORS[meal.type] || 'from-slate-700/10 via-slate-800/5 to-transparent border-slate-700/30 text-slate-400';
  return (
    <div className={`bg-gradient-to-r ${colorClass} border rounded-2xl overflow-hidden transition-all duration-300 shadow-md ${open ? 'ring-1 ring-violet-500/30' : ''}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left">
        <div className="flex items-center gap-3.5">
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] shrink-0">{MEAL_ICONS[meal.type] || '🍽️'}</span>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{meal.type}</p>
            <p className="text-sm font-black text-white group-hover:text-violet-400 transition-colors">{meal.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-black text-amber-400">{meal.calories} kcal</span>
            <p className="text-[9px] text-slate-500">P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-center">
            {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-800/40 bg-slate-950/20 space-y-4">
          <div className="pt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Description</p>
            <p className="text-xs text-slate-300 leading-relaxed">{meal.description}</p>
          </div>

          {/* Macros Detail */}
          <div className="grid grid-cols-3 gap-2 bg-slate-900/40 border border-slate-800/50 p-2.5 rounded-xl text-center">
            <div>
              <p className="text-[8px] text-slate-500 uppercase font-bold">Protein</p>
              <p className="text-xs font-black text-blue-400">{meal.protein}g</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-500 uppercase font-bold">Carbs</p>
              <p className="text-xs font-black text-amber-500">{meal.carbs}g</p>
            </div>
            <div>
              <p className="text-[8px] text-slate-500 uppercase font-bold">Fats</p>
              <p className="text-xs font-black text-pink-400">{meal.fat}g</p>
            </div>
          </div>

          {/* Ingredients list */}
          {meal.ingredients?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ingredients</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {meal.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2 bg-slate-900/30 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                    <span>{ing}</span>
                  </div>
                ))}
              </div>
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
  const [profile, setProfile] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [waterLogged, setWaterLogged] = useState(0);

  const fetchPlan = async () => {
    try {
      const { data } = await api.get('/api/diet');
      setPlan(data.data.dietPlan);
      setProfile(data.data.profile);
    } catch (err) {
      if (err.response?.status === 404) {
        setProfile(err.response?.data?.data?.profile || null);
      } else {
        setError('Failed to load diet plan.');
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
      const { data } = await api.post('/api/diet/generate');
      setPlan(data.data.dietPlan);
      setProfile(data.data.profile);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate diet plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleWaterClick = (amt) => {
    setWaterLogged(prev => Math.max(0, +(prev + amt).toFixed(1)));
  };

  const currentDay = plan?.days?.[activeDay];
  
  // Calculate total macros from plan for ratios
  const totalMacros = plan ? (plan.macros?.protein + plan.macros?.carbs + plan.macros?.fat) || 1 : 1;

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.06), transparent)' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-slate-800/80 px-4 sm:px-6 py-4 flex items-center gap-4 bg-slate-950/80 backdrop-blur sticky top-0">
        <button onClick={() => navigate('/dashboard')}
          className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-900 rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <Utensils className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-white leading-none">AI Nutrition Hub</h1>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">Allergy-Aware Meal planner</p>
          </div>
        </div>
        {plan && (
          <button onClick={handleGenerate} disabled={generating}
            className="ml-auto flex items-center gap-1.5 text-xs font-bold text-slate-350 bg-slate-900 hover:bg-slate-850 border border-slate-800 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            Regenerate Plan
          </button>
        )}
      </div>

      <div className="relative z-10 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 space-y-6">
        
        {/* Loading UI */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            <p className="text-slate-450 text-xs font-bold uppercase tracking-wider">Syncing Diet Plan...</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-3 bg-red-950/40 border border-red-800/50 text-red-355 text-xs px-4 py-3 rounded-2xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* No plan generated yet */}
        {!loading && !plan && (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-panel border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-transparent to-transparent pointer-events-none" />
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-600/20 to-green-600/10 border border-emerald-500/30 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/5">
              <Utensils className="w-9 h-9 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Build Your Custom Diet Plan</h2>
            <p className="text-slate-400 text-sm max-w-md mb-8">
              AstraFit will construct a personalized 7-day meal plan with customized macronutrient metrics, calorie goals, and food preferences while keeping you safe from allergies.
            </p>
            {profile?.allergies?.length > 0 && (
              <div className="mb-6 flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/20 text-amber-455 px-4 py-2 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Allergens Excluded: <span className="font-bold">{profile.allergies.join(', ')}</span></span>
              </div>
            )}
            <button onClick={handleGenerate} disabled={generating}
              className="btn-gradient px-8 py-3.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-lg shadow-emerald-500/15 disabled:opacity-50">
              {generating
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Customizing Meals...</>
                : <><Zap className="w-4 h-4 text-amber-300" /> Generate with AI</>
              }
            </button>
          </div>
        )}

        {/* Plan display screen */}
        {!loading && plan && (
          <div className="space-y-6">
            
            {/* Header Details */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/30 border border-slate-800/80 p-4 rounded-2xl">
              <div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Nutrition Target</span>
                <p className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                  {profile?.dietaryPreference || 'Seeded'} Plan
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded-full font-bold">
                    Goal: {profile?.goal || 'General Fitness'}
                  </span>
                </p>
              </div>
              
              {/* Excluded Allergies Indicator */}
              {profile?.allergies?.length > 0 && (
                <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 px-3.5 py-2 rounded-xl text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Allergy Guard Active</p>
                    <p className="font-semibold">Safe from: {profile.allergies.join(', ')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Macro Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MacroCard label="Daily Calories" value={plan.dailyCalories} unit="kcal" total={plan.dailyCalories} color="text-amber-400" bgBar="bg-amber-500" icon={Flame} />
              <MacroCard label="Protein"        value={plan.macros?.protein} unit="g" total={totalMacros} color="text-blue-400" bgBar="bg-blue-500" icon={Beef} />
              <MacroCard label="Carbohydrates"  value={plan.macros?.carbs} unit="g" total={totalMacros} color="text-amber-500" bgBar="bg-amber-500" icon={Wheat} />
              <MacroCard label="Daily Water Limit" value={plan.waterIntakeLiters} unit="L" total={plan.waterIntakeLiters} color="text-sky-400" bgBar="bg-sky-500" icon={Droplet} />
            </div>

            {/* AI Plan Summary */}
            {plan.summary && (
              <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-0.5">Plan Overview & Guidance</p>
                    <p className="text-xs text-slate-350 leading-relaxed">{plan.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hydration Tracker */}
            <div className="glass-panel border border-slate-850 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Daily Hydration Log</p>
                  <p className="text-[10px] text-slate-400">Target: <span className="font-bold text-sky-400">{plan.waterIntakeLiters}L</span> · Logged: <span className="font-bold text-white">{waterLogged}L</span></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleWaterClick(-0.25)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-all text-slate-450 font-bold">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(idx => {
                    const filled = waterLogged >= (idx * (plan.waterIntakeLiters / 5));
                    return (
                      <div key={idx} className={`w-3.5 h-6 rounded-md transition-all duration-300 ${
                        filled ? 'bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.4)]' : 'bg-slate-900 border border-slate-800'
                      }`} />
                    );
                  })}
                </div>
                <button onClick={() => handleWaterClick(0.25)}
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white hover:border-slate-700 transition-all text-slate-450 font-bold">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800/60 custom-scrollbar scrollbar-hide">
              {DAYS.map((day, i) => (
                <button key={day} onClick={() => setActiveDay(i)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                    activeDay === i
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-650 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/60 text-slate-400 hover:bg-slate-900 border border-slate-850 hover:border-slate-750'
                  }`}>
                  {day}
                </button>
              ))}
            </div>

            {/* Day Meals Container */}
            {currentDay && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h2 className="text-sm font-black text-white uppercase tracking-wider">{currentDay.day} Meal Breakdown</h2>
                  <span className="text-xs font-black text-emerald-450 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                    Total: {currentDay.totalCalories} kcal
                  </span>
                </div>
                <div className="space-y-3.5">
                  {currentDay.meals?.map((meal, i) => (
                    <MealCard key={i} meal={meal} />
                  ))}
                </div>
              </div>
            )}

            {/* Safety Footer Disclaimer */}
            <div className="rounded-2xl border border-slate-900 bg-slate-950/40 p-4 flex gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                AstraFit AI utilizes intelligent recipes and macro limits suitable for healthy fitness progress. Cross-reference ingredient guides if you have severe anaphylactic conditions or medical diet requisites.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
