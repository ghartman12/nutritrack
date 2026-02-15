"use client";
import Card from "@/components/ui/Card";

interface DigestCardProps {
  streak: number;
  hasLoggedToday: boolean;
}

const TIPS = [
  "Drinking water before meals can help with portion control.",
  "Try to include protein with every meal to stay full longer.",
  "Eating slowly gives your body time to recognize fullness.",
  "Colorful plates tend to be more nutritious — aim for variety.",
  "Consistent logging builds awareness, even on imperfect days.",
  "Small, sustainable changes beat drastic overhauls every time.",
  "A 10-minute walk after meals can help with digestion and blood sugar.",
  "Meal prepping even one meal ahead reduces impulsive food choices.",
];

function getTip(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return TIPS[dayOfYear % TIPS.length];
}

function getStreakMessage(streak: number): string {
  if (streak >= 30) return `${streak}-day streak! You've built a serious habit. Keep the momentum going.`;
  if (streak >= 14) return `${streak} days in a row! Your consistency is paying off.`;
  if (streak >= 7) return `${streak}-day streak! A full week of tracking — that's how habits are built.`;
  if (streak >= 3) return `${streak} days and counting! You're building a great routine.`;
  return `${streak}-day streak! Every day you log is a win.`;
}

export default function DigestCard({ streak, hasLoggedToday }: DigestCardProps) {
  if (!hasLoggedToday) return null;

  const message = streak > 0 ? getStreakMessage(streak) : getTip();

  return (
    <Card>
      <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
    </Card>
  );
}
