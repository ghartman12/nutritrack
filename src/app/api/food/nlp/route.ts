import { NextRequest, NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query string is required" },
        { status: 400 }
      );
    }

    const llm = getLLMProvider();
    const variations = body.variations === true;

    if (variations) {
      const results = await llm.estimateNutritionVariations(query);
      console.log("NLP variations:", JSON.stringify(results));
      return NextResponse.json(results);
    }

    const estimate = await llm.estimateNutrition(query);
    console.log("NLP estimate:", JSON.stringify(estimate));
    return NextResponse.json(estimate);
  } catch (error: any) {
    console.error("Failed to estimate nutrition:", error?.message, error?.status, error);
    return NextResponse.json(
      { error: "Something went wrong estimating nutrition. Please try again or enter manually." },
      { status: 500 }
    );
  }
}
