import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
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
    weight: {
      type: Number, // in kg
      required: true,
    },
    chestSize: {
      type: Number, // in cm
    },
    waistSize: {
      type: Number, // in cm
    },
    hipSize: {
      type: Number, // in cm
    },
    fitnessScore: {
      type: Number, // 0 to 100 calculated metric
      min: 0,
      max: 100,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

// Compounding unique index to prevent duplicate entries for the same day
progressSchema.index({ userId: 1, date: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
