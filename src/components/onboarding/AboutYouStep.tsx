"use client";
import Input from "@/components/ui/Input";

interface AboutYouStepProps {
  data: { weightUnit: string; weight: number; activityLevel: string };
  onChange: (field: string, value: string | number) => void;
  onNext: () => void;
  onBack: () => void;
}

const activityLevels = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "light", label: "Light", desc: "Light exercise 1-3 days/week" },
  { value: "moderate", label: "Moderate", desc: "Moderate exercise 3-5 days/week" },
  { value: "very_active", label: "Very Active", desc: "Hard exercise 6-7 days/week" },
];

export default function AboutYouStep({ data, onChange, onNext, onBack }: AboutYouStepProps) {
  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">About You</h2>
      <p className="text-gray-600 mb-6">This helps us give better calorie estimates.</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Weight Unit</label>
        <div className="flex gap-3">
          {["lbs", "kg"].map((unit) => (
            <button
              key={unit}
              onClick={() => onChange("weightUnit", unit)}
              className={`flex-1 py-3 rounded-xl border-2 font-medium transition-colors ${
                data.weightUnit === unit
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {unit.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <Input
          label={`Current Weight (${data.weightUnit})`}
          type="number"
          value={data.weight || ""}
          onChange={(e) => onChange("weight", parseInt(e.target.value) || 0)}
          placeholder={data.weightUnit === "lbs" ? "170" : "77"}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
        <div className="space-y-2">
          {activityLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => onChange("activityLevel", level.value)}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                data.activityLevel === level.value
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="font-medium text-gray-900">{level.label}</div>
              <div className="text-sm text-gray-500">{level.desc}</div>
            </button>
          ))}
        </div>
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
