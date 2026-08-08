import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DietPlan from './pages/DietPlan.jsx';
import WorkoutPlan from './pages/WorkoutPlan.jsx';
import ProgressTracker from './pages/ProgressTracker.jsx';
import AIChatCoach from './pages/AIChatCoach.jsx';
import HabitTracker from './pages/HabitTracker.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import BodyAnalysis from './pages/BodyAnalysis.jsx';
import ProgressPhotos from './pages/ProgressPhotos.jsx';
import Profile from './pages/Profile.jsx';
import AdminPrompts from './pages/AdminPrompts.jsx';

// Route guard — redirect to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

// Admin only guard
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected User Routes */}
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/diet" element={<ProtectedRoute><DietPlan /></ProtectedRoute>} />
      <Route path="/workout" element={<ProtectedRoute><WorkoutPlan /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><ProgressTracker /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><AIChatCoach /></ProtectedRoute>} />
      <Route path="/habits" element={<ProtectedRoute><HabitTracker /></ProtectedRoute>} />
      <Route path="/body-analysis" element={<ProtectedRoute><BodyAnalysis /></ProtectedRoute>} />
      <Route path="/progress-photos" element={<ProtectedRoute><ProgressPhotos /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/prompts" element={<AdminRoute><AdminPrompts /></AdminRoute>} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
