"use client";
import Input from "@/components/ui/Input";

interface BodyStatsStepProps {
  data: {
    weightUnit: string;
    age: number;
    sex: string;
    heightFeet: number;
    heightInches: number;
    heightCm: number;
    goal: string;
    weeklyRate: number;
  };
  onChange: (field: string, value: string | number) => void;
  onNext: () => void;
  onBack: () => void;
}

const goals = [
  { value: "lose", label: "Lose Weight", icon: "📉" },
  { value: "maintain", label: "Maintain", icon: "⚖️" },
  { value: "gain", label: "Gain Muscle", icon: "💪" },
];

export default function BodyStatsStep({ data, onChange, onNext, onBack }: BodyStatsStepProps) {
  const isImperial = data.weightUnit === "lbs";

  const rateOptions = isImperial
    ? [
        { value: 0.5, label: "0.5 lb/week" },
        { value: 1, label: "1 lb/week" },
        { value: 1.5, label: "1.5 lb/week" },
      ]
    : [
        { value: 0.25, label: "0.25 kg/week" },
        { value: 0.5, label: "0.5 kg/week" },
        { value: 0.7, label: "0.7 kg/week" },
      ];

  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Body Stats</h2>
      <p className="text-gray-600 mb-6">We&apos;ll use these to calculate personalized goals.</p>

      <div className="space-y-6">
        {/* Age */}
        <Input
          label="Age"
          type="number"
          value={data.age || ""}
          onChange={(e) => onChange("age", parseInt(e.target.value) || 0)}
          placeholder="25"
        />

        {/* Sex */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
          <div className="flex gap-3">
            {(["male", "female", "other"] as const).map((option) => (
              <button
                key={option}
                onClick={() => onChange("sex", option)}
                className={`flex-1 py-3 rounded-xl border-2 font-medium transition-colors ${
                  data.sex === option
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Height {isImperial ? "(ft / in)" : "(cm)"}
          </label>
          {isImperial ? (
            <div className="flex gap-3">
              <Input
                type="number"
                value={data.heightFeet || ""}
                onChange={(e) => onChange("heightFeet", parseInt(e.target.value) || 0)}
                placeholder="5"
              />
              <Input
                type="number"
                value={data.heightInches || ""}
                onChange={(e) => onChange("heightInches", parseInt(e.target.value) || 0)}
                placeholder="10"
              />
            </div>
          ) : (
            <Input
              type="number"
              value={data.heightCm || ""}
              onChange={(e) => onChange("heightCm", parseInt(e.target.value) || 0)}
              placeholder="178"
            />
          )}
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
          <div className="space-y-2">
            {goals.map((g) => (
              <button
                key={g.value}
                onClick={() => onChange("goal", g.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                  data.goal === g.value
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{g.icon}</span>
                <span className="font-medium text-gray-900">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Rate - only if goal is not maintain */}
        {data.goal !== "maintain" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Rate</label>
            <div className="space-y-2">
              {rateOptions.map((rate) => (
                <button
                  key={rate.value}
                  onClick={() => onChange("weeklyRate", rate.value)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                    data.weeklyRate === rate.value
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="font-medium text-gray-900">{rate.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
