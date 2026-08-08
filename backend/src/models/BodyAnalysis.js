import mongoose from 'mongoose';

const bodyAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    bmi: {
      type: Number,
      required: true,
    },
    postureScore: {
      type: Number, // 0 to 100 percentage
      min: 0,
      max: 100,
    },
    poseAlignment: {
      type: String,
      default: 'Good',
    },
    landmarkPositions: {
      type: Map,
      of: [Number], // e.g. "left_shoulder": [x, y, z]
    },
    poseIndicators: {
      shoulderAlignment: {
        type: String,
        enum: ['level', 'left-tilted', 'right-tilted'],
        default: 'level',
      },
      hipAlignment: {
        type: String,
        enum: ['level', 'left-tilted', 'right-tilted'],
        default: 'level',
      },
      forwardHeadPosture: {
        type: Boolean,
        default: false,
      },
      roundedShoulders: {
        type: Boolean,
        default: false,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const BodyAnalysis = mongoose.model('BodyAnalysis', bodyAnalysisSchema);
export default BodyAnalysis;
