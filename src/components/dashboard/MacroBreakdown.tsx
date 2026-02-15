"use client";
import ProgressBar from "@/components/ui/ProgressBar";

interface MacroBreakdownProps {
  protein: number;
  carbs: number;
  fat: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

export default function MacroBreakdown({
  protein,
  carbs,
  fat,
  proteinTarget,
  carbTarget,
  fatTarget,
}: MacroBreakdownProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Macros</h3>
      <div className="space-y-3">
        <ProgressBar
          label="Protein"
          value={protein}
          max={proteinTarget}
          color="bg-blue-500"
        />
        <ProgressBar
          label="Carbs"
          value={carbs}
          max={carbTarget}
          color="bg-amber-500"
        />
        <ProgressBar
          label="Fat"
          value={fat}
          max={fatTarget}
          color="bg-rose-500"
        />
      </div>
    </div>
  );
}
