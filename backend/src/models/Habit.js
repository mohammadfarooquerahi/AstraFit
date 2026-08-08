import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String, // format YYYY-MM-DD
      required: true,
      index: true,
    },
    mealsTracked: {
      type: Number,
      default: 0,
    },
    mealsTarget: {
      type: Number,
      default: 3,
    },
    waterIntake: {
      type: Number, // in ml
      default: 0,
    },
    waterTarget: {
      type: Number, // in ml
      default: 2500,
    },
    workoutCompleted: {
      type: Boolean,
      default: false,
    },
    sleepHours: {
      type: Number,
      default: 0,
    },
    stepsCount: {
      type: Number,
      default: 0,
    },
    stepsTarget: {
      type: Number,
      default: 8000,
    },
  },
  {
    timestamps: true,
  }
);

// Compounding unique index to prevent duplicate entries for the same day
habitSchema.index({ userId: 1, date: 1 }, { unique: true });

const Habit = mongoose.model('Habit', habitSchema);
export default Habit;
