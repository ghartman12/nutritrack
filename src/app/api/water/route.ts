import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserId } from "@/lib/db";
import { startOfDay, endOfDay } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    const entries = await prisma.waterEntry.findMany({
      where: {
        userId,
        date: { gte: startOfDay(date), lte: endOfDay(date) },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalOunces = entries.reduce((sum, e) => sum + e.ounces, 0);

    return NextResponse.json({ entries, totalOunces });
  } catch (error) {
    console.error("Failed to fetch water entries:", error);
    return NextResponse.json({ error: "Failed to fetch water entries" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const body = await request.json();
    const { ounces, date: dateStr } = body;
    const date = dateStr ? new Date(dateStr) : new Date();

    const entry = await prisma.waterEntry.create({
      data: { userId, ounces, date },
    });

    const allEntries = await prisma.waterEntry.findMany({
      where: {
        userId,
        date: { gte: startOfDay(date), lte: endOfDay(date) },
      },
    });

    const totalOunces = allEntries.reduce((sum, e) => sum + e.ounces, 0);

    return NextResponse.json({ entry, totalOunces });
  } catch (error) {
    console.error("Failed to create water entry:", error);
    return NextResponse.json({ error: "Failed to create water entry" }, { status: 500 });
  }
}
