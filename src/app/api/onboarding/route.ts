import { NextRequest, NextResponse } from "next/server";
import { prisma, getUserId } from "@/lib/db";
import { getLLMProvider } from "@/lib/llm";

export async function POST(request: NextRequest) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      calorieGoal,
      proteinTarget,
      carbTarget,
      fatTarget,
      weightUnit,
      activityLevel,
    } = body;

    await prisma.userSettings.update({
      where: { userId },
      data: {
        calorieGoal,
        proteinTarget,
        carbTarget,
        fatTarget,
        weightUnit,
        activityLevel,
        onboardingComplete: true,
      },
    });

    const llm = getLLMProvider();

    const onboardingData = { calorieGoal, proteinTarget, carbTarget, fatTarget, weightUnit, activityLevel };
    const [welcomeMessage, emptyStateMessage] = await Promise.all([
      llm.generateWelcomeMessage(onboardingData),
      llm.generateEmptyStateMessage(onboardingData),
    ]);

    await prisma.userSettings.update({
      where: { userId },
      data: {
        welcomeMessage,
        emptyStateMessage,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true },
    });

    return NextResponse.json({ ...user, welcomeMessage });
  } catch (error) {
    console.error("Failed to complete onboarding:", error);
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
