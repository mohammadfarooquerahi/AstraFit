import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Dumbbell, LogOut, User, Utensils, Activity, TrendingUp, MessageCircle,
  ArrowRight, Flame, Shield, Scan, Camera, Zap, Award, Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboardStats, setDashboardStats] = useState({
    dailyCalories: 2450,
    workoutsDone: 12,
    currentWeight: 72.0,
    streak: 5,
    goal: 'Muscle Building',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const [dietRes, habitRes, progressRes, profileRes] = await Promise.allSettled([
          api.get('/api/diet'),
          api.get('/api/habits'),
          api.get('/api/progress'),
          api.get('/api/profile'),
        ]);

        const calories = dietRes.status === 'fulfilled' ? dietRes.value.data.data.dietPlan?.dailyCalories || 2450 : 2450;
        const streakVal = habitRes.status === 'fulfilled' ? habitRes.value.data.data.streak || 5 : 5;
        const weightVal = progressRes.status === 'fulfilled' ? progressRes.value.data.data.stats?.currentWeight || 72.0 : 72.0;
        const userGoal = profileRes.status === 'fulfilled' ? profileRes.value.data.data.profile?.goal || 'Muscle Building' : 'Muscle Building';

        setDashboardStats({
          dailyCalories: calories,
          workoutsDone: 14,
          currentWeight: weightVal,
          streak: streakVal,
          goal: userGoal,
        });
      } catch (err) {
        console.log('Dashboard stats loaded with defaults');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navbar Header */}
      <header className="border-b border-slate-800/80 px-4 sm:px-6 py-4 flex items-center justify-between bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-lg text-white tracking-tight">ASTRA<span className="text-violet-400 font-light">FIT</span></span>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-1.5 rounded-xl hover:bg-violet-500/20 transition-all">
              <Shield className="w-4 h-4 text-violet-400" /> Admin Panel 👑
            </Link>
          )}
          <Link to="/habits" className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-xl hover:bg-amber-500/20 transition-all">
            <Flame className="w-4 h-4 fill-amber-500" /> Daily Habits ({dashboardStats.streak}d 🔥)
          </Link>
          <div className="flex items-center gap-2 text-slate-300 pl-2 border-l border-slate-800">
            <User className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors ml-1">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Banner */}
        <div className="glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 bg-gradient-to-r from-violet-950/30 via-slate-900 to-indigo-950/30 relative overflow-hidden">
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Goal: {dashboardStats.goal}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-3">
                Welcome back, <span className="text-violet-400">{user?.name?.split(' ')[0]}</span> 👋
              </h1>
              <p className="text-slate-400 text-sm mt-1">Your AI personalized fitness & nutrition plan is active</p>
            </div>

            <div className="flex items-center gap-3">
              <Link to="/chat" className="btn-gradient text-xs sm:text-sm font-semibold px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-violet-500/20 hover:scale-105 transition-all">
                <Sparkles className="w-4 h-4 text-amber-300" /> Ask AI Coach
              </Link>
            </div>
          </div>
        </div>

        {/* Top 4 Stats Metric Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Daily Calories</span>
              <Utensils className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{dashboardStats.dailyCalories} <span className="text-xs font-normal text-slate-400">kcal</span></p>
            <p className="text-xs text-emerald-400 font-medium mt-1">Target Active ✓</p>
          </div>

          <div className="glass-panel border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Workouts Done</span>
              <Activity className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{dashboardStats.workoutsDone} <span className="text-xs font-normal text-slate-400">sessions</span></p>
            <p className="text-xs text-violet-400 font-medium mt-1">PPL Split Active</p>
          </div>

          <div className="glass-panel border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Current Weight</span>
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white">{dashboardStats.currentWeight} <span className="text-xs font-normal text-slate-400">kg</span></p>
            <p className="text-xs text-blue-400 font-medium mt-1">-3.0 kg Progress</p>
          </div>

          <div className="glass-panel border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Streak</span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-400">{dashboardStats.streak} <span className="text-xs font-normal text-slate-400">Days</span></p>
            <p className="text-xs text-amber-400 font-medium mt-1">Consistency 🔥</p>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-400" /> Core Platform Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'AI Diet Plan', desc: 'Personalized 7-day meal plan based on your macros', icon: Utensils, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-green-500/5 border-emerald-500/20', link: '/diet' },
            { title: 'AI Workout Plan', desc: 'Custom weekly training split generated by AI', icon: Activity, color: 'text-violet-400', bg: 'from-violet-500/10 to-indigo-500/5 border-violet-500/20', link: '/workout' },
            { title: 'Body & Posture Analysis', desc: 'Computer vision 33-point landmark scan & posture report', icon: Scan, color: 'text-pink-400', bg: 'from-pink-500/10 to-rose-500/5 border-pink-500/20', link: '/body-analysis' },
            { title: 'Physique Photo Comparison', desc: 'Side-by-side weekly before/after comparison studio', icon: Camera, color: 'text-indigo-400', bg: 'from-indigo-500/10 to-violet-500/5 border-indigo-500/20', link: '/progress-photos' },
            { title: 'Progress Tracker & Analytics', desc: 'Interactive Recharts weight trend graph & scores', icon: TrendingUp, color: 'text-blue-400', bg: 'from-blue-500/10 to-sky-500/5 border-blue-500/20', link: '/progress' },
            { title: 'AI Chat Coach (Groq Llama-3)', desc: 'Real-time AI fitness coach grounded in your context', icon: MessageCircle, color: 'text-amber-400', bg: 'from-amber-500/10 to-orange-500/5 border-amber-500/20', link: '/chat' },
          ].map((card) => (
            <Link key={card.title} to={card.link}
              className={`glass-panel bg-gradient-to-br ${card.bg} border rounded-2xl p-6 hover:scale-[1.02] transition-all group`}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900/80 flex items-center justify-center border border-slate-800">
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{card.title}</h3>
              <p className="text-sm text-slate-400">{card.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
