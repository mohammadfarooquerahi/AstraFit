import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Groq from 'groq-sdk';

// ─── Groq Provider (Llama 3.3 70B - Ultra Fast) ────────────
const callGroq = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('your_groq_key') || apiKey === 'dummy_key') {
    throw new Error('MISSING_KEY');
  }

  const groq = new Groq({ apiKey });
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.choices[0]?.message?.content || '';
  const usage = {
    promptTokens: response.usage?.prompt_tokens || 0,
    completionTokens: response.usage?.completion_tokens || 0,
  };
  return { text, usage };
};

// ─── Gemini Provider ────────────────────────────────────────
const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_gemini_key') || apiKey === 'dummy_key') {
    throw new Error('MISSING_KEY');
  }

  const gemini = new GoogleGenerativeAI(apiKey);
  const model = gemini.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const usage = {
    promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
    completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
  };
  return { text, usage };
};

// ─── OpenAI Provider ────────────────────────────────────────
const callOpenAI = async (prompt) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('your_openai_key') || apiKey === 'dummy_key') {
    throw new Error('MISSING_KEY');
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  const text = response.choices[0].message.content;
  const usage = {
    promptTokens: response.usage?.prompt_tokens || 0,
    completionTokens: response.usage?.completion_tokens || 0,
  };
  return { text, usage };
};

// ─── Fallback Generators for Instant Offline / Demo mode ────
const getFallbackDietPlan = () => ({
  dailyCalories: 2450,
  macros: { protein: 155, carbs: 260, fat: 70 },
  waterIntakeLiters: 3.5,
  bmi: '23.5',
  summary: 'Customized high-energy nutrition plan optimized for balanced metabolism and active muscle recovery.',
  days: [
    {
      day: 'Monday',
      totalCalories: 2450,
      meals: [
        { type: 'Breakfast', name: 'Oatmeal & Protein Scramble', description: 'Rolled oats cooked in almond milk with 4 scrambled eggs and berries.', ingredients: ['100g Oats', '4 Eggs', '50g Blueberries', '1 tbsp Honey'], calories: 620, protein: 38, carbs: 70, fat: 18 },
        { type: 'Snack 1', name: 'Greek Yogurt & Almonds', description: 'Low-fat Greek yogurt with raw almonds and chia seeds.', ingredients: ['200g Greek Yogurt', '25g Almonds', '1 tbsp Chia seeds'], calories: 340, protein: 24, carbs: 18, fat: 14 },
        { type: 'Lunch', name: 'Grilled Chicken Bowl', description: '200g grilled chicken breast with quinoa and steamed broccoli.', ingredients: ['200g Chicken breast', '150g Quinoa', '100g Broccoli'], calories: 710, protein: 54, carbs: 65, fat: 14 },
        { type: 'Snack 2', name: 'Whey Protein Shake', description: '1 scoop whey protein blended with 1 banana and water.', ingredients: ['1 scoop Whey Protein', '1 Banana', '300ml Water'], calories: 240, protein: 26, carbs: 28, fat: 2 },
        { type: 'Dinner', name: 'Baked Salmon & Sweet Potato', description: '180g Atlantic salmon fillet with roasted sweet potato wedges.', ingredients: ['180g Salmon fillet', '200g Sweet potato', 'Mixed greens'], calories: 540, protein: 42, carbs: 45, fat: 18 },
      ],
    },
    {
      day: 'Tuesday',
      totalCalories: 2400,
      meals: [
        { type: 'Breakfast', name: 'Avocado Toast & Eggs', description: '2 whole grain toasts with mashed avocado and 3 poached eggs.', ingredients: ['2 slices Whole grain bread', '1/2 Avocado', '3 Eggs'], calories: 550, protein: 28, carbs: 40, fat: 24 },
        { type: 'Lunch', name: 'Turkey Breast Wrap', description: 'Whole wheat wrap filled with lean turkey, hummus, and spinach.', ingredients: ['180g Turkey breast', '1 Wheat wrap', '2 tbsp Hummus', 'Spinach'], calories: 680, protein: 48, carbs: 60, fat: 16 },
        { type: 'Dinner', name: 'Lean Beef Stir-Fry', description: 'Lean beef strips stir-fried with bell peppers and brown rice.', ingredients: ['180g Lean beef', '150g Brown rice', 'Mixed bell peppers'], calories: 610, protein: 45, carbs: 55, fat: 18 },
      ],
    },
    {
      day: 'Wednesday',
      totalCalories: 2450,
      meals: [
        { type: 'Breakfast', name: 'Egg White Omelet & Toast', description: '5 egg white omelet with mushrooms, spinach, and toast.', ingredients: ['5 Egg whites', '1 Whole egg', '100g Mushrooms', '2 Slices toast'], calories: 520, protein: 36, carbs: 45, fat: 12 },
        { type: 'Lunch', name: 'Tuna & Chickpea Salad', description: 'Canned tuna fish mixed with chickpeas, olive oil, and lemon.', ingredients: ['180g Tuna', '150g Chickpeas', '1 tbsp Olive oil', 'Cucumber'], calories: 650, protein: 50, carbs: 50, fat: 16 },
        { type: 'Dinner', name: 'Chicken Breast Curry', description: 'Lean chicken cooked in mild tomato curry sauce with basmati rice.', ingredients: ['200g Chicken breast', '150g Basmati rice', 'Tomato onion gravy'], calories: 690, protein: 52, carbs: 70, fat: 14 },
      ],
    },
  ],
});

const getFallbackWorkoutPlan = () => ({
  title: 'Hypertrophy 7-Day Training Split',
  splitType: 'Push / Pull / Legs',
  difficulty: 'intermediate',
  summary: 'A balanced progressive overload program designed to maximize muscle strength and endurance.',
  warmupTips: '5-10 mins light incline treadmill walk followed by arm circles and dynamic shoulder mobility drills.',
  cooldownTips: '5 mins static stretching targeting chest, lats, quads, and hamstrings.',
  schedule: [
    {
      day: 'Monday',
      focus: 'Push (Chest, Shoulders, Triceps)',
      isRestDay: false,
      estimatedMinutes: 60,
      exercises: [
        { name: 'Incline Dumbbell Bench Press', muscleGroup: 'Chest', sets: 4, reps: '8-10', restSeconds: 90, tips: 'Control tempo on lowering phase and squeeze chest at top.' },
        { name: 'Barbell Flat Bench Press', muscleGroup: 'Chest', sets: 3, reps: '8-12', restSeconds: 90, tips: 'Keep feet planted firmly and touch lower chest.' },
        { name: 'Seated Overhead Dumbbell Press', muscleGroup: 'Shoulders', sets: 4, reps: '10-12', restSeconds: 60, tips: 'Avoid arching lower back excessively.' },
        { name: 'Lateral Cable Raises', muscleGroup: 'Side Delts', sets: 4, reps: '12-15', restSeconds: 60, tips: 'Lead movement with elbows.' },
        { name: 'Triceps Rope Pushdowns', muscleGroup: 'Triceps', sets: 3, reps: '12-15', restSeconds: 45, tips: 'Spread rope ends at bottom extension.' },
      ],
    },
    {
      day: 'Tuesday',
      focus: 'Pull (Back, Rear Delts, Biceps)',
      isRestDay: false,
      estimatedMinutes: 60,
      exercises: [
        { name: 'Wide-Grip Lat Pulldowns', muscleGroup: 'Lats', sets: 4, reps: '10-12', restSeconds: 90, tips: 'Drive elbows straight down to ribcage.' },
        { name: 'Seated Cable Rows', muscleGroup: 'Mid Back', sets: 4, reps: '10-12', restSeconds: 60, tips: 'Squeeze shoulder blades together at peak.' },
        { name: 'Face Pulls', muscleGroup: 'Rear Delts', sets: 3, reps: '15-20', restSeconds: 45, tips: 'Pull rope high towards upper forehead.' },
        { name: 'EZ-Bar Bicep Curls', muscleGroup: 'Biceps', sets: 4, reps: '10-12', restSeconds: 60, tips: 'Keep upper arms fixed against body.' },
      ],
    },
    {
      day: 'Wednesday',
      focus: 'Legs & Core',
      isRestDay: false,
      estimatedMinutes: 65,
      exercises: [
        { name: 'Barbell Back Squats', muscleGroup: 'Quads / Glutes', sets: 4, reps: '6-8', restSeconds: 120, tips: 'Keep chest upright and drive out of hole.' },
        { name: 'Romanian Deadlifts', muscleGroup: 'Hamstrings', sets: 4, reps: '8-10', restSeconds: 90, tips: 'Push hips back until hamstrings stretch.' },
        { name: 'Leg Extensions', muscleGroup: 'Quads', sets: 3, reps: '12-15', restSeconds: 60, tips: 'Pause for 1 second at full knee extension.' },
      ],
    },
    {
      day: 'Thursday',
      focus: 'Active Rest / Recovery',
      isRestDay: true,
      estimatedMinutes: 0,
      exercises: [],
    },
  ],
});

// ─── Unified AI Call with Groq Support ──────────────────────
export const callAI = async (prompt) => {
  const provider = process.env.ACTIVE_AI_PROVIDER || 'groq';
  const start = Date.now();

  try {
    let result;
    if (provider === 'groq') {
      result = await callGroq(prompt);
    } else if (provider === 'openai') {
      result = await callOpenAI(prompt);
    } else {
      result = await callGemini(prompt);
    }
    const latency = Date.now() - start;
    return { ...result, provider, latency };
  } catch (err) {
    console.warn(`⚠️ AI Call using provider '${provider}' failed (${err.message}). Using intelligent fallback response.`);

    let fallbackData;
    if (prompt.includes('nutritionist') || prompt.includes('diet plan')) {
      fallbackData = JSON.stringify(getFallbackDietPlan());
    } else if (prompt.includes('fitness coach') || prompt.includes('workout plan')) {
      fallbackData = JSON.stringify(getFallbackWorkoutPlan());
    } else {
      fallbackData = 'I am your AstraFit AI Fitness Coach powered by Groq Llama-3! To maximize your muscle gains and energy, ensure you stay consistent with your 2450 kcal meal plan and 3-day training split. Keep up the great work!';
    }

    return {
      text: fallbackData,
      usage: { promptTokens: 100, completionTokens: 200 },
      provider: `${provider}-fallback`,
      latency: Date.now() - start,
    };
  }
};

// ─── Safe JSON Parser ────────────────────────────────────────
export const parseAIJson = (text) => {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('AI response was not valid JSON');
  }
};
