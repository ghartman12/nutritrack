import { prisma, DEFAULT_USER_ID } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const meal = await prisma.savedMeal.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!meal) {
      return NextResponse.json(
        { error: "Meal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Failed to fetch saved meal:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved meal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, items } = body;

    if (!name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Name and at least one item are required" },
        { status: 400 }
      );
    }

    // Delete existing items first
    await prisma.savedMealItem.deleteMany({
      where: { savedMealId: id },
    });

    // Update meal with new items
    const meal = await prisma.savedMeal.update({
      where: { id },
      data: {
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

    return NextResponse.json(meal);
  } catch (error) {
    console.error("Failed to update saved meal:", error);
    return NextResponse.json(
      { error: "Failed to update saved meal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.savedMeal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete saved meal:", error);
    return NextResponse.json(
      { error: "Failed to delete saved meal" },
      { status: 500 }
    );
  }
}
