import { Habit } from '../models/index.js';

// Helper to calculate consecutive active habit streak
const calculateStreak = async (userId) => {
  const habits = await Habit.find({ userId }).sort({ date: -1 });
  if (habits.length === 0) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < habits.length; i++) {
    const habitDate = new Date(habits[i].date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    // Check if at least 2 habits completed on that day
    const isCompleted = (
      habits[i].workoutCompleted ||
      habits[i].waterIntake >= 2000 ||
      habits[i].mealsTracked >= 3 ||
      habits[i].stepsCount >= 5000
    );

    if (isCompleted) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

// GET /api/habits — Fetch today's habit log + streak stats
export const getTodayHabit = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    let habit = await Habit.findOne({ userId: req.user._id, date: todayStr });

    if (!habit) {
      habit = await Habit.create({
        userId: req.user._id,
        date: todayStr,
      });
    }

    const streak = await calculateStreak(req.user._id);

    return res.status(200).json({
      success: true,
      data: { habit, streak },
    });
  } catch (error) {
    console.error('Fetch habit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch habit data.' });
  }
};

// PUT /api/habits — Update today's habit log
export const updateHabit = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const { mealsTracked, waterIntake, workoutCompleted, sleepHours, stepsCount } = req.body;

    const updateFields = {};
    if (mealsTracked !== undefined) updateFields.mealsTracked = Number(mealsTracked);
    if (waterIntake !== undefined) updateFields.waterIntake = Number(waterIntake);
    if (workoutCompleted !== undefined) updateFields.workoutCompleted = Boolean(workoutCompleted);
    if (sleepHours !== undefined) updateFields.sleepHours = Number(sleepHours);
    if (stepsCount !== undefined) updateFields.stepsCount = Number(stepsCount);

    const habit = await Habit.findOneAndUpdate(
      { userId: req.user._id, date: todayStr },
      { $set: updateFields },
      { upsert: true, new: true, runValidators: true }
    );

    const streak = await calculateStreak(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Habits updated.',
      data: { habit, streak },
    });
  } catch (error) {
    console.error('Update habit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update habit.' });
  }
};
