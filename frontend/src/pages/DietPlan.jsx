import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Utensils, Zap, Droplets, ChevronDown, ChevronUp,
  RefreshCw, ArrowLeft, Loader2, AlertCircle, Flame,
  Beef, Wheat, Droplet, ShieldCheck, Info, Plus, Minus
} from 'lucide-react';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const MEAL_ICONS = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', 'Snack 1': '🍎', 'Snack 2': '🥜' };

function MacroCard({ label, value, unit, total, color, bgBar, icon: Icon }) {
  const pct = total ? Math.min(Math.round((value / total) * 100), 100) : 0;
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">
          {value || 0}
          <span className="text-xs text-slate-400 font-normal ml-1">{unit}</span>
        </p>
        <div className="mt-2.5 flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${bgBar}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm transition-all">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <span className="text-2xl shrink-0">{MEAL_ICONS[meal.type] || '🍽️'}</span>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{meal.type}</span>
            <p className="text-sm font-bold text-slate-900">{meal.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs font-bold text-slate-900">{meal.calories} kcal</span>
            <p className="text-[10px] text-slate-500 font-medium">P:{meal.protein}g • C:{meal.carbs}g • F:{meal.fat}g</p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-3.5">
          {meal.description && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Meal Description</p>
              <p className="text-xs text-slate-700 leading-relaxed">{meal.description}</p>
            </div>
          )}

          {/* Macro breakdown */}
          <div className="grid grid-cols-3 gap-2 bg-white border border-slate-200 p-2.5 rounded-xl text-center shadow-xs">
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-semibold">Protein</p>
              <p className="text-xs font-bold text-indigo-700">{meal.protein}g</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-semibold">Carbs</p>
              <p className="text-xs font-bold text-amber-700">{meal.carbs}g</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase font-semibold">Fats</p>
              <p className="text-xs font-bold text-rose-700">{meal.fat}g</p>
            </div>
          </div>

          {/* Ingredients list */}
          {meal.ingredients?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Ingredients</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {meal.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
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
  const totalMacros = plan ? (plan.macros?.protein + plan.macros?.carbs + plan.macros?.fat) || 1 : 1;

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
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">Nutrition & Meal Plan</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Macro targets & allergy-aware meals</p>
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
            <span>Regenerate Nutrition</span>
          </button>
        )}
      </header>

      <div className="max-w-4xl w-full mx-auto px-4 sm:px-8 py-8 flex-1 space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Syncing nutrition schedule...</p>
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
            <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <Utensils className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Build Your Nutrition Plan</h2>
            <p className="text-slate-500 text-sm max-w-md mb-6 leading-relaxed">
              AstraFit will construct a personalized 7-day meal plan with customized macronutrient metrics, calorie goals, and food preferences while keeping you safe from allergies.
            </p>
            {profile?.allergies?.length > 0 && (
              <div className="mb-6 inline-flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 text-amber-700 px-3.5 py-1.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Allergens Excluded: <span className="font-semibold">{profile.allergies.join(', ')}</span></span>
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
                  <span>Customizing Meals...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Generate Meal Plan</span>
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
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Dietary Plan</span>
                <p className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{profile?.dietaryPreference || 'Balanced'} Nutrition</span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">
                    Goal: {profile?.goal || 'General Fitness'}
                  </span>
                </p>
              </div>

              {profile?.allergies?.length > 0 && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Safe from: <span className="font-semibold">{profile.allergies.join(', ')}</span></span>
                </div>
              )}
            </div>

            {/* Macro Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MacroCard label="Daily Calories" value={plan.dailyCalories} unit="kcal" total={plan.dailyCalories} color="text-amber-600" bgBar="bg-amber-500" icon={Flame} />
              <MacroCard label="Protein"        value={plan.macros?.protein} unit="g" total={totalMacros} color="text-indigo-600" bgBar="bg-indigo-600" icon={Beef} />
              <MacroCard label="Carbohydrates"  value={plan.macros?.carbs} unit="g" total={totalMacros} color="text-orange-600" bgBar="bg-orange-500" icon={Wheat} />
              <MacroCard label="Water Target"   value={plan.waterIntakeLiters} unit="L" total={plan.waterIntakeLiters} color="text-sky-600" bgBar="bg-sky-500" icon={Droplet} />
            </div>

            {/* AI Summary note */}
            {plan.summary && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-0.5">Nutritional Guidance</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{plan.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hydration Tracker */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0 text-sky-600">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Daily Hydration Log</p>
                  <p className="text-xs text-slate-500">
                    Target: <span className="font-semibold text-sky-700">{plan.waterIntakeLiters}L</span> • Logged: <span className="font-semibold text-slate-800">{waterLogged}L</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleWaterClick(-0.25)}
                  className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-all font-bold"
                  aria-label="Decrease water"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(idx => {
                    const filled = waterLogged >= (idx * (plan.waterIntakeLiters / 5));
                    return (
                      <div
                        key={idx}
                        className={`w-4 h-6 rounded-md transition-all duration-300 ${
                          filled ? 'bg-sky-500 shadow-xs' : 'bg-slate-100 border border-slate-200'
                        }`}
                      />
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => handleWaterClick(0.25)}
                  className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-all font-bold"
                  aria-label="Increase water"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Day Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 custom-scrollbar scrollbar-hide">
              {DAYS.map((day, i) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(i)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeDay === i
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Day Meals Container */}
            {currentDay && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{currentDay.day} Meals</h2>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    Total: {currentDay.totalCalories} kcal
                  </span>
                </div>
                <div className="space-y-3">
                  {currentDay.meals?.map((meal, i) => (
                    <MealCard key={i} meal={meal} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
