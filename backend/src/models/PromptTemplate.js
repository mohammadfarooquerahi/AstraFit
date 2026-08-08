import mongoose from 'mongoose';

const promptTemplateSchema = new mongoose.Schema(
  {
    promptName: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    content: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index for the version identifier per prompt
promptTemplateSchema.index({ promptName: 1, version: 1 }, { unique: true });

const PromptTemplate = mongoose.model('PromptTemplate', promptTemplateSchema);
export default PromptTemplate;
