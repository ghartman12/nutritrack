import { NextRequest, NextResponse } from "next/server";
import { searchUSDA } from "@/lib/api/usda";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search custom foods and USDA in parallel
    const [customFoods, usdaResults] = await Promise.all([
      prisma.customFood.findMany({
        where: {
          userId: DEFAULT_USER_ID,
          foodName: { contains: query },
        },
      }),
      searchUSDA(query),
    ]);

    const customResults = customFoods.map((f) => ({
      foodName: f.foodName,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fat: f.fat,
      fiber: f.fiber ?? 0,
      source: "custom" as const,
      householdServingText: f.servingSize,
    }));

    return NextResponse.json([...customResults, ...usdaResults]);
  } catch (error) {
    console.error("Failed to search food:", error);
    return NextResponse.json(
      { error: "Failed to search food database" },
      { status: 500 }
    );
  }
}
