import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  mealName: {
    type: String, // e.g. Breakfast, Lunch, Dinner, Snack
    required: true,
  },
  foodItem: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  protein: {
    type: Number, // in grams
    required: true,
  },
  carbs: {
    type: Number, // in grams
    required: true,
  },
  fat: {
    type: Number, // in grams
    required: true,
  },
});

const dietPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dailyCalories: {
      type: Number,
      required: true,
    },
    protein: {
      type: Number, // in grams
      required: true,
    },
    carbs: {
      type: Number, // in grams
      required: true,
    },
    fat: {
      type: Number, // in grams
      required: true,
    },
    meals: {
      type: [mealSchema],
      required: true,
    },
    hydrationTarget: {
      type: Number, // in liters
      required: true,
    },
    allergyRestrictions: {
      type: [String],
      default: [],
    },
    safetyDisclaimer: {
      type: String,
      default: 'This AI-generated plan is for general fitness guidance and is not medical advice. Consult a healthcare professional before starting.',
    },
    isCustomOverride: {
      type: Boolean,
      default: false,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    originalAIPlan: {
      type: String, // Audit trace storing original raw prompt output
    },
  },
  {
    timestamps: true,
  }
);

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export default DietPlan;
