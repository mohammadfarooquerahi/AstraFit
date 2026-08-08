import { ProgressPhoto } from '../models/index.js';

// POST /api/progress-photos — Upload a new progress photo
export const uploadPhoto = async (req, res) => {
  try {
    const { weekNumber, viewType, imagePath } = req.body;

    if (!weekNumber || !viewType || !imagePath) {
      return res.status(400).json({
        success: false,
        message: 'Week number, view type, and image path are required.',
      });
    }

    const photo = await ProgressPhoto.findOneAndUpdate(
      { userId: req.user._id, weekNumber: Number(weekNumber), viewType },
      {
        userId: req.user._id,
        weekNumber: Number(weekNumber),
        viewType,
        imagePath,
        moderationStatus: 'Approved', // Auto-approved in dev mode
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Progress photo saved successfully.',
      data: { photo },
    });
  } catch (error) {
    console.error('Progress photo upload error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upload progress photo.' });
  }
};

// GET /api/progress-photos — Get user's progress photos
export const getPhotos = async (req, res) => {
  try {
    const photos = await ProgressPhoto.find({
      userId: req.user._id,
      moderationStatus: { $ne: 'Deleted' },
    }).sort({ weekNumber: 1, createdAt: 1 });

    return res.status(200).json({ success: true, data: { photos } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch progress photos.' });
  }
};

// PUT /api/progress-photos/:id/moderate — Admin photo moderation
export const adminModeratePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['Pending', 'Approved', 'Flagged', 'Deleted'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid moderation status.' });
    }

    const photo = await ProgressPhoto.findByIdAndUpdate(
      id,
      { moderationStatus: status, moderationReason: reason },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Photo status updated to ${status}.`,
      data: { photo },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to moderate photo.' });
  }
};
