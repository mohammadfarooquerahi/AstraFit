import mongoose from 'mongoose';

const progressPhotoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    weekNumber: {
      type: Number,
      required: true,
    },
    imagePath: {
      type: String, // server location or cloud bucket URI
      required: true,
    },
    viewType: {
      type: String,
      required: true,
      enum: ['front', 'back', 'left', 'right'],
    },
    moderationStatus: {
      type: String,
      enum: ['Pending', 'Approved', 'Flagged', 'Deleted'],
      default: 'Pending',
      index: true,
    },
    moderationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compounding unique index to prevent duplicate views for the same week
progressPhotoSchema.index({ userId: 1, weekNumber: 1, viewType: 1 }, { unique: true });

const ProgressPhoto = mongoose.model('ProgressPhoto', progressPhotoSchema);
export default ProgressPhoto;
