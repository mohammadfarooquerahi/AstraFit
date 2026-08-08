import mongoose from 'mongoose';

const adminActionLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['BAN_USER', 'UNBAN_USER', 'EDIT_DIET_PLAN', 'EDIT_WORKOUT_PLAN', 'IMAGE_MODERATION', 'EDIT_PROMPT', 'SYSTEM_SETTINGS'],
      required: true,
      index: true,
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Reason for action is required'],
      trim: true,
    },
    details: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const AdminActionLog = mongoose.model('AdminActionLog', adminActionLogSchema);
export default AdminActionLog;
