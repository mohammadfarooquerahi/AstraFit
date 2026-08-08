import mongoose from 'mongoose';

const chatConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Coaching Session',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ChatConversation = mongoose.model('ChatConversation', chatConversationSchema);
export default ChatConversation;
