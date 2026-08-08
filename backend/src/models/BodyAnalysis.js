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
      default: 'Symmetric & Level',
    },
    bodyType: {
      type: String, // 'Ectomorph (Skinny / Lean)', 'Mesomorph (Athletic / Muscular)', 'Endomorph (Higher Fat / Solid)', 'Skinny-Fat'
      default: 'Mesomorph (Athletic / Muscular)',
    },
    bodyFatRange: {
      type: String, // e.g. "14% - 17%"
      default: '15% - 18%',
    },
    shoulderToWaistRatio: {
      type: Number, // e.g. 1.35
      default: 1.32,
    },
    symmetryScore: {
      type: Number, // e.g. 96.5%
      default: 96.5,
    },
    uniqueFeatures: [
      {
        type: String,
      },
    ],
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
