import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import api from '../api/axios.js';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  // Seed demo notifications locally
  const DEMO_NOTIFICATIONS = [
    { _id: '1', title: '🎉 Plan Generated', message: 'Your personalized 7-day meal plan is ready!', isRead: false, createdAt: new Date(Date.now() - 10 * 60000) },
    { _id: '2', title: '🔥 5-Day Streak!', message: 'Amazing! You\'ve maintained a 5-day consistency streak.', isRead: false, createdAt: new Date(Date.now() - 60 * 60000) },
    { _id: '3', title: '💪 Workout Reminder', message: 'Today is your Push Day — Chest, Shoulders & Triceps!', isRead: true, createdAt: new Date(Date.now() - 3 * 3600000) },
    { _id: '4', title: '💧 Hydration Alert', message: 'You\'ve only logged 1.5L today. Target is 3.5L!', isRead: true, createdAt: new Date(Date.now() - 5 * 3600000) },
  ];

  const load = async () => {
    try {
      const { data } = await api.get('/api/notifications');
      if (data.data.notifications.length > 0) {
        setNotifications(data.data.notifications);
        setUnread(data.data.unreadCount);
      } else {
        setNotifications(DEMO_NOTIFICATIONS);
        setUnread(DEMO_NOTIFICATIONS.filter(n => !n.isRead).length);
      }
    } catch {
      setNotifications(DEMO_NOTIFICATIONS);
      setUnread(DEMO_NOTIFICATIONS.filter(n => !n.isRead).length);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try { await api.put('/api/notifications/read-all'); } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center min-w-[18px] min-h-[18px]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 glass-panel border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Notifications</h3>
              {unread > 0 && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unread}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button onClick={markAllRead} className="flex items-center gap-1 text-[11px] text-violet-400 hover:text-white transition-colors font-semibold">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0
              ? <p className="text-center text-slate-500 text-sm py-8">No notifications yet.</p>
              : notifications.map(n => (
                <div key={n._id} className={`px-5 py-4 border-b border-slate-800/50 hover:bg-slate-900/50 transition-all ${!n.isRead ? 'bg-violet-950/10' : ''}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${!n.isRead ? 'text-white' : 'text-slate-300'}`}>{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-violet-400 mt-1 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">{timeAgo(n.createdAt)}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
