import {
  User, Profile, AIUsageLog, DietPlan, WorkoutPlan,
  ChatMessage, ProgressPhoto, AdminActionLog, Progress
} from '../models/index.js';

// ─── 5.1 User Management ─────────────────────────────────────

// GET /api/admin/users — List all users with profiles + activity
export const getAllUsers = async (req, res) => {
  try {
    const { search, status, role } = req.query;
    let query = {};
    if (status) query.status = status;
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    const profiles = await Profile.find();
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.userId.toString()] = p; });

    const chatCounts = await ChatMessage.aggregate([{ $group: { _id: '$conversationId', count: { $sum: 1 } } }]);
    const progressCounts = await Progress.aggregate([{ $group: { _id: '$userId', count: { $sum: 1 } } }]);
    const progressMap = {};
    progressCounts.forEach(p => { progressMap[p._id.toString()] = p.count; });

    const userList = users.map(u => ({
      ...u.toObject(),
      profile: profileMap[u._id.toString()] || null,
      progressLogs: progressMap[u._id.toString()] || 0,
    }));

    return res.status(200).json({ success: true, data: { users: userList, total: userList.length } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// PUT /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    await AdminActionLog.create({ adminId: req.user._id, action: 'UPDATE_USER_STATUS', targetUser: req.params.id, details: `Changed status to ${status}` });
    return res.status(200).json({ success: true, message: `User ${status}.`, data: { user } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

// PUT /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    await AdminActionLog.create({ adminId: req.user._id, action: 'UPDATE_USER_ROLE', targetUser: req.params.id, details: `Changed role to ${role}` });
    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update role.' });
  }
};

// ─── 5.2 Analytics Dashboard ─────────────────────────────────

// GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', status: 'active' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const totalChats = await ChatMessage.countDocuments({ sender: 'user' });
    const totalDietPlans = await DietPlan.countDocuments();
    const totalWorkoutPlans = await WorkoutPlan.countDocuments();
    const totalProgressLogs = await Progress.countDocuments();

    // AI usage this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const aiCallsThisWeek = await AIUsageLog.countDocuments({ createdAt: { $gte: weekAgo } });
    const aiTokenStats = await AIUsageLog.aggregate([{
      $group: {
        _id: null,
        totalPromptTokens: { $sum: '$promptTokens' },
        totalCompletionTokens: { $sum: '$completionTokens' },
        avgLatency: { $avg: '$latencyMs' },
      }
    }]);

    // Users registered per day (last 7 days)
    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Average fitness score from progress
    const avgFitnessScore = await Progress.aggregate([
      { $group: { _id: null, avg: { $avg: '$fitnessScore' } } }
    ]);

    return res.status(200).json({
      success: true,
      data: {
        overview: { totalUsers, activeUsers, bannedUsers, totalChats, totalDietPlans, totalWorkoutPlans, totalProgressLogs },
        ai: { aiCallsThisWeek, tokenStats: aiTokenStats[0] || { totalPromptTokens: 0, totalCompletionTokens: 0, avgLatency: 0 } },
        dailySignups,
        avgFitnessScore: Math.round(avgFitnessScore[0]?.avg || 72),
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
};

// ─── 5.3 AI Output Monitoring ────────────────────────────────

// GET /api/admin/ai-plans — View all generated diet & workout plans
export const getAIPlans = async (req, res) => {
  try {
    const { type } = req.query;
    let plans = [];
    if (!type || type === 'diet') {
      const dietPlans = await DietPlan.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(50);
      plans = plans.concat(dietPlans.map(p => ({ ...p.toObject(), planType: 'diet' })));
    }
    if (!type || type === 'workout') {
      const workoutPlans = await WorkoutPlan.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(50);
      plans = plans.concat(workoutPlans.map(p => ({ ...p.toObject(), planType: 'workout' })));
    }
    return res.status(200).json({ success: true, data: { plans } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch AI plans.' });
  }
};

// GET /api/admin/ai-logs — AI token usage & telemetry
export const getAILogs = async (req, res) => {
  try {
    const logs = await AIUsageLog.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(100);
    const stats = await AIUsageLog.aggregate([{
      $group: {
        _id: '$provider',
        totalPromptTokens: { $sum: '$promptTokens' },
        totalCompletionTokens: { $sum: '$completionTokens' },
        avgLatencyMs: { $avg: '$latencyMs' },
        count: { $sum: 1 },
      }
    }]);
    return res.status(200).json({ success: true, data: { logs, stats } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch AI logs.' });
  }
};

// ─── 5.4 Image Moderation ────────────────────────────────────

// GET /api/admin/photos — View all uploaded photos for moderation
export const getAllPhotos = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { moderationStatus: status } : {};
    const photos = await ProgressPhoto.find(query).populate('userId', 'name email').sort({ createdAt: -1 });
    const pendingCount = await ProgressPhoto.countDocuments({ moderationStatus: 'Pending' });
    const flaggedCount = await ProgressPhoto.countDocuments({ moderationStatus: 'Flagged' });
    return res.status(200).json({ success: true, data: { photos, pendingCount, flaggedCount } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch photos.' });
  }
};

// PUT /api/admin/photos/:id/moderate
export const moderatePhoto = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const photo = await ProgressPhoto.findByIdAndUpdate(req.params.id, { moderationStatus: status, moderationReason: reason }, { new: true });
    await AdminActionLog.create({ adminId: req.user._id, action: 'MODERATE_PHOTO', details: `Photo ${req.params.id} set to ${status}` });
    return res.status(200).json({ success: true, data: { photo } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to moderate photo.' });
  }
};

// ─── 5.5 Plan Management / Override ─────────────────────────

// PUT /api/admin/plans/diet/:id — Admin edit AI-generated diet plan
export const editDietPlan = async (req, res) => {
  try {
    const plan = await DietPlan.findByIdAndUpdate(req.params.id, { ...req.body, adminEdited: true }, { new: true });
    await AdminActionLog.create({ adminId: req.user._id, action: 'EDIT_DIET_PLAN', details: `Edited diet plan ${req.params.id}` });
    return res.status(200).json({ success: true, data: { plan } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to edit diet plan.' });
  }
};

// PUT /api/admin/plans/workout/:id — Admin edit AI-generated workout plan
export const editWorkoutPlan = async (req, res) => {
  try {
    const plan = await WorkoutPlan.findByIdAndUpdate(req.params.id, { ...req.body, adminEdited: true }, { new: true });
    await AdminActionLog.create({ adminId: req.user._id, action: 'EDIT_WORKOUT_PLAN', details: `Edited workout plan ${req.params.id}` });
    return res.status(200).json({ success: true, data: { plan } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to edit workout plan.' });
  }
};

// ─── 5.6 Chat Moderation ─────────────────────────────────────

// GET /api/admin/chats — View all chatbot conversations
export const getAllChats = async (req, res) => {
  try {
    const { flagged } = req.query;
    const query = flagged === 'true' ? { isFlagged: true } : {};
    const messages = await ChatMessage.find(query).populate('userId', 'name email').sort({ createdAt: -1 }).limit(200);

    // Group by userId
    const grouped = {};
    messages.forEach(m => {
      const uid = m.userId?._id?.toString() || 'unknown';
      if (!grouped[uid]) grouped[uid] = { user: m.userId, messages: [] };
      grouped[uid].messages.push(m);
    });

    const conversations = Object.values(grouped);
    const flaggedCount = await ChatMessage.countDocuments({ isFlagged: true });

    return res.status(200).json({ success: true, data: { conversations, flaggedCount } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch chats.' });
  }
};

// PUT /api/admin/chats/:id/flag — Flag or unflag a chat message
export const flagChatMessage = async (req, res) => {
  try {
    const { isFlagged } = req.body;
    const message = await ChatMessage.findByIdAndUpdate(req.params.id, { isFlagged }, { new: true });
    await AdminActionLog.create({ adminId: req.user._id, action: isFlagged ? 'FLAG_CHAT' : 'UNFLAG_CHAT', details: `Message ${req.params.id}` });
    return res.status(200).json({ success: true, data: { message } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to flag message.' });
  }
};

// ─── 5.7 Reports & Logs ──────────────────────────────────────

// GET /api/admin/action-logs — Admin audit trail
export const getAdminActionLogs = async (req, res) => {
  try {
    const logs = await AdminActionLog.find().populate('adminId', 'name email').sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ success: true, data: { logs } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin logs.' });
  }
};
