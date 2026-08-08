import mongoose from 'mongoose';

const aiUsageLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    provider: {
      type: String,
      enum: ['groq', 'groq-fallback', 'openai', 'gemini', 'gemini-fallback', 'openai-fallback'],
      required: true,
    },
    model: {
      type: String,
      default: 'unknown',
    },
    feature: {
      type: String, // diet_plan, workout_plan, chat, etc.
      default: 'unknown',
    },
    requestType: {
      type: String,
      enum: ['diet_generation', 'workout_generation', 'chat', 'progress_insight', 'other'],
      default: 'other',
    },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    latencyMs: { type: Number, default: 0 },
    success: { type: Boolean, default: true },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

const AIUsageLog = mongoose.model('AIUsageLog', aiUsageLogSchema);
export default AIUsageLog;
