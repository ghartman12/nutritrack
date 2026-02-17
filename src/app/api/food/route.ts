import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserId } from "@/lib/db";
import { startOfDay, endOfDay } from "@/lib/utils";
import { updateStreak } from "@/lib/streak";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

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
        userId: userId,
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
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 401 }
      );
    }

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
        userId: userId,
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

    const streakResult = await updateStreak(userId);

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
