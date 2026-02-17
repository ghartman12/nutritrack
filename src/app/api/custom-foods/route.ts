import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserId } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const foods = await prisma.customFood.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(foods);
  } catch (error) {
    console.error("Failed to fetch custom foods:", error);
    return NextResponse.json({ error: "Failed to fetch custom foods" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const body = await request.json();
    const { foodName, servingSize, calories, protein, carbs, fat, fiber } = body;

    const food = await prisma.customFood.create({
      data: {
        userId,
        foodName,
        servingSize: servingSize || "1 serving",
        calories,
        protein,
        carbs,
        fat,
        fiber,
      },
    });

    return NextResponse.json(food);
  } catch (error) {
    console.error("Failed to create custom food:", error);
    return NextResponse.json({ error: "Failed to create custom food" }, { status: 500 });
  }
}
