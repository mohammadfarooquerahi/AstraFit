import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: { type: String },
  quantity: { type: String },
}, { _id: false });

const mealSchema = new mongoose.Schema({
  type: { type: String }, // Breakfast, Lunch, Dinner, Snack 1, Snack 2
  name: { type: String },
  description: { type: String },
  ingredients: { type: [String], default: [] },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
}, { _id: false });

const daySchema = new mongoose.Schema({
  day: { type: String },
  totalCalories: { type: Number, default: 0 },
  meals: { type: [mealSchema], default: [] },
}, { _id: false });

const dietPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dailyCalories: { type: Number, default: 0 },
    macros: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
    },
    waterIntakeLiters: { type: Number, default: 2.5 },
    bmi: { type: String },
    summary: { type: String },
    days: { type: [daySchema], default: [] },
    generatedAt: { type: Date, default: Date.now },
    isAIGenerated: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    safetyDisclaimer: {
      type: String,
      default: 'This AI-generated plan is for general fitness guidance only — not medical advice.',
    },
  },
  { timestamps: true }
);

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);
export default DietPlan;
