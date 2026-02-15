export interface NutritionEstimate {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isEstimate: boolean;
  quantity?: number;
  servingSizeGrams?: number;
  householdServingText?: string;
  nutrientsPer100g?: boolean;
}

export interface FoodSearchResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  source: "usda" | "openfoodfacts" | "ai";
  fdcId?: number;
  servingSizeGrams?: number;
  householdServingText?: string;
  nutrientsPer100g?: boolean;
}

export interface OnboardingData {
  calorieGoal: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  weightUnit: string;
  activityLevel: string;
}

export interface DayLogs {
  date: string;
  foods: {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    mealType: string;
  }[];
  exercises: {
    activity: string;
    durationMinutes: number;
    estimatedCalories: number;
  }[];
  weight?: number;
}

export interface WeekLogs {
  days: DayLogs[];
  averageCalories: number;
  totalExerciseMinutes: number;
  weightChange?: number;
}

export interface UserData {
  calorieGoal: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  activityLevel: string;
  currentStreak: number;
}
