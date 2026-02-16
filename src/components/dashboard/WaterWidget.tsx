"use client";
import { useState } from "react";
import ProgressBar from "@/components/ui/ProgressBar";

const OZ_GOAL = 64;
const ML_GOAL = 2000;
const OZ_MAX = 200;
const ML_MAX = 6000;
const OZ_TO_ML = 29.5735;

interface WaterWidgetProps {
  ounces: number;
  onUpdate: (ounces: number) => void;
  waterUnit: string;
  loading?: boolean;
}

export default function WaterWidget({ ounces, onUpdate, waterUnit, loading }: WaterWidgetProps) {
  const [customAmount, setCustomAmount] = useState("");
  const isMetric = waterUnit === "mL";
  const goal = isMetric ? ML_GOAL : OZ_GOAL;
  const max = isMetric ? ML_MAX : OZ_MAX;
  const unit = isMetric ? "mL" : "oz";

  const displayValue = isMetric ? Math.round(ounces * OZ_TO_ML) : ounces;

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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Water</h3>
        <span className="text-xs text-gray-500">{displayValue} / {goal} {unit}</span>
      </div>

      <ProgressBar
        value={displayValue}
        max={goal}
        color="bg-sky-500"
        showValue={false}
      />

      <div className="flex items-center justify-center gap-3 mt-4">
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
