import { prisma } from "./db";
import { startOfDay } from "./utils";

export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  milestone: number | null;
}> {
  const streak = await prisma.streak.findUnique({
    where: { userId },
  });

  if (!streak) {
    return { currentStreak: 0, longestStreak: 0, milestone: null };
  }

  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastLogged = streak.lastLoggedDate
    ? startOfDay(streak.lastLoggedDate)
    : null;

  // Already logged today
  if (lastLogged && lastLogged.getTime() === today.getTime()) {
    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      milestone: null,
    };
  }

  let newStreak: number;
  if (lastLogged && lastLogged.getTime() === yesterday.getTime()) {
    newStreak = streak.currentStreak + 1;
  } else {
    newStreak = 1;
  }

  const newLongest = Math.max(streak.longestStreak, newStreak);

  await prisma.streak.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastLoggedDate: today,
    },
  });

  const milestones = [3, 7, 14, 30, 50, 100];
  const milestone = milestones.includes(newStreak) ? newStreak : null;

  return { currentStreak: newStreak, longestStreak: newLongest, milestone };
}

export async function getStreak(userId: string) {
  return prisma.streak.findUnique({
    where: { userId },
  });
}
