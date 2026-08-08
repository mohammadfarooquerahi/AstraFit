/**
 * Build structured prompt for AI workout plan generation
 */
export const buildWorkoutPrompt = (profile) => {
  return `You are an expert fitness coach & strength specialist. Generate a customized, structured 7-day weekly workout plan in JSON format.

USER PROFILE:
- Age: ${profile.age} years
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- Activity Level: ${profile.activityLevel}
- Experience Level: ${profile.fitnessExperience}
- Primary Goal: ${profile.goal}
- Environment: ${profile.workoutEnvironment} (Home/Gym/Both)

STRICT INSTRUCTIONS:
1. Choose an optimal split (e.g. "Push / Pull / Legs", "Upper / Lower Split", or "Full Body Circuit") suited for the user's experience and goal.
2. Provide a 7-day schedule (Monday to Sunday). Include 1-2 designated Rest Days.
3. For workout days, include 4-6 specific exercises tailored to their environment (${profile.workoutEnvironment}).
4. If environment is 'Home', specify bodyweight or dumbbell exercises. If 'Gym', include barbell/machine options.
5. Provide realistic sets, reps (e.g., "8-12" or "30 sec"), rest interval in seconds, muscle group, and 1 execution tip.
6. Provide concise warmup and cooldown recommendations.

RESPOND WITH ONLY a valid JSON object matching this exact structure:
{
  "title": "Workout plan title",
  "splitType": "Split type name",
  "difficulty": "${profile.fitnessExperience}",
  "summary": "Brief 2-sentence explanation of why this split was chosen for the user",
  "warmupTips": "Dynamic warmup advice",
  "cooldownTips": "Post-workout recovery advice",
  "schedule": [
    {
      "day": "Monday",
      "focus": "Chest, Shoulders & Triceps",
      "isRestDay": false,
      "estimatedMinutes": 50,
      "exercises": [
        {
          "name": "Barbell Bench Press",
          "muscleGroup": "Chest",
          "sets": 4,
          "reps": "8-10",
          "restSeconds": 90,
          "tips": "Keep shoulder blades retracted and drive feet into floor."
        }
      ]
    },
    {
      "day": "Sunday",
      "focus": "Active Recovery / Rest",
      "isRestDay": true,
      "estimatedMinutes": 0,
      "exercises": []
    }
  ]
}`;
};
