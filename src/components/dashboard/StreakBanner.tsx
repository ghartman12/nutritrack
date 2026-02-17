"use client";

interface StreakBannerProps {
  currentStreak: number;
  longestStreak: number;
}

export default function StreakBanner({ currentStreak, longestStreak }: StreakBannerProps) {
  if (currentStreak === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <div className="text-2xl font-bold">{currentStreak} day streak!</div>
            <div className="text-sm text-white/80">Keep it going!</div>
          </div>
        </div>
        {longestStreak > currentStreak && (
          <div className="text-right text-sm text-white/80">
            <div>Best: {longestStreak}</div>
          </div>
        )}
      </div>
    </div>
  );
}
