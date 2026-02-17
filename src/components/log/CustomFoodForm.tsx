"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";

interface CustomFoodFormProps {
  onSubmit: (data: {
    foodName: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: {
    foodName: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export default function CustomFoodForm({ onSubmit, onCancel, loading, initialData }: CustomFoodFormProps) {
  const [form, setForm] = useState({
    foodName: initialData?.foodName ?? "",
    servingSize: initialData?.servingSize ?? "1 serving",
    calories: initialData?.calories ?? 0,
    protein: initialData?.protein ?? 0,
    carbs: initialData?.carbs ?? 0,
    fat: initialData?.fat ?? 0,
    fiber: initialData?.fiber ?? 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.foodName.trim()) newErrors.foodName = "Food name is required";
    if (!form.servingSize.trim()) newErrors.servingSize = "Serving size is required";
    if (form.calories < 0 || form.calories > 5000) newErrors.calories = "Must be 0-5000";
    if (form.protein < 0 || form.protein > 500) newErrors.protein = "Must be 0-500g";
    if (form.carbs < 0 || form.carbs > 1000) newErrors.carbs = "Must be 0-1000g";
    if (form.fat < 0 || form.fat > 300) newErrors.fat = "Must be 0-300g";
    if (form.fiber < 0 || form.fiber > 100) newErrors.fiber = "Must be 0-100g";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const isComplete = form.foodName.trim() !== "" && form.calories > 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {initialData ? "Edit Custom Food" : "Create Custom Food"}
      </h3>

      <Input
        label="Food Name"
        value={form.foodName}
        onChange={(e) => update("foodName", e.target.value.slice(0, 100))}
        placeholder="e.g. Homemade granola"
        error={errors.foodName}
      />
      <Input
        label="Serving Size"
        value={form.servingSize}
        onChange={(e) => update("servingSize", e.target.value.slice(0, 50))}
        placeholder="e.g. 1 cup, 100g"
        error={errors.servingSize}
      />
      <Input
        label="Calories"
        type="number"
        min={0}
        max={5000}
        value={form.calories || ""}
        onChange={(e) => update("calories", parseFloat(e.target.value.slice(0, 4)) || 0)}
        error={errors.calories}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Protein (g)"
          type="number"
          min={0}
          max={500}
          value={form.protein || ""}
          onChange={(e) => update("protein", parseFloat(e.target.value.slice(0, 3)) || 0)}
          error={errors.protein}
        />
        <Input
          label="Carbs (g)"
          type="number"
          min={0}
          max={1000}
          value={form.carbs || ""}
          onChange={(e) => update("carbs", parseFloat(e.target.value.slice(0, 4)) || 0)}
          error={errors.carbs}
        />
        <Input
          label="Fat (g)"
          type="number"
          min={0}
          max={300}
          value={form.fat || ""}
          onChange={(e) => update("fat", parseFloat(e.target.value.slice(0, 3)) || 0)}
          error={errors.fat}
        />
        <Input
          label="Fiber (g)"
          type="number"
          min={0}
          max={100}
          value={form.fiber || ""}
          onChange={(e) => update("fiber", parseFloat(e.target.value.slice(0, 3)) || 0)}
          error={errors.fiber}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !isComplete}
          className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 text-sm"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
