import { NextRequest, NextResponse } from "next/server";
import { getLLMProvider } from "@/lib/llm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activity, durationMinutes, activityLevel } = body;

    if (!activity || !durationMinutes) {
      return NextResponse.json(
        { error: "Activity and duration are required" },
        { status: 400 }
      );
    }

    const llm = getLLMProvider();
    const calories = await llm.estimateCaloriesBurned(
      activity,
      durationMinutes,
      activityLevel
    );

    return NextResponse.json({ calories });
  } catch (error) {
    console.error("Failed to estimate calories burned:", error);
    return NextResponse.json(
      { error: "Failed to estimate calories burned" },
      { status: 500 }
    );
  }
}
