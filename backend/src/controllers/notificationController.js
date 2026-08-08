import { Notification } from '../models/index.js';

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    return res.status(200).json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

// PUT /api/notifications/:id/read
export const markRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true });
    return res.status(200).json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark notification.' });
  }
};

// PUT /api/notifications/read-all
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to mark all notifications.' });
  }
};

// Helper: Create a notification and emit socket event
export const createNotification = async (io, { userId, type, title, message, link }) => {
  try {
    const notif = await Notification.create({ userId, type, title, message, link });
    if (io) io.to(`user:${userId.toString()}`).emit('notification:new', notif);
    return notif;
  } catch (err) {
    console.error('Create notification error:', err.message);
  }
};
