import { Progress, Profile } from '../models/index.js';

// Helper to calculate a 0-100 fitness score
const calculateFitnessScore = (currentWeight, targetGoal, startWeight, profile) => {
  let score = 70; // baseline
  if (!startWeight || startWeight === currentWeight) return score;

  const diff = currentWeight - startWeight;
  if (targetGoal === 'Weight Loss' && diff < 0) {
    score += Math.min(Math.abs(diff) * 3, 25);
  } else if (targetGoal === 'Weight Gain' && diff > 0) {
    score += Math.min(diff * 3, 25);
  } else if (targetGoal === 'Muscle Building' && diff > 0) {
    score += Math.min(diff * 4, 25);
  } else if (targetGoal === 'Maintenance' && Math.abs(diff) < 2) {
    score += 20;
  }
  return Math.min(Math.round(score), 100);
};

// POST /api/progress — Log or update today's progress
export const addProgressLog = async (req, res) => {
  try {
    const { date, weight, chestSize, waistSize, hipSize } = req.body;

    if (!weight) {
      return res.status(400).json({ success: false, message: 'Weight is required.' });
    }

    const logDate = date || new Date().toISOString().split('T')[0];
    const profile = await Profile.findOne({ userId: req.user._id });

    // Fetch initial/first recorded weight for reference
    const firstProgress = await Progress.findOne({ userId: req.user._id }).sort({ date: 1 });
    const initialWeight = firstProgress ? firstProgress.weight : profile?.weight || weight;

    const fitnessScore = calculateFitnessScore(
      Number(weight),
      profile?.goal || 'Maintenance',
      initialWeight,
      profile
    );

    const progress = await Progress.findOneAndUpdate(
      { userId: req.user._id, date: logDate },
      {
        userId: req.user._id,
        date: logDate,
        weight: Number(weight),
        chestSize: chestSize ? Number(chestSize) : undefined,
        waistSize: waistSize ? Number(waistSize) : undefined,
        hipSize: hipSize ? Number(hipSize) : undefined,
        fitnessScore,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Progress recorded successfully.',
      data: { progress },
    });
  } catch (error) {
    console.error('Progress log error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record progress.' });
  }
};

// GET /api/progress — Fetch user progress history & summary stats
export const getProgressHistory = async (req, res) => {
  try {
    const logs = await Progress.find({ userId: req.user._id }).sort({ date: 1 });
    const profile = await Profile.findOne({ userId: req.user._id });

    if (logs.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          logs: [],
          stats: { currentWeight: profile?.weight || 0, weightChange: 0, fitnessScore: 70 },
        },
      });
    }

    const startWeight = logs[0].weight;
    const currentWeight = logs[logs.length - 1].weight;
    const weightChange = +(currentWeight - startWeight).toFixed(1);
    const latestScore = logs[logs.length - 1].fitnessScore || 70;

    return res.status(200).json({
      success: true,
      data: {
        logs,
        stats: {
          startWeight,
          currentWeight,
          weightChange,
          fitnessScore: latestScore,
          logCount: logs.length,
        },
      },
    });
  } catch (error) {
    console.error('Fetch progress error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch progress history.' });
  }
};
