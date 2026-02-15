import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findFirst();
  if (existingUser) {
    console.log("Default user already exists, skipping seed.");
    return;
  }

  const user = await prisma.user.create({
    data: {
      id: "default-user",
      settings: {
        create: {
          calorieGoal: 2000,
          proteinTarget: 150,
          carbTarget: 250,
          fatTarget: 65,
          macroUnit: "grams",
          weightUnit: "lbs",
          activityLevel: "moderate",
          llmProvider: "claude",
          onboardingComplete: false,
        },
      },
      streak: {
        create: {
          currentStreak: 0,
          longestStreak: 0,
        },
      },
    },
  });

  console.log(`Created default user: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
