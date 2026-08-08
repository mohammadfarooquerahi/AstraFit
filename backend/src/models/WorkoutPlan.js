import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  sets: {
    type: Number,
    required: true,
  },
  reps: {
    type: String, // e.g. '12' or '10-12' or 'Until failure'
    required: true,
  },
  restSeconds: {
    type: Number,
    default: 60,
  },
  notes: {
    type: String,
  },
});

const dayWorkoutSchema = new mongoose.Schema({
  day: {
    type: String, // e.g. Monday, Wednesday
    required: true,
  },
  focus: {
    type: String, // e.g. Chest + Triceps
    required: true,
  },
  exercises: {
    type: [exerciseSchema],
    required: true,
  },
  durationMinutes: {
    type: Number,
    default: 45,
  },
});

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weeklySplit: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    workouts: {
      type: [dayWorkoutSchema],
      required: true,
    },
    warmupNotes: {
      type: String,
    },
    cooldownNotes: {
      type: String,
    },
    isCustomOverride: {
      type: Boolean,
      default: false,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    originalAIPlan: {
      type: String, // Audit trace storing original raw prompt output
    },
  },
  {
    timestamps: true,
  }
);

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);
export default WorkoutPlan;
