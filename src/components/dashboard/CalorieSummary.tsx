"use client";
import ProgressRing from "@/components/ui/ProgressRing";

interface CalorieSummaryProps {
  consumed: number;
  burned: number;
  goal: number;
}

export default function CalorieSummary({ consumed, burned, goal }: CalorieSummaryProps) {
  const net = consumed - burned;
  const remaining = Math.max(goal - net, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <ProgressRing value={net} max={goal} size={150} strokeWidth={14} gradientFrom="#10b981" gradientTo="#059669">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{Math.round(net)}</div>
            <div className="text-xs text-gray-500">/ {goal} cal</div>
          </div>
        </ProgressRing>

        <div className="flex-1 ml-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Eaten</span>
            <span className="text-sm font-semibold text-gray-900">{Math.round(consumed)} cal</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Burned</span>
            <span className="text-sm font-semibold text-emerald-600">-{Math.round(burned)} cal</span>
          </div>
          <div className="border-t pt-2 flex justify-between items-center">
            <span className="text-sm text-gray-600">Remaining</span>
            <span className="text-sm font-semibold text-gray-900">{Math.round(remaining)} cal</span>
          </div>
        </div>
      </div>
    </div>
  );
}
