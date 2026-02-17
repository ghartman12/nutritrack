import { NextRequest, NextResponse } from "next/server";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";
import { startOfDay, endOfDay } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const days = parseInt(searchParams.get("days") || "30", 10);

    let where: any = { userId: DEFAULT_USER_ID };

    if (dateParam) {
      const date = new Date(dateParam);
      where.date = { gte: startOfDay(date), lte: endOfDay(date) };
    } else {
      const since = new Date();
      since.setDate(since.getDate() - days);
      where.date = { gte: since };
    }

    const entries = await prisma.weightEntry.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch weight entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weight, unit, date: dateStr } = body;

    const entry = await prisma.weightEntry.create({
      data: {
        userId: DEFAULT_USER_ID,
        weight,
        unit,
        ...(dateStr ? { date: new Date(dateStr + "T12:00:00") } : {}),
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error("Failed to create weight entry:", error);
    return NextResponse.json(
      { error: "Failed to create weight entry" },
      { status: 500 }
    );
  }
}
