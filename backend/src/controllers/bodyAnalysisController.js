import { BodyAnalysis, Profile } from '../models/index.js';

// POST /api/body-analysis — Save posture & vision analysis report
export const saveAnalysis = async (req, res) => {
  try {
    const { postureScore, poseAlignment, poseIndicators, landmarkPositions, notes } = req.body;
    const profile = await Profile.findOne({ userId: req.user._id });

    const bmi = profile ? +(profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : 23.0;

    const analysis = await BodyAnalysis.create({
      userId: req.user._id,
      bmi,
      postureScore: postureScore || 85,
      poseAlignment: poseAlignment || 'Balanced',
      poseIndicators: poseIndicators || {
        shoulderAlignment: 'level',
        hipAlignment: 'level',
        forwardHeadPosture: false,
        roundedShoulders: false,
      },
      landmarkPositions: landmarkPositions || {},
      notes: notes || 'Analysis conducted via computer vision MediaPipe pose detector.',
    });

    return res.status(201).json({
      success: true,
      message: 'Body analysis report saved successfully.',
      data: { analysis },
    });
  } catch (error) {
    console.error('Body analysis save error:', error);
    return res.status(500).json({ success: false, message: 'Failed to save analysis report.' });
  }
};

// GET /api/body-analysis — Get user's latest analysis report
export const getAnalysis = async (req, res) => {
  try {
    const analysis = await BodyAnalysis.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    const profile = await Profile.findOne({ userId: req.user._id });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: 'No body analysis report found yet.',
      });
    }

    return res.status(200).json({ success: true, data: { analysis, profile } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch analysis report.' });
  }
};
