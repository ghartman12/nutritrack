"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import type { NutritionEstimate } from "@/types";

interface NutritionConfirmProps {
  data: NutritionEstimate;
  onConfirm: (data: NutritionEstimate) => void;
  onCancel: () => void;
  onBackToResults?: () => void;
  loading?: boolean;
}

type WeightUnit = "g" | "oz" | "lb";
type InputMode = "servings" | "weight";

const GRAMS_PER_UNIT: Record<WeightUnit, number> = {
  g: 1,
  oz: 28.3495,
  lb: 453.592,
};

export default function NutritionConfirm({ data, onConfirm, onCancel, onBackToResults, loading }: NutritionConfirmProps) {
  // Store the base (per-100g or per-serving) values from the original data
  const [base] = useState<NutritionEstimate>({ ...data });
  const [quantity, setQuantity] = useState(data.quantity ?? 1);
  const [quantityInput, setQuantityInput] = useState(String(data.quantity ?? 1));
  const [manualOverrides, setManualOverrides] = useState<Partial<Record<string, number | string>>>({});

  // Weight-based input state
  const isPer100g = base.nutrientsPer100g === true;
  const servingSizeGrams = base.servingSizeGrams ?? 100;
  const [inputMode, setInputMode] = useState<InputMode>("servings");
  const [weightValue, setWeightValue] = useState(servingSizeGrams);
  const [weightInput, setWeightInput] = useState(String(servingSizeGrams));
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("g");

  // Compute scale factor based on mode
  const getScaleFactor = (): number => {
    if (!isPer100g) {
      // NLP results: base values are already per-serving, just multiply by quantity
      return quantity;
    }
    if (inputMode === "servings") {
      // Per-100g data, serving mode: scale by servingSize/100 * quantity
      return (servingSizeGrams / 100) * quantity;
    }
    // Weight mode: convert to grams, then divide by 100
    const weightInGrams = weightValue * GRAMS_PER_UNIT[weightUnit];
    return weightInGrams / 100;
  };

  const scaleFactor = getScaleFactor();

  // Computed values: base * scaleFactor, unless manually overridden
  const computed = {
    foodName: (manualOverrides.foodName as string) ?? base.foodName,
    calories: manualOverrides.calories ?? Math.round(base.calories * scaleFactor),
    protein: manualOverrides.protein ?? Math.round(base.protein * scaleFactor * 10) / 10,
    carbs: manualOverrides.carbs ?? Math.round(base.carbs * scaleFactor * 10) / 10,
    fat: manualOverrides.fat ?? Math.round(base.fat * scaleFactor * 10) / 10,
    fiber: manualOverrides.fiber ?? Math.round(base.fiber * scaleFactor * 10) / 10,
    isEstimate: base.isEstimate,
  };

  const clearNumericOverrides = () => {
    setManualOverrides((prev) => {
      const { foodName } = prev;
      return foodName !== undefined ? { foodName } : {};
    });
  };

  const handleQuantityChange = (val: string) => {
    setQuantityInput(val);
    const q = parseFloat(val);
    if (!isNaN(q) && q > 0) {
      setQuantity(q);
      clearNumericOverrides();
    }
  };

  const handleWeightValueChange = (val: string) => {
    setWeightInput(val);
    const w = parseFloat(val);
    if (!isNaN(w) && w > 0) {
      setWeightValue(w);
      clearNumericOverrides();
    }
  };

  const handleUnitChange = (newUnit: WeightUnit) => {
    // Preserve physical weight when switching units
    const currentGrams = weightValue * GRAMS_PER_UNIT[weightUnit];
    const converted = currentGrams / GRAMS_PER_UNIT[newUnit];
    setWeightUnit(newUnit);
    const rounded = Math.round(converted * 100) / 100;
    setWeightValue(rounded);
    setWeightInput(String(rounded));
    // No need to clear overrides — same physical weight = same macros
  };

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    clearNumericOverrides();
    if (mode === "weight") {
      // Default to one serving's weight in grams
      setWeightValue(servingSizeGrams);
      setWeightInput(String(servingSizeGrams));
      setWeightUnit("g");
    } else {
      setQuantity(1);
      setQuantityInput("1");
    }
  };

  const updateField = (field: string, value: string) => {
    if (field === "foodName") {
      setManualOverrides((prev) => ({ ...prev, foodName: value }));
    } else {
      setManualOverrides((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
    }
  };

  const handleConfirm = () => {
    onConfirm({
      foodName: computed.foodName as string,
      calories: computed.calories as number,
      protein: computed.protein as number,
      carbs: computed.carbs as number,
      fat: computed.fat as number,
      fiber: computed.fiber as number,
      isEstimate: computed.isEstimate,
    });
  };

  // Build serving label context
  const servingLabel = (() => {
    if (!isPer100g) return "Quantity / Servings";
    if (base.householdServingText) {
      return `Servings (${base.householdServingText} = ${servingSizeGrams}g)`;
    }
    return `Servings (${servingSizeGrams}g each)`;
  })();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Confirm Nutrition</h3>
        {data.isEstimate && <Badge variant="ai" tooltip="This is an AI estimate and may not be accurate. Not intended as medical advice. Consult a healthcare professional for personalized nutrition guidance.">AI Estimate</Badge>}
      </div>

      <div className="space-y-3">
        <Input
          label="Food Name"
          value={computed.foodName as string}
          onChange={(e) => updateField("foodName", e.target.value)}
        />

        {/* Mode toggle — only for per-100g data (USDA/barcode) */}
        {isPer100g && (
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => handleModeChange("servings")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                inputMode === "servings" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              Servings
            </button>
            <button
              onClick={() => handleModeChange("weight")}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                inputMode === "weight" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              By Weight
            </button>
          </div>
        )}

        {/* Servings input */}
        {(inputMode === "servings" || !isPer100g) && (
          <Input
            label={servingLabel}
            type="number"
            step="0.5"
            min="0.25"
            value={quantityInput}
            onChange={(e) => handleQuantityChange(e.target.value)}
          />
        )}

        {/* Weight input */}
        {isPer100g && inputMode === "weight" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="1"
                min="1"
                value={weightInput}
                onChange={(e) => handleWeightValueChange(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="flex bg-gray-100 rounded-xl p-0.5">
                {(["g", "oz", "lb"] as WeightUnit[]).map((u) => (
                  <button
                    key={u}
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

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Calories"
            type="number"
            value={computed.calories}
            onChange={(e) => updateField("calories", e.target.value)}
          />
          <Input
            label="Protein (g)"
            type="number"
            value={computed.protein}
            onChange={(e) => updateField("protein", e.target.value)}
          />
          <Input
            label="Carbs (g)"
            type="number"
            value={computed.carbs}
            onChange={(e) => updateField("carbs", e.target.value)}
          />
          <Input
            label="Fat (g)"
            type="number"
            value={computed.fat}
            onChange={(e) => updateField("fat", e.target.value)}
          />
        </div>
        <Input
          label="Fiber (g)"
          type="number"
          value={computed.fiber}
          onChange={(e) => updateField("fiber", e.target.value)}
        />
      </div>

      {onBackToResults && (
        <button
          onClick={onBackToResults}
          className="w-full mt-4 py-2 text-sm text-emerald-700 hover:text-emerald-900 hover:underline transition-colors"
        >
          &larr; Back to Results
        </button>
      )}

      <div className="flex gap-3 mt-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Entry"}
        </button>
      </div>
    </div>
  );
}
