import type { UserData, WeekLogs, OnboardingData } from "@/types";

export function nutritionEstimatePrompt(description: string): string {
  return `You are a nutrition expert. Estimate the nutritional content for the following food description. Be as accurate as possible based on typical serving sizes.

Food description: "${description}"

Respond with ONLY a JSON object in this exact format, no other text:
{
  "foodName": "cleaned up name for ONE unit/serving (e.g. 'Egg' not '2 Eggs')",
  "quantity": number (how many units/servings detected, default 1),
  "calories": number (per 100g of this food),
  "protein": number in grams (per 100g),
  "carbs": number in grams (per 100g),
  "fat": number in grams (per 100g),
  "fiber": number in grams (per 100g),
  "servingSizeGrams": number (estimated weight of ONE typical serving in grams, e.g. 50 for one egg, 120 for a chicken breast),
  "householdServingText": "human-readable serving description (e.g. '1 large egg', '1 breast', '1 cup cooked')"
}

IMPORTANT:
- ALL nutrient values must be per 100g of the food, NOT per serving.
- "servingSizeGrams" is the estimated weight of ONE typical serving/unit in grams.
- If the description mentions a quantity (e.g. "2 eggs", "3 slices of bread"), set "quantity" to that number. servingSizeGrams should be for ONE unit.
- If no quantity is mentioned, set quantity to 1.
- For mixed meals (e.g. "eggs and toast"), set quantity to 1, estimate a combined serving weight, and provide per-100g values for the combined dish.`;
}

export function nutritionVariationsPrompt(description: string): string {
  return `You are a nutrition expert. For the following food description, generate 3-4 common variations of how this food is typically prepared or served. For each variation, estimate the nutritional content per 100g.

Food description: "${description}"

Respond with ONLY a JSON array in this exact format, no other text:
[
  {
    "foodName": "Variation name (e.g. 'Chicken Breast, Grilled')",
    "calories": number (per 100g),
    "protein": number in grams (per 100g),
    "carbs": number in grams (per 100g),
    "fat": number in grams (per 100g),
    "fiber": number in grams (per 100g),
    "servingSizeGrams": number (typical serving weight in grams),
    "householdServingText": "human-readable serving (e.g. '1 breast', '1 cup')"
  }
]

IMPORTANT:
- Generate 3-4 distinct, common variations (e.g. for "chicken breast": raw, grilled, baked, fried)
- ALL nutrient values must be per 100g
- Each variation should have meaningfully different nutritional values
- Use clear, descriptive names that distinguish each variation`;
}

export function calorieEstimatePrompt(
  activity: string,
  durationMinutes: number,
  activityLevel: string
): string {
  return `Estimate calories burned for the following exercise. Consider the person's general activity level.

Activity: ${activity}
Duration: ${durationMinutes} minutes
Person's activity level: ${activityLevel}

Respond with ONLY a single number representing estimated calories burned. No other text.`;
}

export function weeklyDigestPrompt(
  userData: UserData,
  weekLogs: WeekLogs
): string {
  const daysLogged = weekLogs.days.filter((d) => d.foods.length > 0).length;
  const exerciseDays = weekLogs.days.filter((d) => d.exercises.length > 0).length;
  const weights = weekLogs.days.filter((d) => d.weight !== undefined).map((d) => d.weight!);

  // Build per-day calorie breakdown
  const dailyCalories = weekLogs.days
    .filter((d) => d.foods.length > 0)
    .map((d) => {
      const cals = Math.round(d.foods.reduce((s, f) => s + f.calories, 0));
      const diff = cals - userData.calorieGoal;
      return `${d.date}: ${cals} cal (${diff >= 0 ? "+" : ""}${diff} vs goal)`;
    })
    .join("\n");

  // Build per-day macro breakdown
  const dailyMacros = weekLogs.days
    .filter((d) => d.foods.length > 0)
    .map((d) => {
      const p = Math.round(d.foods.reduce((s, f) => s + f.protein, 0));
      const c = Math.round(d.foods.reduce((s, f) => s + f.carbs, 0));
      const f = Math.round(d.foods.reduce((s, f) => s + f.fat, 0));
      return `${d.date}: P:${p}g C:${c}g F:${f}g`;
    })
    .join("\n");

  return `You are an expert nutrition coach. Analyze this person's week and provide a detailed, actionable weekly review.

GOALS:
- Calories: ${userData.calorieGoal} cal/day
- Protein: ${userData.proteinTarget}g/day, Carbs: ${userData.carbTarget}g/day, Fat: ${userData.fatTarget}g/day

DAILY CALORIE LOG (${daysLogged}/7 days logged):
${dailyCalories || "No food logged this week."}

DAILY MACRO LOG:
${dailyMacros || "No data."}

EXERCISE: ${exerciseDays} days with exercise, ${weekLogs.totalExerciseMinutes} total minutes

WEIGHT: ${weights.length > 0 ? weights.join(" -> ") + ` ${userData.activityLevel}` : "Not logged this week."}
${weekLogs.weightChange !== undefined ? `Change: ${weekLogs.weightChange > 0 ? "+" : ""}${weekLogs.weightChange.toFixed(1)}` : ""}

${userData.currentStreak > 0 ? `Current logging streak: ${userData.currentStreak} days` : ""}

Write a weekly review covering these areas:
1. CALORIE TRENDS: Which days were over/under goal? Any pattern (weekday vs weekend)?
2. MACRO CONSISTENCY: Are protein/carbs/fat hitting targets consistently or swinging?
3. EXERCISE: Frequency and whether it's consistent through the week.
4. WEIGHT TREND: If logged, note the direction and whether it aligns with goals.
5. TOP SUGGESTION: One specific, actionable change for next week based on the patterns you see.

Keep it to 5-8 sentences. Be warm but specific — reference actual numbers and days. Do not use markdown formatting or bullet points.`;
}

export function welcomeMessagePrompt(data: OnboardingData): string {
  return `You are NutriTrack, a friendly nutrition tracking assistant. Write a personalized welcome message (2-3 sentences) for a new user who just set up their profile.

Their goals: ${data.calorieGoal} calories/day, ${data.proteinTarget}g protein, ${data.carbTarget}g carbs, ${data.fatTarget}g fat
Activity level: ${data.activityLevel}
Weight unit preference: ${data.weightUnit}

Be warm, encouraging, and specific to their goals. Mention one quick tip to get started. Do not use markdown formatting.`;
}

export function emptyStateMessagePrompt(data: OnboardingData): string {
  return `You are NutriTrack, a friendly nutrition tracking assistant. Write a brief motivating message (1-2 sentences) to encourage a user to log their first meal.

Their calorie goal: ${data.calorieGoal} cal/day
Activity level: ${data.activityLevel}

Be encouraging and suggest they start by logging what they had for their most recent meal. Do not use markdown formatting.`;
}
