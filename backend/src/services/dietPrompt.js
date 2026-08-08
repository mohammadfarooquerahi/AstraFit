/**
 * Build a structured prompt for AI diet plan generation
 */
export const buildDietPrompt = (profile) => {
  const bmi = (profile.weight / ((profile.height / 100) ** 2)).toFixed(1);
  const allergyText = profile.allergies?.length
    ? `Allergies to avoid: ${profile.allergies.join(', ')}.`
    : 'No known food allergies.';

  return `You are a certified nutritionist AI. Generate a complete, detailed 7-day personalized diet plan in JSON format.

USER PROFILE:
- Age: ${profile.age} years
- Gender: ${profile.gender}
- Height: ${profile.height} cm
- Weight: ${profile.weight} kg
- BMI: ${bmi}
- Activity Level: ${profile.activityLevel}
- Fitness Goal: ${profile.goal}
- Dietary Preference: ${profile.dietaryPreference}
- ${allergyText}

STRICT INSTRUCTIONS:
1. Calculate appropriate daily calories based on the profile.
2. Plan macros: protein, carbohydrates, fats in grams.
3. Include 3 main meals + 2 snacks per day for all 7 days.
4. Each meal must have: name, description, ingredients (with quantities), calories, protein, carbs, fat.
5. Include daily water intake recommendation in liters.
6. Meals must match the dietary preference strictly (no meat for vegetarian/vegan, etc.).
7. Avoid all allergens listed above.
8. Use Pakistani/South Asian food options where appropriate.

RESPOND WITH ONLY a valid JSON object in this exact structure:
{
  "dailyCalories": number,
  "macros": { "protein": number, "carbs": number, "fat": number },
  "waterIntakeLiters": number,
  "bmi": "${bmi}",
  "summary": "brief 2-sentence plan overview",
  "days": [
    {
      "day": "Monday",
      "totalCalories": number,
      "meals": [
        {
          "type": "Breakfast|Lunch|Dinner|Snack 1|Snack 2",
          "name": "Meal name",
          "description": "Brief description",
          "ingredients": ["200g chicken breast", "1 cup rice", "..."],
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      ]
    }
  ]
}`;
};
