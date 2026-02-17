import { prisma, getUserId } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const meals = await prisma.savedMeal.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(meals);
  } catch (error) {
    console.error("Failed to fetch saved meals:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved meals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, items } = body;

    if (!name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Name and at least one item are required" },
        { status: 400 }
      );
    }

    const meal = await prisma.savedMeal.create({
      data: {
        userId,
        name,
        items: {
          create: items.map((item: {
            foodName: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            fiber?: number;
            quantity?: number;
          }) => ({
            foodName: item.foodName,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber ?? 0,
            quantity: item.quantity ?? 1,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(meal, { status: 201 });
  } catch (error) {
    console.error("Failed to create saved meal:", error);
    return NextResponse.json(
      { error: "Failed to create saved meal" },
      { status: 500 }
    );
  }
}
