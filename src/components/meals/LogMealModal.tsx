"use client";

import { useState, useMemo } from "react";
import { suggestMealType, mealTypeLabels, mealTypeEmoji, type MealType } from "@/lib/meal-type";

interface LogMealModalProps {
  meal: {
    id: string;
    name: string;
    items: any[];
  };
  onConfirm: (id: string, mealType: MealType, date: string) => void;
  onCancel: () => void;
  loading?: boolean;
}

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function LogMealModal({ meal, onConfirm, onCancel, loading }: LogMealModalProps) {
  const [mealType, setMealType] = useState<MealType>(suggestMealType());
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const totalCalories = useMemo(
    () =>
      meal.items.reduce(
        (sum: number, item: any) => sum + (item.calories || 0) * (item.quantity || 1),
        0
      ),
    [meal.items]
  );

  const formattedDate = useMemo(() => {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [date]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4 animate-in slide-in-from-bottom sm:mx-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Log Meal</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Meal type selector */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Meal Type</label>
          <div className="flex gap-2">
            {mealTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 transition-colors ${
                  mealType === type
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-base">{mealTypeEmoji[type]}</span>
                <span className="text-xs font-medium text-gray-700">{mealTypeLabels[type]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date picker */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Preview */}
        <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
          Logging <span className="font-semibold">{meal.items.length} {meal.items.length === 1 ? "item" : "items"}</span>
          {" "}({Math.round(totalCalories)} cal) to{" "}
          <span className="font-semibold">{mealTypeLabels[mealType]}</span>
          {" "}on <span className="font-semibold">{formattedDate}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(meal.id, mealType, date)}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Logging..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
