import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from '../components/NotificationBell.jsx';
import {
  Dumbbell, LogOut, User, Utensils, Activity, TrendingUp,
  MessageCircle, ArrowRight, Flame, Shield, Scan, Camera,
  Sparkles, Star, Trophy, Target, CheckCircle2
} from 'lucide-react';

const ACHIEVEMENTS = [
  { id: '7day', label: '7-Day Streak', icon: '🔥', desc: 'Consistent workouts for 7 consecutive days', unlocked: true },
  { id: 'first_plan', label: 'First Plan Created', icon: '🎯', desc: 'Generated personalized fitness plan', unlocked: true },
  { id: '10_workouts', label: '10 Workouts Completed', icon: '💪', desc: 'Logged 10 active training sessions', unlocked: true },
  { id: '100_water', label: 'Hydration Target', icon: '💧', desc: 'Hit daily hydration goals consistently', unlocked: false },
  { id: '30_streak', label: '30-Day Milestone', icon: '⚡', desc: 'Dedicated commitment for a full month', unlocked: false },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    dailyCalories: 2450, workoutsDone: 14, currentWeight: 72.0,
    streak: 5, goal: 'Muscle Building', fitnessScore: 82,
    workout: 90, nutrition: 78, hydration: 85, sleep: 75, consistency: 88,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [dietRes, habitRes, progressRes, profileRes] = await Promise.allSettled([
          api.get('/api/diet'),
          api.get('/api/habits'),
          api.get('/api/progress'),
          api.get('/api/profile'),
        ]);
        setStats(prev => ({
          ...prev,
          dailyCalories: dietRes.status === 'fulfilled' ? dietRes.value.data.data.dietPlan?.dailyCalories || 2450 : 2450,
          streak: habitRes.status === 'fulfilled' ? habitRes.value.data.data.streak || 5 : 5,
          currentWeight: progressRes.status === 'fulfilled' ? progressRes.value.data.data.stats?.currentWeight || 72.0 : 72.0,
          goal: profileRes.status === 'fulfilled' ? profileRes.value.data.data.profile?.goal || 'Muscle Building' : 'Muscle Building',
        }));
      } catch {}
    };
    load();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              Astra<span className="text-indigo-600">Fit</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {user?.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-all"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span>Admin Panel</span>
            </Link>
          )}

          <Link
            to="/habits"
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-xl hover:bg-amber-100 transition-all shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{stats.streak} day streak</span>
          </Link>

          <NotificationBell />

          <Link
            to="/profile"
            className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-xl transition-all shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[10px]">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="hidden sm:inline font-semibold">{user?.name?.split(' ')[0]}</span>
          </Link>

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Welcome Greeting Banner */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>Goal: {stats.goal}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Athlete'}
            </h1>
            <p className="text-slate-500 text-sm">
              Your personalized workout and nutrition guidance is actively tracked.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/chat"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Ask Fitness Coach</span>
            </Link>
          </div>
        </div>

        {/* 4 Primary KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Daily Target', value: `${stats.dailyCalories}`, unit: 'kcal', sub: 'Nutrition active', icon: Utensils, iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', link: '/diet' },
            { label: 'Workouts Completed', value: `${stats.workoutsDone}`, unit: 'sessions', sub: 'PPL Routine', icon: Activity, iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100', link: '/workout' },
            { label: 'Current Weight', value: `${stats.currentWeight}`, unit: 'kg', sub: 'Tracked progress', icon: TrendingUp, iconBg: 'bg-blue-50 text-blue-600 border-blue-100', link: '/progress' },
            { label: 'Active Streak', value: `${stats.streak}`, unit: 'days', sub: 'Daily habits', icon: Flame, iconBg: 'bg-amber-50 text-amber-600 border-amber-100', link: '/habits' },
          ].map(s => (
            <Link
              key={s.label}
              to={s.link}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</span>
                <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${s.iconBg}`}>
                  <s.icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {s.value} <span className="text-xs font-normal text-slate-500">{s.unit}</span>
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">{s.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Fitness Score & Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fitness Score Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Fitness Consistency Score</h3>
                  <p className="text-xs text-slate-500">Holistic activity breakdown</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {stats.fitnessScore}
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </div>
            </div>

            <div className="space-y-3.5">
              {[
                { label: 'Workout Adherence', val: stats.workout, color: 'bg-indigo-600' },
                { label: 'Nutrition & Macros', val: stats.nutrition, color: 'bg-emerald-600' },
                { label: 'Hydration Consistency', val: stats.hydration, color: 'bg-blue-600' },
                { label: 'Sleep & Recovery', val: stats.sleep, color: 'bg-purple-600' },
                { label: 'Daily Habit Streak', val: stats.consistency, color: 'bg-amber-500' },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{b.label}</span>
                    <span className="text-slate-900 font-bold">{b.val}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${b.color} rounded-full transition-all duration-500`} style={{ width: `${b.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Milestones & Achievements</h3>
                  <p className="text-xs text-slate-500">Track key fitness accomplishments</p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              {ACHIEVEMENTS.map(a => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    a.unlocked
                      ? 'bg-slate-50/70 border-slate-200 text-slate-900'
                      : 'bg-white border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  <span className="text-xl">{a.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-900">{a.label}</p>
                    <p className="text-[11px] text-slate-500">{a.desc}</p>
                  </div>
                  {a.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Features Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Explore AstraFit Modules</h2>
              <p className="text-xs text-slate-500">Access personalized plans and tracking tools</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Personalized Nutrition', desc: 'Custom meal plans balanced for calories and macronutrients', icon: Utensils, iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100', link: '/diet' },
              { title: 'Custom Workout Plan', desc: 'Tailored weekly training split suited for home or gym setups', icon: Activity, iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100', link: '/workout' },
              { title: 'AI Fitness Coach', desc: 'Chat with your 24/7 fitness specialist for advice & recipe ideas', icon: MessageCircle, iconBg: 'bg-amber-50 text-amber-600 border-amber-100', link: '/chat' },
              { title: 'Body & Posture Analysis', desc: 'Biomechanical posture inspection and anatomical alignment score', icon: Scan, iconBg: 'bg-purple-50 text-purple-600 border-purple-100', link: '/body-analysis' },
              { title: 'Weight & Fitness Trends', desc: 'Track weigh-ins, body measurements, and progress over time', icon: TrendingUp, iconBg: 'bg-blue-50 text-blue-600 border-blue-100', link: '/progress' },
              { title: 'Physique Photo Comparison', desc: 'Side-by-side before and after slider to visualize transformation', icon: Camera, iconBg: 'bg-rose-50 text-rose-600 border-rose-100', link: '/progress-photos' },
            ].map(card => (
              <Link
                key={card.title}
                to={card.link}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow hover:border-slate-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{card.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
