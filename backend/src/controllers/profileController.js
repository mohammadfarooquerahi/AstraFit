import { Profile } from '../models/index.js';

// POST /api/profile — create or update profile
export const createProfile = async (req, res) => {
  try {
    const { age, gender, height, weight, activityLevel, fitnessExperience,
      goal, dietaryPreference, allergies, workoutEnvironment } = req.body;

    if (!age || !gender || !height || !weight || !activityLevel || !goal || !dietaryPreference || !workoutEnvironment) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
      { age, gender, height, weight, activityLevel, fitnessExperience: fitnessExperience || 'beginner',
        goal, dietaryPreference, allergies: allergies || [], workoutEnvironment, userId: req.user._id },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ success: true, message: 'Profile saved successfully.', data: { profile } });
  } catch (error) {
    console.error('Profile create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save profile.' });
  }
};

// GET /api/profile — get current user's profile
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found. Please complete onboarding.' });
    }
    return res.status(200).json({ success: true, data: { profile } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
};
