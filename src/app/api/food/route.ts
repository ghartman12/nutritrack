import { NextRequest, NextResponse } from "next/server";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";
import { startOfDay, endOfDay } from "@/lib/utils";
import { updateStreak } from "@/lib/streak";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      );
    }

    const date = new Date(dateParam);
    const entries = await prisma.foodEntry.findMany({
      where: {
        userId: DEFAULT_USER_ID,
        date: {
          gte: startOfDay(date),
          lte: endOfDay(date),
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch food entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch food entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      mealType,
      foodName,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      entryMethod,
      isEstimate,
      date: dateStr,
    } = body;

    const entry = await prisma.foodEntry.create({
      data: {
        userId: DEFAULT_USER_ID,
        mealType,
        foodName,
        calories,
        protein,
        carbs,
        fat,
        fiber,
        entryMethod,
        isEstimate,
        ...(dateStr ? { date: new Date(dateStr + "T12:00:00") } : {}),
      },
    });

    const streakResult = await updateStreak();

    return NextResponse.json({
      entry,
      streak: streakResult,
    });
  } catch (error) {
    console.error("Failed to create food entry:", error);
    return NextResponse.json(
      { error: "Failed to create food entry" },
      { status: 500 }
    );
  }
}
