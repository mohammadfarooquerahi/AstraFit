import { Profile, WorkoutPlan, AIUsageLog } from '../models/index.js';
import { callAI, parseAIJson } from '../services/aiService.js';
import { buildWorkoutPrompt } from '../services/workoutPrompt.js';

// POST /api/workout/generate — Generate AI workout plan
export const generateWorkoutPlan = async (req, res) => {
  try {
    // 1. Fetch user profile
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile setup before generating a workout plan.',
      });
    }

    // 2. Build prompt & call AI
    const prompt = buildWorkoutPrompt(profile);
    const { text, usage, provider, latency } = await callAI(prompt);

    // 3. Parse JSON
    const planData = parseAIJson(text);

    // 4. Save to DB (upsert single active plan per user)
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        title: planData.title || 'AI Personalized Workout Plan',
        splitType: planData.splitType || 'Custom Split',
        difficulty: planData.difficulty || profile.fitnessExperience || 'beginner',
        summary: planData.summary,
        schedule: planData.schedule || [],
        warmupTips: planData.warmupTips,
        cooldownTips: planData.cooldownTips,
        isAIGenerated: true,
        isActive: true,
      },
      { upsert: true, new: true, runValidators: false }
    );

    // 5. Log AI usage
    await AIUsageLog.create({
      userId: req.user._id,
      feature: 'workout_plan',
      requestType: 'workout_generation',
      provider,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      latencyMs: latency,
    });

    return res.status(200).json({
      success: true,
      message: 'Workout plan generated successfully.',
      data: { workoutPlan, profile },
    });
  } catch (error) {
    console.error('Workout plan generation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate workout plan. Please try again.',
    });
  }
};

// GET /api/workout — Get user's workout plan
export const getWorkoutPlan = async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findOne({ userId: req.user._id, isActive: true });
    const profile = await Profile.findOne({ userId: req.user._id });
    
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'No active workout plan found. Generate one first.',
        data: { profile }
      });
    }
    return res.status(200).json({ success: true, data: { workoutPlan, profile } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch workout plan.' });
  }
};
