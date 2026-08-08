import { User, Profile, AIUsageLog, PromptTemplate, AdminActionLog } from '../models/index.js';

// GET /api/admin/users — List all registered users with profiles
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const profiles = await Profile.find();

    const profileMap = {};
    profiles.forEach(p => { profileMap[p.userId.toString()] = p; });

    const userList = users.map(u => ({
      ...u.toObject(),
      profile: profileMap[u._id.toString()] || null,
    }));

    return res.status(200).json({ success: true, data: { users: userList } });
  } catch (error) {
    console.error('Admin getAllUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// PUT /api/admin/users/:id/status — Ban/Unban or activate user
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive', 'banned'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Audit action
    await AdminActionLog.create({
      adminId: req.user._id,
      action: 'UPDATE_USER_STATUS',
      targetUser: id,
      details: `Changed user status to ${status}`,
    });

    return res.status(200).json({ success: true, message: `User status updated to ${status}.`, data: { user } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

// PUT /api/admin/users/:id/role — Change user role (user/admin)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role value.' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Audit action
    await AdminActionLog.create({
      adminId: req.user._id,
      action: 'UPDATE_USER_ROLE',
      targetUser: id,
      details: `Changed user role to ${role}`,
    });

    return res.status(200).json({ success: true, message: `User role updated to ${role}.`, data: { user } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
};

// GET /api/admin/ai-logs — View AI token consumption and latency metrics
export const getAILogs = async (req, res) => {
  try {
    const logs = await AIUsageLog.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(100);

    const stats = await AIUsageLog.aggregate([
      {
        $group: {
          _id: '$provider',
          totalPromptTokens: { $sum: '$promptTokens' },
          totalCompletionTokens: { $sum: '$completionTokens' },
          avgLatencyMs: { $avg: '$latencyMs' },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({ success: true, data: { logs, stats } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch AI usage logs.' });
  }
};
