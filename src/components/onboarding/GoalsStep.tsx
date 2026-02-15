"use client";
import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import { calculateTDEE, type TDEEInput } from "@/lib/tdee";

interface BodyStats {
  weight: number;
  weightUnit: string;
  activityLevel: string;
  age: number;
  sex: string;
  heightFeet: number;
  heightInches: number;
  heightCm: number;
  goal: string;
  weeklyRate: number;
}

interface GoalsStepProps {
  data: { calorieGoal: number; proteinTarget: number; carbTarget: number; fatTarget: number };
  bodyStats: BodyStats;
  onChange: (field: string, value: number) => void;
  onNext: () => void;
  onBack: () => void;
  initialMode?: "calculate" | "manual";
}

export default function GoalsStep({ data, bodyStats, onChange, onNext, onBack, initialMode = "calculate" }: GoalsStepProps) {
  const [mode, setMode] = useState<"calculate" | "manual">(initialMode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate TDEE when in calculate mode and stats are available
  useEffect(() => {
    if (mode !== "calculate") return;
    if (!bodyStats.weight || !bodyStats.age) return;

    const input: TDEEInput = {
      weight: bodyStats.weight,
      weightUnit: bodyStats.weightUnit as "lbs" | "kg",
      heightFeet: bodyStats.heightFeet,
      heightInches: bodyStats.heightInches,
      heightCm: bodyStats.heightCm,
      age: bodyStats.age,
      sex: (bodyStats.sex || "other") as "male" | "female" | "other",
      activityLevel: (bodyStats.activityLevel || "moderate") as TDEEInput["activityLevel"],
      goal: (bodyStats.goal || "maintain") as "lose" | "maintain" | "gain",
      weeklyRate: bodyStats.weeklyRate,
    };

    const result = calculateTDEE(input);
    onChange("calorieGoal", result.calories);
    onChange("proteinTarget", result.protein);
    onChange("carbTarget", result.carbs);
    onChange("fatTarget", result.fat);
  }, [mode, bodyStats.weight, bodyStats.age, bodyStats.sex, bodyStats.heightFeet, bodyStats.heightInches, bodyStats.heightCm, bodyStats.activityLevel, bodyStats.goal, bodyStats.weeklyRate]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (): boolean => {
    if (mode === "calculate") return true;

    const newErrors: Record<string, string> = {};

    if (data.calorieGoal < 800 || data.calorieGoal > 5000) {
      newErrors.calorieGoal = "Please enter a value between 800-5000 calories";
    }
    if (data.proteinTarget < 0 || data.proteinTarget > 500) {
      newErrors.proteinTarget = "Please enter a value between 0-500g";
    }
    if (data.carbTarget < 0 || data.carbTarget > 1000) {
      newErrors.carbTarget = "Please enter a value between 0-1000g";
    }
    if (data.fatTarget < 0 || data.fatTarget > 300) {
      newErrors.fatTarget = "Please enter a value between 0-300g";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Your Goals</h2>
      <p className="text-gray-600 mb-6">We&apos;ll use these to track your progress and generate insights.</p>

      {/* Mode toggle */}
      <div className="flex mb-6 rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => { setMode("calculate"); setErrors({}); }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "calculate"
              ? "bg-emerald-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Calculate for me
        </button>
        <button
          onClick={() => { setMode("manual"); setErrors({}); }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "manual"
              ? "bg-emerald-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          Set manually
        </button>
      </div>

      {/* Calculate mode summary */}
      {mode === "calculate" && bodyStats.weight > 0 && bodyStats.age > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-emerald-800">
            Based on your stats, we suggest <strong>{data.calorieGoal} calories/day</strong>.
          </p>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Daily Calorie Goal"
          type="number"
          min={800}
          max={5000}
          value={data.calorieGoal}
          onChange={(e) => {
            const val = e.target.value.slice(0, 4);
            onChange("calorieGoal", parseInt(val) || 0);
            clearError("calorieGoal");
          }}
          error={errors.calorieGoal}
        />
        <Input
          label="Protein Target (g)"
          type="number"
          min={0}
          max={500}
          value={data.proteinTarget}
          onChange={(e) => {
            const val = e.target.value.slice(0, 3);
            onChange("proteinTarget", parseInt(val) || 0);
            clearError("proteinTarget");
          }}
          error={errors.proteinTarget}
        />
        <Input
          label="Carb Target (g)"
          type="number"
          min={0}
          max={1000}
          value={data.carbTarget}
          onChange={(e) => {
            const val = e.target.value.slice(0, 4);
            onChange("carbTarget", parseInt(val) || 0);
            clearError("carbTarget");
          }}
          error={errors.carbTarget}
        />
        <Input
          label="Fat Target (g)"
          type="number"
          min={0}
          max={300}
          value={data.fatTarget}
          onChange={(e) => {
            const val = e.target.value.slice(0, 3);
            onChange("fatTarget", parseInt(val) || 0);
            clearError("fatTarget");
          }}
          error={errors.fatTarget}
        />
      </div>

      {/* Disclaimer for calculate mode */}
      {mode === "calculate" && (
        <p className="text-xs text-gray-500 mt-3">
          This is an estimate using standard formulas. Adjust based on your needs.
        </p>
      )}

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
          Back
        </button>
        <button onClick={handleNext} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700">
          Next
        </button>
      </div>
    </div>
  );
}
