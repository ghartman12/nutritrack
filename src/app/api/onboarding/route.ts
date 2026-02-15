import { NextRequest, NextResponse } from "next/server";
import { prisma, DEFAULT_USER_ID } from "@/lib/db";
import { getLLMProvider } from "@/lib/llm";

export async function POST(request: NextRequest) {
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
      where: { userId: DEFAULT_USER_ID },
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
      where: { userId: DEFAULT_USER_ID },
      data: {
        welcomeMessage,
        emptyStateMessage,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: DEFAULT_USER_ID },
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
