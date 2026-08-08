import { User, Profile, DietPlan, WorkoutPlan } from '../models/index.js';

export const seedDemoUser = async () => {
  try {
    const demoEmail = 'farooq@gmail.com';
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: 'Farooq Rahi',
        email: demoEmail,
        password: 'password123',
        role: 'user',
        status: 'active',
      });
      console.log('🌱 Seeded demo user account: farooq@gmail.com / password123');
    }

    // Seed demo admin account
    const adminEmail = 'admin@astrafit.com';
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        status: 'active',
      });
      console.log('🌱 Seeded demo admin account: admin@astrafit.com / admin123');
    }

    // Seed profile if not exists
    let profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      profile = await Profile.create({
        userId: user._id,
        age: 24,
        gender: 'male',
        height: 175,
        weight: 72,
        activityLevel: 'moderately_active',
        fitnessExperience: 'intermediate',
        goal: 'Muscle Building',
        dietaryPreference: 'Non-Vegetarian',
        allergies: ['Peanuts'],
        workoutEnvironment: 'Gym',
      });
      console.log('🌱 Seeded demo user fitness profile');
    }

    // Seed sample AI diet plan if not exists
    let dietPlan = await DietPlan.findOne({ userId: user._id });
    if (!dietPlan) {
      await DietPlan.create({
        userId: user._id,
        dailyCalories: 2600,
        macros: { protein: 160, carbs: 280, fat: 75 },
        waterIntakeLiters: 3.5,
        bmi: '23.5',
        summary: 'High protein muscle building meal plan tailored for gym performance.',
        days: [
          {
            day: 'Monday',
            totalCalories: 2600,
            meals: [
              { type: 'Breakfast', name: 'Oatmeal & Eggs', description: '4 egg whites, 2 whole eggs, 100g oats with banana & honey', ingredients: ['100g oats', '6 eggs', '1 banana', '1 tbsp honey'], calories: 650, protein: 42, carbs: 75, fat: 18 },
              { type: 'Snack 1', name: 'Protein Shake & Almonds', description: 'Whey protein shake with 30g almonds', ingredients: ['1 scoop whey protein', '30g almonds', '250ml milk'], calories: 380, protein: 34, carbs: 18, fat: 16 },
              { type: 'Lunch', name: 'Grilled Chicken & Rice', description: '200g grilled chicken breast with 1.5 cups brown rice and steamed veggies', ingredients: ['200g chicken breast', '200g cooked brown rice', '100g mixed veggies'], calories: 720, protein: 55, carbs: 80, fat: 12 },
              { type: 'Snack 2', name: 'Greek Yogurt & Berries', description: '200g Greek yogurt topped with fresh blueberries', ingredients: ['200g low-fat Greek yogurt', '50g blueberries'], calories: 220, protein: 20, carbs: 22, fat: 4 },
              { type: 'Dinner', name: 'Beef Mince & Sweet Potato', description: '180g lean beef mince with baked sweet potato and salad', ingredients: ['180g lean beef mince', '200g sweet potato', 'Green salad'], calories: 630, protein: 46, carbs: 55, fat: 20 },
            ],
          },
          {
            day: 'Tuesday',
            totalCalories: 2550,
            meals: [
              { type: 'Breakfast', name: 'Scrambled Eggs on Whole Wheat Toast', description: '4 eggs scrambled with spinach on 2 slices toast', ingredients: ['4 eggs', '2 slices wheat bread', '1 cup spinach'], calories: 580, protein: 36, carbs: 45, fat: 22 },
              { type: 'Lunch', name: 'Chicken Biryani (Lean)', description: 'Homemade lean chicken biryani with raita', ingredients: ['200g chicken', '1.5 cups basmati rice', '100g low-fat yogurt'], calories: 750, protein: 52, carbs: 85, fat: 16 },
              { type: 'Dinner', name: 'Fish Curry & Quinoa', description: '200g fish fillet curry with cooked quinoa', ingredients: ['200g white fish', '150g quinoa', 'Curry spices & tomato'], calories: 610, protein: 48, carbs: 60, fat: 14 },
            ],
          },
        ],
        generatedAt: new Date(),
        isAIGenerated: true,
        isActive: true,
      });
      console.log('🌱 Seeded demo AI diet plan');
    }

    // Seed sample AI workout plan if not exists
    let workoutPlan = await WorkoutPlan.findOne({ userId: user._id });
    if (!workoutPlan) {
      await WorkoutPlan.create({
        userId: user._id,
        title: 'Hypertrophy Push / Pull / Legs Split',
        splitType: 'Push / Pull / Legs',
        difficulty: 'intermediate',
        summary: 'Designed for optimal muscle growth with progressive overload focus.',
        warmupTips: '5-10 mins light incline treadmill walk followed by arm circles and band pull-aparts.',
        cooldownTips: '5 mins static stretching for target muscle groups worked.',
        schedule: [
          {
            day: 'Monday',
            focus: 'Push (Chest, Shoulders, Triceps)',
            isRestDay: false,
            estimatedMinutes: 60,
            exercises: [
              { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 4, reps: '8-10', restSeconds: 90, tips: 'Control negative motion and squeeze at peak contraction.' },
              { name: 'Barbell Flat Bench Press', muscleGroup: 'Chest', sets: 3, reps: '8-12', restSeconds: 90, tips: 'Touch lower chest gently, drive through heels.' },
              { name: 'Seated Dumbbell Shoulder Press', muscleGroup: 'Shoulders', sets: 4, reps: '10-12', restSeconds: 60, tips: 'Avoid flaring elbows out excessively.' },
              { name: 'Lateral Cable Raises', muscleGroup: 'Shoulders', sets: 4, reps: '12-15', restSeconds: 60, tips: 'Lead with elbows to isolate side delts.' },
              { name: 'Triceps Rope Pushdowns', muscleGroup: 'Triceps', sets: 3, reps: '12-15', restSeconds: 45, tips: 'Spread rope handles apart at bottom.' },
            ],
          },
          {
            day: 'Tuesday',
            focus: 'Pull (Back, Rear Delts, Biceps)',
            isRestDay: false,
            estimatedMinutes: 60,
            exercises: [
              { name: 'Lat Pulldowns', muscleGroup: 'Lats / Back', sets: 4, reps: '10-12', restSeconds: 90, tips: 'Pull bar to upper chest using lats, not momentum.' },
              { name: 'Seated Cable Rows', muscleGroup: 'Mid-Back', sets: 4, reps: '10-12', restSeconds: 60, tips: 'Keep torso upright and squeeze shoulder blades.' },
              { name: 'Face Pulls', muscleGroup: 'Rear Delts', sets: 3, reps: '15-20', restSeconds: 45, tips: 'Pull rope toward eyes, rotating hands outwards.' },
              { name: 'EZ-Bar Bicep Curls', muscleGroup: 'Biceps', sets: 4, reps: '10-12', restSeconds: 60, tips: 'Keep elbows locked at sides throughout set.' },
            ],
          },
          {
            day: 'Wednesday',
            focus: 'Legs & Core',
            isRestDay: false,
            estimatedMinutes: 65,
            exercises: [
              { name: 'Barbell Back Squats', muscleGroup: 'Quads / Glutes', sets: 4, reps: '6-8', restSeconds: 120, tips: 'Break at hips first, keep chest lifted.' },
              { name: 'Romanian Deadlifts', muscleGroup: 'Hamstrings / Glutes', sets: 4, reps: '8-10', restSeconds: 90, tips: 'Hinge at hips, feel deep stretch in hamstrings.' },
              { name: 'Leg Press', muscleGroup: 'Quads', sets: 3, reps: '12-15', restSeconds: 60, tips: 'Avoid locking knees at peak extension.' },
              { name: 'Standing Calf Raises', muscleGroup: 'Calves', sets: 4, reps: '15-20', restSeconds: 45, tips: 'Pause for 1 second at top contraction.' },
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
        isAIGenerated: true,
        isActive: true,
      });
      console.log('🌱 Seeded demo AI workout plan');
    }
    // Seed sample progress logs if not exists
    let count = await Progress.countDocuments({ userId: user._id });
    if (count === 0) {
      await Progress.insertMany([
        { userId: user._id, date: '2026-07-10', weight: 75.0, chestSize: 102, waistSize: 86, hipSize: 98, fitnessScore: 65 },
        { userId: user._id, date: '2026-07-17', weight: 74.2, chestSize: 102, waistSize: 85, hipSize: 97, fitnessScore: 68 },
        { userId: user._id, date: '2026-07-24', weight: 73.5, chestSize: 103, waistSize: 84, hipSize: 97, fitnessScore: 72 },
        { userId: user._id, date: '2026-07-31', weight: 72.8, chestSize: 104, waistSize: 83, hipSize: 96, fitnessScore: 78 },
        { userId: user._id, date: '2026-08-07', weight: 72.0, chestSize: 105, waistSize: 82, hipSize: 96, fitnessScore: 84 },
      ]);
      console.log('🌱 Seeded demo user progress history logs');
    }
    // Seed sample chat messages if not exists
    let chatConv = await ChatConversation.findOne({ userId: user._id });
    if (!chatConv) {
      chatConv = await ChatConversation.create({ userId: user._id, title: 'AI Coaching Chat' });
      await ChatMessage.insertMany([
        { conversationId: chatConv._id, sender: 'ai', message: 'Hello Farooq! I am your AstraFit AI Fitness Coach. I have loaded your Hypertrophy Push/Pull/Legs split and your 2600 kcal Diet Plan. How can I help you reach your goals today?' },
        { conversationId: chatConv._id, sender: 'user', message: 'What is the best pre-workout meal for energy?' },
        { conversationId: chatConv._id, sender: 'ai', message: 'A great pre-workout meal combines complex carbohydrates with a moderate amount of fast-digesting protein about 60–90 minutes before training. For example: Oatmeal with 1 scoop whey protein or 4 egg whites and a banana. This will maximize glycogen stores for heavy lifting!' },
      ]);
      console.log('🌱 Seeded demo user chat conversation and coaching history');
    }
    // Seed sample habit log for today if not exists
    const todayStr = new Date().toISOString().split('T')[0];
    let habit = await Habit.findOne({ userId: user._id, date: todayStr });
    if (!habit) {
      await Habit.create({
        userId: user._id,
        date: todayStr,
        mealsTracked: 3,
        mealsTarget: 3,
        waterIntake: 2000,
        waterTarget: 2500,
        workoutCompleted: true,
        sleepHours: 7.5,
        stepsCount: 6400,
        stepsTarget: 8000,
      });
      console.log('🌱 Seeded demo user daily habit record');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

