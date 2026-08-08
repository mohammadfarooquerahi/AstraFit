import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    age: {
      type: Number,
      required: true,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age must be realistic'],
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
    },
    height: {
      type: Number,
      required: true, // in cm
    },
    weight: {
      type: Number,
      required: true, // in kg
    },
    activityLevel: {
      type: String,
      required: true,
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'],
    },
    fitnessExperience: {
      type: String,
      required: true,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    goal: {
      type: String,
      required: true,
      enum: ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Maintenance', 'General Fitness'],
    },
    dietaryPreference: {
      type: String,
      required: true,
      enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Custom'],
    },
    allergies: {
      type: [String],
      default: [],
    },
    workoutEnvironment: {
      type: String,
      required: true,
      enum: ['Home', 'Gym', 'Both'],
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
