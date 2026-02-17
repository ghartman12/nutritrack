import { NextRequest, NextResponse } from "next/server";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";

export async function GET() {
  try {
    const foods = await prisma.customFood.findMany({
      where: { userId: DEFAULT_USER_ID },
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
    const body = await request.json();
    const { foodName, servingSize, calories, protein, carbs, fat, fiber } = body;

    const food = await prisma.customFood.create({
      data: {
        userId: DEFAULT_USER_ID,
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
