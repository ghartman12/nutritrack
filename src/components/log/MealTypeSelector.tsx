"use client";
import { mealTypeLabels, mealTypeEmoji, suggestMealType, type MealType } from "@/lib/meal-type";

interface MealTypeSelectorProps {
  value: MealType;
  onChange: (type: MealType) => void;
}

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  const suggested = suggestMealType();

  return (
    <div className="flex gap-2">
      {mealTypes.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 transition-colors text-center ${
            value === type
              ? "border-emerald-600 bg-emerald-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <span className="text-lg">{mealTypeEmoji[type]}</span>
          <span className="text-xs font-medium text-gray-700">{mealTypeLabels[type]}</span>
          {type === suggested && value !== type && (
            <span className="text-[10px] text-emerald-600">suggested</span>
          )}
        </button>
      ))}
    </div>
  );
}
