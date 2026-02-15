import type { NutritionEstimate } from "@/types";

const OFF_BASE = "https://world.openfoodfacts.org/api/v2";

export async function lookupBarcode(
  barcode: string
): Promise<NutritionEstimate | null> {
  try {
    const res = await fetch(`${OFF_BASE}/product/${barcode}.json`);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== 1 || !data.product) return null;

    const product = data.product;
    const nutrients = product.nutriments || {};

    return {
      foodName:
        product.product_name || product.generic_name || "Unknown Product",
      calories: nutrients["energy-kcal_100g"] || nutrients["energy-kcal"] || 0,
      protein: nutrients.proteins_100g || nutrients.proteins || 0,
      carbs: nutrients.carbohydrates_100g || nutrients.carbohydrates || 0,
      fat: nutrients.fat_100g || nutrients.fat || 0,
      fiber: nutrients.fiber_100g || nutrients.fiber || 0,
      isEstimate: false,
      servingSizeGrams: product.serving_quantity ?? 100,
      householdServingText: product.serving_size,
      nutrientsPer100g: true,
    };
  } catch (error) {
    console.error("Open Food Facts lookup error:", error);
    return null;
  }
}
