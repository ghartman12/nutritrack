"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";

type WeightUnit = "g" | "oz" | "lb";

const GRAMS_PER_UNIT: Record<WeightUnit, number> = {
  g: 1,
  oz: 28.3495,
  lb: 453.592,
};

interface ManualEntryFormProps {
  onSubmit: (data: {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ManualEntryForm({ onSubmit, onCancel, loading }: ManualEntryFormProps) {
  const [form, setForm] = useState({
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    fiber: "",
  });
  const [quantity, setQuantity] = useState(1);
  const [valueBasis, setValueBasis] = useState<"total" | "per100g">("total");
  const [weightValue, setWeightValue] = useState(100);
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("g");

  const getScaleFactor = (): number => {
    if (valueBasis === "total") return quantity;
    // Per-100g mode: scale by weight / 100
    const weightInGrams = weightValue * GRAMS_PER_UNIT[weightUnit];
    return (weightInGrams / 100) * quantity;
  };

  const handleUnitChange = (newUnit: WeightUnit) => {
    const currentGrams = weightValue * GRAMS_PER_UNIT[weightUnit];
    const converted = currentGrams / GRAMS_PER_UNIT[newUnit];
    setWeightUnit(newUnit);
    setWeightValue(Math.round(converted * 100) / 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.foodName.trim() || !form.calories) return;
    const scale = getScaleFactor();
    onSubmit({
      foodName: form.foodName.trim(),
      calories: Math.round((parseFloat(form.calories) || 0) * scale),
      protein: Math.round((parseFloat(form.protein) || 0) * scale * 10) / 10,
      carbs: Math.round((parseFloat(form.carbs) || 0) * scale * 10) / 10,
      fat: Math.round((parseFloat(form.fat) || 0) * scale * 10) / 10,
      fiber: Math.round((parseFloat(form.fiber) || 0) * scale * 10) / 10,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Manual Entry</h3>
      <div className="space-y-3">
        <Input
          label="Food Name"
          value={form.foodName}
          onChange={(e) => setForm((p) => ({ ...p, foodName: e.target.value }))}
          required
        />

        {/* Value basis toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Values entered are</label>
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setValueBasis("total")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                valueBasis === "total" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Per Serving
            </button>
            <button
              type="button"
              onClick={() => setValueBasis("per100g")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                valueBasis === "per100g" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Per Weight
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Calories"
            type="number"
            value={form.calories}
            onChange={(e) => setForm((p) => ({ ...p, calories: e.target.value }))}
            required
          />
          <Input
            label="Protein (g)"
            type="number"
            value={form.protein}
            onChange={(e) => setForm((p) => ({ ...p, protein: e.target.value }))}
          />
          <Input
            label="Carbs (g)"
            type="number"
            value={form.carbs}
            onChange={(e) => setForm((p) => ({ ...p, carbs: e.target.value }))}
          />
          <Input
            label="Fat (g)"
            type="number"
            value={form.fat}
            onChange={(e) => setForm((p) => ({ ...p, fat: e.target.value }))}
          />
        </div>
        <Input
          label="Fiber (g)"
          type="number"
          value={form.fiber}
          onChange={(e) => setForm((p) => ({ ...p, fiber: e.target.value }))}
        />

        {/* Quantity (both modes) */}
        <Input
          label={valueBasis === "per100g" ? "Servings" : "Quantity / Servings"}
          type="number"
          step="0.5"
          min="0.25"
          value={quantity}
          onChange={(e) => {
            const q = parseFloat(e.target.value);
            if (!isNaN(q) && q > 0) setQuantity(q);
          }}
        />

        {/* Weight input (per-100g mode only) */}
        {valueBasis === "per100g" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serving Weight</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="1"
                min="1"
                value={weightValue}
                onChange={(e) => {
                  const w = parseFloat(e.target.value);
                  if (!isNaN(w) && w > 0) setWeightValue(w);
                }}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="flex bg-gray-100 rounded-xl p-0.5">
                {(["g", "oz", "lb"] as WeightUnit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => handleUnitChange(u)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      weightUnit === u ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !form.foodName.trim() || !form.calories}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </form>
  );
}
