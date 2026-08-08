import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Activity, 
  Dumbbell, 
  Apple, 
  CheckSquare, 
  LineChart, 
  MessageSquare, 
  User, 
  Shield, 
  Cpu, 
  Database, 
  CheckCircle, 
  XCircle,
  Clock,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

const queryClient = new QueryClient();

function WelcomeDashboard() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/health');
      if (response.data.success) {
        setHealthData(response.data.data);
      } else {
        setError('Server returned unsuccessful status');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-violet-500/30">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                APEX <span className="text-violet-400 font-light">FITNESS AI</span>
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/" className="text-white bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-lg hover:text-violet-400 transition-colors">Home</Link>
            <a href="#features" className="hover:text-violet-400 transition-colors">Features</a>
            <a href="#quick-start" className="hover:text-violet-400 transition-colors">Quick Start</a>
            <a href="#diagnostics" className="hover:text-violet-400 transition-colors flex items-center gap-1">
              <Activity className="w-4 h-4 text-emerald-400" /> Diagnostics
            </a>
          </nav>

          {/* User / Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#admin" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              <Shield className="w-3.5 h-3.5 text-violet-400" /> Admin
            </a>
            <button className="btn-gradient text-xs font-semibold text-white px-4.5 py-2 rounded-xl shadow-md">
              Sign In
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-16 bg-slate-950/95 border-b border-slate-900 p-6 flex flex-col gap-4 animate-fade-in shadow-2xl backdrop-blur-xl">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-white hover:text-violet-400 text-sm font-semibold transition-colors block py-2"
            >
              Home
            </Link>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-violet-400 text-sm font-semibold transition-colors block py-2"
            >
              Features
            </a>
            <a 
              href="#quick-start" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-violet-400 text-sm font-semibold transition-colors block py-2"
            >
              Quick Start
            </a>
            <a 
              href="#diagnostics" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-300 hover:text-violet-400 text-sm font-semibold transition-colors block py-2"
            >
              Diagnostics
            </a>
            <div className="border-t border-slate-900 pt-4 flex flex-col gap-3">
              <a 
                href="#admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1.5 py-1"
              >
                <Shield className="w-4 h-4 text-violet-400" /> Administrative Console
              </a>
              <button className="btn-gradient w-full text-sm font-semibold text-white py-2.5 rounded-xl shadow-md">
                Sign In
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Welcome Section */}
        <section className="grid lg:grid-cols-12 gap-8 items-center mb-16">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-violet-400 bg-violet-400/10 rounded-full border border-violet-400/20">
              <Zap className="w-3.5 h-3.5 animate-pulse" /> MERN Platform Active
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Elevate Your Fitness with <span className="text-gradient">AI Coaching</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
              Get personalized workout regimes, macro-friendly diet schedules, posture-landmark body estimates, and habit consistency scoring. Completely interactive, accessible, and fast.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#diagnostics" 
                className="btn-gradient px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 shadow-lg shadow-violet-500/20 hover:scale-[1.02] transition-transform"
              >
                <Activity className="w-5 h-5" /> Connection Check
              </a>
              <a 
                href="#features" 
                className="px-6 py-3 rounded-xl font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all hover:border-slate-700"
              >
                Explore Modules
              </a>
            </div>
          </div>

          {/* Gamified visual score ring */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-72 h-72 rounded-full flex items-center justify-center p-6 border border-slate-800/80 bg-slate-900/10 glass-panel shadow-2xl">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-ping opacity-30" style={{ animationDuration: '4s' }} />
              {/* SVG Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="rgba(30, 41, 59, 0.5)" strokeWidth="6" fill="transparent" />
                <circle cx="50" cy="50" r="42" stroke="url(#violetGradient)" strokeWidth="6" fill="transparent" strokeDasharray="264" strokeDashoffset="48" strokeLinecap="round" />
                <defs>
                  <linearGradient id="violetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center space-y-1">
                <span className="block text-4xl sm:text-5xl font-black text-white tracking-tight">82%</span>
                <span className="block text-[10px] sm:text-xs font-bold text-violet-400 uppercase tracking-widest">Adherence score</span>
                <div className="flex items-center justify-center gap-1.5 mt-2 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800 w-fit mx-auto">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] text-slate-300 font-semibold">Streak Gold</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diagnostics & API status check */}
        <section id="diagnostics" className="scroll-mt-20 mb-16">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl" />
            
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Cpu className="w-6 h-6 text-violet-400" />
                  System Diagnostics
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Press the connection check button to query the backend database. This module will verify the MERN service endpoints are synchronized and communicate correctly under local proxy environments.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={fetchHealth} 
                    className="bg-slate-900 border border-slate-800 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:bg-slate-800"
                  >
                    <Activity className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
                    Test Live Connection
                  </button>
                </div>
              </div>

              {/* Status details */}
              <div className="space-y-4">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-3 bg-slate-950/50 rounded-2xl border border-slate-900">
                    <div className="w-6 h-6 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs">Fetching configuration details...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-4 flex gap-3">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-semibold text-red-200">Connection Blocked</h4>
                      <p className="text-[11px] text-red-400 mt-1">{error}</p>
                      <p className="text-[10px] text-slate-500 mt-2">
                        Start the backend server using `npm run dev:backend` inside the folder.
                      </p>
                    </div>
                  </div>
                )}

                {!loading && !error && !healthData && (
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center">
                    <p className="text-xs text-slate-400">Click connection button to run diagnostic queries.</p>
                  </div>
                )}

                {healthData && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900">
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold">Server Port</span>
                        <span className="text-sm font-bold text-white">5000</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900">
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold">Proxy Host</span>
                        <span className="text-sm font-bold text-white">Vite Dev Server</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex items-center justify-between">
                      <span className="text-xs text-slate-400">Node Environment</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {healthData.dbStatus ? 'Development' : 'Pending'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 flex items-center justify-between">
                      <span className="text-xs text-slate-400">MongoDB status</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        healthData.dbStatus === 'connected'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        {healthData.dbStatus}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section id="features" className="scroll-mt-20 space-y-6 mb-16">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Responsive Platform Modules</h2>
            <p className="text-slate-400 text-sm">
              Discover the dynamic layers designed to power the AI Fitness Coach platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-all">
                <Dumbbell className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1">
                Workout Generator <ChevronRight className="w-4 h-4 text-violet-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Adaptive exercise planning featuring custom sets, reps, environment options (Gym, Home, Both), and split metrics aligned with weight loss or building goals.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-all">
                <Apple className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1">
                Diet Planner <ChevronRight className="w-4 h-4 text-violet-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Meal schedule generation targeting custom macro bounds while incorporating user allergy checklists (e.g. gluten, egg, peanuts) and preferences.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-all">
                <Cpu className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1">
                Pose Landmark Vision <ChevronRight className="w-4 h-4 text-violet-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Four-way image analysis (Front/Back/Left/Right) powered by MediaPipe pose estimations to calculate posture scores and body alignments.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-all">
                <CheckSquare className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1">
                Daily Habit Tracker <ChevronRight className="w-4 h-4 text-violet-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log meals, water (ml), workout completion, steps count, and sleep hours, updating your global gamification score and streaks on completion.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-all">
                <MessageSquare className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1">
                RAG Coach Chatbot <ChevronRight className="w-4 h-4 text-violet-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Context-aware coaching retrieving recent workouts, meal targets, and progress logs to stream tailored responses with medical guardrail disclaimers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-900/20 hover:border-slate-800 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-all">
                <Shield className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-1">
                Admin Control Room <ChevronRight className="w-4 h-4 text-violet-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supervise active plans, override AI results, configure system prompt versions, moderate images, and audit API tokens consumption logs.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Start / Tech Info Section */}
        <section id="quick-start" className="scroll-mt-20 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl border border-slate-900 bg-slate-900/20">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Responsive UI and Interactive Mechanics
            </h3>
            <div className="space-y-4 text-sm text-slate-300">
              <p>
                This welcome UI adjusts down to single-column blocks on mobile screens, collapses navigation bars into an accessible overlay drawer, and updates dynamic diagnostics elements asynchronously.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-slate-400">
                <li>Responsive viewport grid grids (1 col on mobile, 2 on tablet, 3 on desktop grids).</li>
                <li>Dynamic active states using standard React state tracking hooks.</li>
                <li>Tailwind CSS animations, gradients, and custom glassmorphism layers.</li>
              </ul>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-slate-900 bg-slate-900/20 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white mb-3">MERN Infrastructure</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Workspaces link frontend configuration proxies with backend express ports to eliminate CORS roadblocks.
              </p>
            </div>
            <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-2 text-[10px] text-slate-500">
              <p>Client: localhost:5173 (React/Vite)</p>
              <p>Server: localhost:5000 (Express/Node)</p>
              <p>Database: localhost:27017 (MongoDB)</p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 mt-16 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>Apex Fitness AI Coach Project. Built for Saylani Mass IT Training (SMIT) Hackathon.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomeDashboard />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
