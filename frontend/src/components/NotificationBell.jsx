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
    { _id: '1', title: 'Plan Generated', message: 'Your personalized 7-day meal plan is ready to view.', isRead: false, createdAt: new Date(Date.now() - 10 * 60000) },
    { _id: '2', title: '5-Day Streak!', message: 'Great job maintaining your consistency for 5 days in a row.', isRead: false, createdAt: new Date(Date.now() - 60 * 60000) },
    { _id: '3', title: 'Workout Reminder', message: 'Scheduled workout: Push Day (Chest, Shoulders & Triceps).', isRead: true, createdAt: new Date(Date.now() - 3 * 3600000) },
    { _id: '4', title: 'Hydration Target', message: 'You have logged 1.5L today. Keep going toward your daily goal!', isRead: true, createdAt: new Date(Date.now() - 5 * 3600000) },
  ];

  const load = async () => {
    try {
      const { data } = await api.get('/api/notifications');
      if (data?.data?.notifications?.length > 0) {
        setNotifications(data.data.notifications);
        setUnread(data.data.unreadCount || 0);
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
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200/90 shadow-sm transition-all"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-slate-700" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</span>
              {unread > 0 && (
                <span className="text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
            {notifications.length === 0 ? (
              <p className="text-center text-slate-400 text-xs py-8">No notifications yet.</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`p-3.5 transition-colors ${!n.isRead ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`text-xs ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1 shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5">{timeAgo(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
