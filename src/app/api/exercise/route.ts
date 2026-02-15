import { NextRequest, NextResponse } from "next/server";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";
import { startOfDay, endOfDay } from "@/lib/utils";

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
    const entries = await prisma.exerciseEntry.findMany({
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
    console.error("Failed to fetch exercise entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercise entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activity, durationMinutes, estimatedCalories, isEstimate, notes } =
      body;

    const entry = await prisma.exerciseEntry.create({
      data: {
        userId: DEFAULT_USER_ID,
        activity,
        durationMinutes,
        estimatedCalories,
        isEstimate,
        notes,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to create exercise entry:", error);
    return NextResponse.json(
      { error: "Failed to create exercise entry" },
      { status: 500 }
    );
  }
}
