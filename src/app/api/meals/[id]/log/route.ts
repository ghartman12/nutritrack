import { prisma, DEFAULT_USER_ID } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const mealType = body.mealType || "lunch";
    const logDate = body.date ? new Date(body.date) : new Date();

    // Fetch the saved meal with its items
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

    // Create a food entry for each item in the saved meal
    const entries = await Promise.all(
      meal.items.map((item) =>
        prisma.foodEntry.create({
          data: {
            userId: DEFAULT_USER_ID,
            date: logDate,
            mealType,
            foodName: item.foodName,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber ?? 0,
            entryMethod: "saved-meal",
            isEstimate: false,
          },
        })
      )
    );

    // Check and update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const streak = await prisma.streak.findUnique({
      where: { userId: DEFAULT_USER_ID },
    });

    if (streak) {
      const lastLogged = streak.lastLoggedDate ? new Date(streak.lastLoggedDate) : null;
      if (lastLogged) lastLogged.setHours(0, 0, 0, 0);

      if (lastLogged && lastLogged.getTime() === yesterday.getTime()) {
        // Logged yesterday — extend the streak
        await prisma.streak.update({
          where: { userId: DEFAULT_USER_ID },
          data: {
            currentStreak: streak.currentStreak + 1,
            longestStreak: Math.max(streak.longestStreak, streak.currentStreak + 1),
            lastLoggedDate: new Date(),
          },
        });
      } else if (!lastLogged || lastLogged.getTime() < yesterday.getTime()) {
        // Missed a day — reset streak
        await prisma.streak.update({
          where: { userId: DEFAULT_USER_ID },
          data: {
            currentStreak: 1,
            lastLoggedDate: new Date(),
          },
        });
      } else {
        // Already logged today — just update the timestamp
        await prisma.streak.update({
          where: { userId: DEFAULT_USER_ID },
          data: {
            lastLoggedDate: new Date(),
          },
        });
      }
    } else {
      // No streak record yet — create one
      await prisma.streak.create({
        data: {
          userId: DEFAULT_USER_ID,
          currentStreak: 1,
          longestStreak: 1,
          lastLoggedDate: new Date(),
        },
      });
    }

    // Update last-logged metadata on the saved meal
    await prisma.savedMeal.update({
      where: { id },
      data: {
        lastLoggedAt: new Date(),
        lastLoggedMealType: mealType,
      },
    });

    return NextResponse.json({
      logged: entries.length,
      mealType,
      date: logDate.toISOString(),
    });
  } catch (error) {
    console.error("Failed to log saved meal:", error);
    return NextResponse.json(
      { error: "Failed to log saved meal" },
      { status: 500 }
    );
  }
}
