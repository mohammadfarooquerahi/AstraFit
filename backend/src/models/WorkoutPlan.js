import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  muscleGroup: { type: String },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  restSeconds: { type: Number, default: 60 },
  tips: { type: String },
}, { _id: false });

const dayWorkoutSchema = new mongoose.Schema({
  day: { type: String, required: true }, // Monday, Tuesday...
  focus: { type: String, required: true }, // Push, Pull, Legs, Rest Day
  isRestDay: { type: Boolean, default: false },
  estimatedMinutes: { type: Number, default: 45 },
  exercises: { type: [exerciseSchema], default: [] },
}, { _id: false });

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, default: 'AI Personalized Workout Plan' },
    splitType: { type: String, default: 'Push / Pull / Legs' },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    summary: { type: String },
    schedule: { type: [dayWorkoutSchema], default: [] },
    warmupTips: { type: String, default: '5-10 mins light cardio and dynamic stretches.' },
    cooldownTips: { type: String, default: '5 mins static stretching for target muscles.' },
    isAIGenerated: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
export default WorkoutPlan;
