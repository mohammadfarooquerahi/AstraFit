import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from '../components/NotificationBell.jsx';
import {
  Dumbbell, LogOut, User, Utensils, Activity, TrendingUp,
  MessageCircle, ArrowRight, Flame, Shield, Scan, Camera,
  Zap, Sparkles, Star, Trophy, Target, CheckCircle2
} from 'lucide-react';

const ACHIEVEMENTS = [
  { id: '7day', label: '7-Day Streak', icon: '🔥', desc: 'Consistent for 7 days', color: 'text-amber-400', unlocked: true },
  { id: 'first_plan', label: 'First Plan', icon: '🎯', desc: 'Generated first AI plan', color: 'text-emerald-400', unlocked: true },
  { id: '10_workouts', label: '10 Workouts', icon: '💪', desc: 'Completed 10 sessions', color: 'text-violet-400', unlocked: true },
  { id: '100_water', label: 'Hydration Pro', icon: '💧', desc: 'Logged 100 glasses', color: 'text-blue-400', unlocked: false },
  { id: '30_streak', label: '30-Day Streak', icon: '⚡', desc: 'Unbreakable commitment', color: 'text-rose-400', unlocked: false },
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

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const scoreColor = stats.fitnessScore >= 80 ? 'text-emerald-400' : stats.fitnessScore >= 60 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 px-4 sm:px-6 py-4 flex items-center justify-between bg-slate-950/90 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg text-white tracking-tight">ASTRA<span className="text-violet-400 font-light">FIT</span></span>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-xs font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-1.5 rounded-xl hover:bg-violet-500/20 transition-all">
              <Shield className="w-3.5 h-3.5 text-violet-400" /> Admin
            </Link>
          )}
          <Link to="/habits" className="flex items-center gap-1.5 text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-all">
            <Flame className="w-3.5 h-3.5 fill-amber-500" /> {stats.streak}d 🔥
          </Link>
          <NotificationBell />
          <Link to="/profile" className="flex items-center gap-1.5 text-sm text-slate-300 border border-slate-800 hover:border-violet-500/40 hover:text-white px-3 py-1.5 rounded-xl transition-all">
            <User className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">{user?.name?.split(' ')[0]}</span>
          </Link>
          <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-red-400 transition-colors p-1.5">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Banner */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 bg-gradient-to-r from-violet-950/30 via-slate-900 to-indigo-950/30 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                <Target className="w-3 h-3 inline mr-1" />{stats.goal}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">
                Welcome back, <span className="text-violet-400">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-slate-400 text-sm mt-1">Your AI-personalized fitness & nutrition plan is active</p>
            </div>
            <Link to="/chat" className="btn-gradient text-sm font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-violet-500/20 hover:scale-105 transition-all">
              <Sparkles className="w-4 h-4 text-amber-300" /> Ask AI Coach
            </Link>
          </div>
        </div>

        {/* Top KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Daily Calories', value: `${stats.dailyCalories}`, unit: 'kcal', sub: 'Target Active ✓', icon: Utensils, color: 'text-amber-400', link: '/diet' },
            { label: 'Workouts Done', value: `${stats.workoutsDone}`, unit: 'sessions', sub: 'PPL Split Active', icon: Activity, color: 'text-violet-400', link: '/workout' },
            { label: 'Current Weight', value: `${stats.currentWeight}`, unit: 'kg', sub: '-3.0 kg Progress', icon: TrendingUp, color: 'text-blue-400', link: '/progress' },
            { label: 'Active Streak', value: `${stats.streak}`, unit: 'Days', sub: 'Consistency 🔥', icon: Flame, color: 'text-amber-400', link: '/habits' },
          ].map(s => (
            <Link key={s.label} to={s.link} className="glass-panel border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all hover:scale-[1.02] group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-white">{s.value} <span className="text-xs font-normal text-slate-400">{s.unit}</span></p>
              <p className={`text-xs font-medium mt-1 ${s.color}`}>{s.sub}</p>
            </Link>
          ))}
        </div>

        {/* Fitness Score & Achievements Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Fitness Score Breakdown */}
          <div className="glass-panel border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2"><Star className="w-4 h-4 text-amber-400" /> Fitness Score</h3>
              <div className={`text-3xl font-black ${scoreColor}`}>{stats.fitnessScore}<span className="text-sm text-slate-400 font-normal">/100</span></div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Workout Consistency', val: stats.workout, color: 'bg-violet-500' },
                { label: 'Nutrition', val: stats.nutrition, color: 'bg-emerald-500' },
                { label: 'Hydration', val: stats.hydration, color: 'bg-blue-500' },
                { label: 'Sleep', val: stats.sleep, color: 'bg-indigo-500' },
                { label: 'Consistency', val: stats.consistency, color: 'bg-amber-500' },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">{b.label}</span>
                    <span className="text-white font-bold">{b.val}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${b.color} rounded-full transition-all`} style={{ width: `${b.val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements */}
          <div className="glass-panel border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4"><Trophy className="w-4 h-4 text-amber-400" /> Achievements & Milestones</h3>
            <div className="space-y-3">
              {ACHIEVEMENTS.map(a => (
                <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${a.unlocked ? 'bg-slate-900 border-slate-700' : 'bg-slate-900/30 border-slate-800/50 opacity-50'}`}>
                  <div className="text-2xl">{a.icon}</div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${a.unlocked ? 'text-white' : 'text-slate-500'}`}>{a.label}</p>
                    <p className="text-xs text-slate-400">{a.desc}</p>
                  </div>
                  {a.unlocked
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-400" /> Platform Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'AI Diet Plan', desc: 'Personalized 7-day meal plan based on your macros', icon: Utensils, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-green-500/5 border-emerald-500/20', link: '/diet' },
            { title: 'AI Workout Plan', desc: 'Custom Push/Pull/Legs weekly training split', icon: Activity, color: 'text-violet-400', bg: 'from-violet-500/10 to-indigo-500/5 border-violet-500/20', link: '/workout' },
            { title: 'AI Chat Coach', desc: 'Groq Llama-3.3 70B RAG-grounded fitness coach', icon: MessageCircle, color: 'text-amber-400', bg: 'from-amber-500/10 to-orange-500/5 border-amber-500/20', link: '/chat' },
            { title: 'Progress Tracker', desc: 'Interactive Recharts weight trend & fitness score', icon: TrendingUp, color: 'text-blue-400', bg: 'from-blue-500/10 to-sky-500/5 border-blue-500/20', link: '/progress' },
            { title: 'Body & Posture Analysis', desc: 'MediaPipe 33-point landmark canvas overlay', icon: Scan, color: 'text-pink-400', bg: 'from-pink-500/10 to-rose-500/5 border-pink-500/20', link: '/body-analysis' },
            { title: 'Physique Comparison', desc: 'Interactive before/after split comparison slider', icon: Camera, color: 'text-indigo-400', bg: 'from-indigo-500/10 to-violet-500/5 border-indigo-500/20', link: '/progress-photos' },
          ].map(card => (
            <Link key={card.title} to={card.link}
              className={`glass-panel bg-gradient-to-br ${card.bg} border rounded-2xl p-6 hover:scale-[1.02] transition-all group`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900/80 flex items-center justify-center border border-slate-800">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{card.title}</h3>
              <p className="text-xs text-slate-400">{card.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
