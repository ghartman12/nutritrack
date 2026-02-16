import { NextRequest, NextResponse } from "next/server";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";
import { getLLMProvider } from "@/lib/llm";
import { startOfDay, endOfDay, formatDate } from "@/lib/utils";
import { getStreak } from "@/lib/streak";
import type { UserData, DayLogs, WeekLogs } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type !== "weekly") {
      return NextResponse.json(
        { error: "Type must be 'weekly'" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
      include: { settings: true },
    });

    if (!user || !user.settings) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const streak = await getStreak();
    const llm = getLLMProvider();
    const s = user.settings;

    const userData: UserData = {
      calorieGoal: s.calorieGoal,
      proteinTarget: s.proteinTarget,
      carbTarget: s.carbTarget,
      fatTarget: s.fatTarget,
      activityLevel: s.activityLevel,
      currentStreak: streak?.currentStreak || 0,
    };

    async function buildDayLogs(date: Date): Promise<DayLogs> {
      const [foods, exercises, waterEntries] = await Promise.all([
        prisma.foodEntry.findMany({
          where: {
            userId: DEFAULT_USER_ID,
            date: { gte: startOfDay(date), lte: endOfDay(date) },
          },
        }),
        prisma.exerciseEntry.findMany({
          where: {
            userId: DEFAULT_USER_ID,
            date: { gte: startOfDay(date), lte: endOfDay(date) },
          },
        }),
        prisma.waterEntry.findMany({
          where: {
            userId: DEFAULT_USER_ID,
            date: { gte: startOfDay(date), lte: endOfDay(date) },
          },
        }),
      ]);

      const weightEntry = await prisma.weightEntry.findFirst({
        where: {
          userId: DEFAULT_USER_ID,
          date: { gte: startOfDay(date), lte: endOfDay(date) },
        },
      });

      const waterOunces = waterEntries.reduce((sum, w) => sum + w.ounces, 0);

      return {
        date: formatDate(date),
        foods: foods.map((f) => ({
          foodName: f.foodName,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fat: f.fat,
          mealType: f.mealType,
        })),
        exercises: exercises.map((e) => ({
          activity: e.activity,
          durationMinutes: e.durationMinutes,
          estimatedCalories: e.estimatedCalories,
        })),
        weight: weightEntry?.weight,
        waterOunces: waterOunces > 0 ? waterOunces : undefined,
      };
    }

    const days: DayLogs[] = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(await buildDayLogs(date));
    }

    const totalCals = days.reduce(
      (s, d) => s + d.foods.reduce((a, f) => a + f.calories, 0),
      0
    );
    const daysWithFood = days.filter((d) => d.foods.length > 0).length || 1;
    const totalExMin = days.reduce(
      (s, d) => s + d.exercises.reduce((a, e) => a + e.durationMinutes, 0),
      0
    );

    const weightValues = days.filter((d) => d.weight !== undefined).map((d) => d.weight!);
    const weightChange =
      weightValues.length >= 2 ? weightValues[0] - weightValues[weightValues.length - 1] : undefined;

    const daysWithWater = days.filter((d) => d.waterOunces !== undefined && d.waterOunces > 0);
    const averageWaterOz =
      daysWithWater.length > 0
        ? Math.round(daysWithWater.reduce((s, d) => s + d.waterOunces!, 0) / daysWithWater.length)
        : undefined;

    const weekLogs: WeekLogs = {
      days,
      averageCalories: Math.round(totalCals / daysWithFood),
      totalExerciseMinutes: totalExMin,
      weightChange,
      averageWaterOz,
    };

    const digestContent = await llm.generateWeeklyDigest(userData, weekLogs);

    const digest = await prisma.digest.create({
      data: {
        userId: DEFAULT_USER_ID,
        type: "weekly",
        date: new Date(),
        content: digestContent,
      },
    });

    return NextResponse.json(digest);
  } catch (error) {
    console.error("Failed to generate digest:", error);
    return NextResponse.json(
      { error: "Failed to generate digest" },
      { status: 500 }
    );
  }
}
