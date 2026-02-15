"use client";
import { useState } from "react";
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
  onSkip?: () => void;
}

const goals = [
  { value: "lose", label: "Lose Weight", icon: "📉" },
  { value: "maintain", label: "Maintain", icon: "⚖️" },
  { value: "gain", label: "Gain Muscle", icon: "💪" },
];

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {children} <span className="text-red-400">*</span>
    </label>
  );
}

export default function BodyStatsStep({ data, onChange, onNext, onBack, onSkip }: BodyStatsStepProps) {
  const isImperial = data.weightUnit === "lbs";
  const [errors, setErrors] = useState<Record<string, string>>({});

  const needsRate = data.goal === "lose" || data.goal === "gain";

  const isComplete =
    data.age > 0 &&
    data.sex !== "" &&
    (isImperial ? data.heightFeet > 0 : data.heightCm > 0) &&
    data.goal !== "" &&
    (!needsRate || data.weeklyRate > 0);

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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (data.age < 13 || data.age > 120) {
      newErrors.age = "Please enter a realistic age between 13-120";
    }

    if (isImperial) {
      if (data.heightFeet < 3 || data.heightFeet > 8) {
        newErrors.heightFeet = "Feet must be between 3-8";
      }
      if (data.heightInches < 0 || data.heightInches > 11) {
        newErrors.heightInches = "Inches must be between 0-11";
      }
    } else {
      if (data.heightCm < 100 || data.heightCm > 250) {
        newErrors.heightCm = "Please enter a realistic height between 100-250 cm";
      }
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
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Body Stats</h2>
      <p className="text-gray-600 mb-6">We&apos;ll use these to calculate personalized goals.</p>

      <div className="space-y-6">
        {/* Age */}
        <div>
          <RequiredLabel>Age</RequiredLabel>
          <Input
            type="number"
            min={13}
            max={120}
            value={data.age || ""}
            onChange={(e) => {
              const val = e.target.value.slice(0, 3);
              onChange("age", parseInt(val) || 0);
              clearError("age");
            }}
            placeholder="25"
            error={errors.age}
          />
        </div>

        {/* Sex */}
        <div>
          <RequiredLabel>Sex</RequiredLabel>
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
          <RequiredLabel>Height {isImperial ? "(ft / in)" : "(cm)"}</RequiredLabel>
          {isImperial ? (
            <div className="flex gap-3">
              <Input
                type="number"
                min={3}
                max={8}
                value={data.heightFeet || ""}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 1);
                  onChange("heightFeet", parseInt(val) || 0);
                  clearError("heightFeet");
                }}
                placeholder="5"
                error={errors.heightFeet}
              />
              <Input
                type="number"
                min={0}
                max={11}
                value={data.heightInches || ""}
                onChange={(e) => {
                  const val = e.target.value.slice(0, 2);
                  onChange("heightInches", parseInt(val) || 0);
                  clearError("heightInches");
                }}
                placeholder="10"
                error={errors.heightInches}
              />
            </div>
          ) : (
            <Input
              type="number"
              min={100}
              max={250}
              value={data.heightCm || ""}
              onChange={(e) => {
                const val = e.target.value.slice(0, 3);
                onChange("heightCm", parseInt(val) || 0);
                clearError("heightCm");
              }}
              placeholder="178"
              error={errors.heightCm}
            />
          )}
        </div>

        {/* Goal */}
        <div>
          <RequiredLabel>Goal</RequiredLabel>
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
        {needsRate && (
          <div>
            <RequiredLabel>Weekly Rate</RequiredLabel>
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

      {onSkip && (
        <div className="mt-4 text-center">
          <button onClick={onSkip} className="text-sm text-gray-500 hover:text-gray-700 underline">
            Skip to manual entry
          </button>
        </div>
      )}

      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!isComplete}
          className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600"
        >
          Next
        </button>
      </div>
    </div>
  );
}
