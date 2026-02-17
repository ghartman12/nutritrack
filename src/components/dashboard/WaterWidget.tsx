"use client";
import { useState } from "react";
import ProgressRing from "@/components/ui/ProgressRing";

const OZ_TO_ML = 29.5735;

interface WaterWidgetProps {
  ounces: number;
  onUpdate: (ounces: number) => void;
  waterUnit: string;
  waterGoal?: number;
  loading?: boolean;
}

export default function WaterWidget({ ounces, onUpdate, waterUnit, waterGoal, loading }: WaterWidgetProps) {
  const [customAmount, setCustomAmount] = useState("");
  const isMetric = waterUnit === "mL";
  const goal = waterGoal ?? (isMetric ? 2000 : 64);
  const max = goal * 3;
  const unit = isMetric ? "mL" : "oz";

  const displayValue = isMetric ? Math.round(ounces * OZ_TO_ML) : ounces;
  const percent = goal > 0 ? Math.min(displayValue / goal, 1) : 0;

  const quickAmounts = isMetric ? [250, 500, 1000] : [8, 16, 32];
  const subtractAmount = isMetric ? 250 : 8;

  const addAmount = (displayAmt: number) => {
    const ozToAdd = isMetric ? Math.round(displayAmt / OZ_TO_ML) : displayAmt;
    const newOz = Math.min(ounces + ozToAdd, Math.ceil(max / (isMetric ? OZ_TO_ML : 1)));
    onUpdate(newOz);
  };

  const subtractOz = () => {
    const ozToSub = isMetric ? Math.round(subtractAmount / OZ_TO_ML) : subtractAmount;
    onUpdate(Math.max(0, ounces - ozToSub));
  };

  const handleCustomAdd = () => {
    const amt = parseInt(customAmount);
    if (!amt || amt <= 0) return;
    addAmount(amt);
    setCustomAmount("");
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Water</h3>

      <div className="flex items-center justify-center mb-4">
        <ProgressRing value={displayValue} max={goal} size={130} strokeWidth={12} color="#0ea5e9">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{displayValue}</div>
            <div className="text-xs text-gray-500">/ {goal} {unit}</div>
            {percent >= 1 && (
              <div className="text-xs font-medium text-sky-500 mt-0.5">Goal met!</div>
            )}
          </div>
        </ProgressRing>
      </div>

      <div className="text-center text-xs text-gray-400 mb-4">
        {Math.round(percent * 100)}% of daily goal
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={subtractOz}
          disabled={ounces <= 0 || loading}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm shrink-0"
          aria-label={`Remove ${subtractAmount} ${unit}`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
          </svg>
        </button>

        {quickAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => addAmount(amt)}
            disabled={displayValue >= max || loading}
            className="flex-1 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            +{amt}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder={`Custom ${unit}`}
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/20"
          onKeyDown={(e) => e.key === "Enter" && handleCustomAdd()}
        />
        <button
          onClick={handleCustomAdd}
          disabled={!customAmount || loading}
          className="px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
}
