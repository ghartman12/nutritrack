import type { FoodSearchResult } from "@/types";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

interface USDAFood {
  fdcId: number;
  description: string;
  foodNutrients: {
    nutrientName: string;
    value: number;
  }[];
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
}

function extractNutrient(
  nutrients: USDAFood["foodNutrients"],
  name: string
): number {
  const found = nutrients.find((n) =>
    n.nutrientName.toLowerCase().includes(name.toLowerCase())
  );
  return found?.value ?? 0;
}

function titleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function searchUSDA(query: string): Promise<FoodSearchResult[]> {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    console.warn("USDA_API_KEY not set, skipping USDA search");
    return [];
  }

  try {
    const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=10&api_key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error("USDA search failed:", res.status);
      return [];
    }

    const data = await res.json();
    const foods: USDAFood[] = data.foods || [];

    return foods.map((food) => ({
      foodName: titleCase(food.description),
      calories: extractNutrient(food.foodNutrients, "Energy"),
      protein: extractNutrient(food.foodNutrients, "Protein"),
      carbs: extractNutrient(
        food.foodNutrients,
        "Carbohydrate, by difference"
      ),
      fat: extractNutrient(food.foodNutrients, "Total lipid (fat)"),
      fiber: extractNutrient(food.foodNutrients, "Fiber, total dietary"),
      source: "usda" as const,
      fdcId: food.fdcId,
      servingSizeGrams: food.servingSize ?? 100,
      householdServingText: food.householdServingFullText,
      nutrientsPer100g: true,
    }));
  } catch (error) {
    console.error("USDA search error:", error);
    return [];
  }
}
