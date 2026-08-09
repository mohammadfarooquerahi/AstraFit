import { Profile, DietPlan, AIUsageLog } from '../models/index.js';
import { callAI, parseAIJson } from '../services/aiService.js';
import { buildDietPrompt } from '../services/dietPrompt.js';

// POST /api/diet/generate — Generate AI diet plan
export const generateDietPlan = async (req, res) => {
  try {
    // 1. Get user's profile
    const profile = await Profile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile setup before generating a diet plan.',
      });
    }

    // 2. Build prompt & call AI
    const prompt = buildDietPrompt(profile);
    const { text, usage, provider, latency } = await callAI(prompt);

    // 3. Parse AI response
    const planData = parseAIJson(text);

    // 4. Save diet plan to DB (upsert — one plan per user)
    const dietPlan = await DietPlan.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        dailyCalories: planData.dailyCalories,
        macros: planData.macros,
        waterIntakeLiters: planData.waterIntakeLiters,
        bmi: planData.bmi,
        summary: planData.summary,
        days: planData.days,
        generatedAt: new Date(),
        isAIGenerated: true,
        isActive: true,
      },
      { upsert: true, new: true, runValidators: false }
    );

    // 5. Log AI usage
    await AIUsageLog.create({
      userId: req.user._id,
      feature: 'diet_plan',
      provider,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      latencyMs: latency,
    });

    return res.status(200).json({
      success: true,
      message: 'Diet plan generated successfully.',
      data: { dietPlan, profile },
    });
  } catch (error) {
    console.error('Diet plan generation error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate diet plan. Please try again.',
    });
  }
};

// GET /api/diet — Get current user's diet plan
export const getDietPlan = async (req, res) => {
  try {
    const dietPlan = await DietPlan.findOne({ userId: req.user._id, isActive: true });
    const profile = await Profile.findOne({ userId: req.user._id });
    
    if (!dietPlan) {
      return res.status(404).json({
        success: false,
        message: 'No diet plan found. Generate one first.',
        data: { profile }
      });
    }
    return res.status(200).json({ success: true, data: { dietPlan, profile } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch diet plan.' });
  }
};
