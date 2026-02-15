"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";

interface WeightFormProps {
  defaultUnit: string;
  onSubmit: (data: { weight: number; unit: string }) => void;
  loading?: boolean;
}

export default function WeightForm({ defaultUnit, onSubmit, loading }: WeightFormProps) {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState(defaultUnit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    onSubmit({ weight: parseFloat(weight), unit });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Weight"
        type="number"
        step="0.1"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder={`Enter weight in ${unit}`}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
        <div className="flex gap-3">
          {["lbs", "kg"].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`flex-1 py-2.5 rounded-xl border-2 font-medium transition-colors ${
                unit === u
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {u.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !weight}
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving..." : "Log Weight"}
      </button>
    </form>
  );
}
