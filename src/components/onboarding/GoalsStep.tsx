"use client";
import Input from "@/components/ui/Input";

interface GoalsStepProps {
  data: { calorieGoal: number; proteinTarget: number; carbTarget: number; fatTarget: number };
  onChange: (field: string, value: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function GoalsStep({ data, onChange, onNext, onBack }: GoalsStepProps) {
  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Goals</h2>
      <p className="text-gray-600 mb-6">We&apos;ll use these to track your progress and generate insights.</p>

      <div className="space-y-4">
        <Input
          label="Daily Calorie Goal"
          type="number"
          value={data.calorieGoal}
          onChange={(e) => onChange("calorieGoal", parseInt(e.target.value) || 0)}
        />
        <Input
          label="Protein Target (g)"
          type="number"
          value={data.proteinTarget}
          onChange={(e) => onChange("proteinTarget", parseInt(e.target.value) || 0)}
        />
        <Input
          label="Carb Target (g)"
          type="number"
          value={data.carbTarget}
          onChange={(e) => onChange("carbTarget", parseInt(e.target.value) || 0)}
        />
        <Input
          label="Fat Target (g)"
          type="number"
          value={data.fatTarget}
          onChange={(e) => onChange("fatTarget", parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
          Back
        </button>
        <button onClick={onNext} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700">
          Next
        </button>
      </div>
    </div>
  );
}
