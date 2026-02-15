import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider } from "./types";
import type {
  NutritionEstimate,
  FoodSearchResult,
  UserData,
  WeekLogs,
  OnboardingData,
} from "@/types";
import {
  nutritionEstimatePrompt,
  nutritionVariationsPrompt,
  calorieEstimatePrompt,
  weeklyDigestPrompt,
  welcomeMessagePrompt,
  emptyStateMessagePrompt,
} from "./prompts";

const client = new Anthropic();
const MODEL = "claude-sonnet-4-5-20250929";

async function ask(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

export class ClaudeProvider implements LLMProvider {
  async generateWeeklyDigest(
    userData: UserData,
    weekLogs: WeekLogs
  ): Promise<string> {
    try {
      return await ask(weeklyDigestPrompt(userData, weekLogs));
    } catch {
      return "Another week in the books! You're building great habits by tracking consistently.";
    }
  }

  async estimateCaloriesBurned(
    activity: string,
    durationMinutes: number,
    activityLevel: string
  ): Promise<number> {
    try {
      const response = await ask(
        calorieEstimatePrompt(activity, durationMinutes, activityLevel)
      );
      const parsed = parseInt(response.trim(), 10);
      return isNaN(parsed) ? Math.round(durationMinutes * 5) : parsed;
    } catch {
      return Math.round(durationMinutes * 5);
    }
  }

  async estimateNutrition(description: string): Promise<NutritionEstimate> {
    try {
      const response = await ask(nutritionEstimatePrompt(description));
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found");
      const parsed = JSON.parse(jsonMatch[0]);
      const quantity = Number(parsed.quantity) || 1;
      const servingSizeGrams = Number(parsed.servingSizeGrams) || 100;
      return {
        foodName: parsed.foodName || description,
        calories: Number(parsed.calories) || 0,
        protein: Number(parsed.protein) || 0,
        carbs: Number(parsed.carbs) || 0,
        fat: Number(parsed.fat) || 0,
        fiber: Number(parsed.fiber) || 0,
        isEstimate: true,
        quantity,
        servingSizeGrams,
        householdServingText: parsed.householdServingText || undefined,
        nutrientsPer100g: true,
      };
    } catch {
      throw new Error(
        "Could not estimate nutrition. Try being more specific or use manual entry."
      );
    }
  }

  async estimateNutritionVariations(description: string): Promise<FoodSearchResult[]> {
    try {
      const response = await ask(nutritionVariationsPrompt(description));
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No JSON array found");
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((item: any) => ({
        foodName: item.foodName || description,
        calories: Number(item.calories) || 0,
        protein: Number(item.protein) || 0,
        carbs: Number(item.carbs) || 0,
        fat: Number(item.fat) || 0,
        fiber: Number(item.fiber) || 0,
        source: "ai" as const,
        servingSizeGrams: Number(item.servingSizeGrams) || 100,
        householdServingText: item.householdServingText || undefined,
        nutrientsPer100g: true,
      }));
    } catch {
      throw new Error("Could not generate variations. Try being more specific or use manual entry.");
    }
  }

  async generateWelcomeMessage(
    onboardingData: OnboardingData
  ): Promise<string> {
    try {
      return await ask(welcomeMessagePrompt(onboardingData));
    } catch {
      return `Welcome to NutriTrack! You're all set with a ${onboardingData.calorieGoal} calorie daily goal. Start by logging your most recent meal — just type what you ate!`;
    }
  }

  async generateEmptyStateMessage(
    onboardingData: OnboardingData
  ): Promise<string> {
    try {
      return await ask(emptyStateMessagePrompt(onboardingData));
    } catch {
      return "Ready to start tracking? Log your first meal to see your progress!";
    }
  }
}
