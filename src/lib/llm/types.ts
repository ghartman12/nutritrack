import type {
  NutritionEstimate,
  FoodSearchResult,
  UserData,
  WeekLogs,
  OnboardingData,
} from "@/types";

export interface LLMProvider {
  generateWeeklyDigest(
    userData: UserData,
    weekLogs: WeekLogs
  ): Promise<string>;
  estimateCaloriesBurned(
    activity: string,
    durationMinutes: number,
    activityLevel: string
  ): Promise<number>;
  estimateNutrition(description: string): Promise<NutritionEstimate>;
  estimateNutritionVariations(description: string): Promise<FoodSearchResult[]>;
  generateWelcomeMessage(onboardingData: OnboardingData): Promise<string>;
  generateEmptyStateMessage(onboardingData: OnboardingData): Promise<string>;
}
