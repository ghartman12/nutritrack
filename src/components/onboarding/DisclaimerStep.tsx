"use client";
import { useState } from "react";

interface DisclaimerStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function DisclaimerStep({ onNext, onBack }: DisclaimerStepProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Before We Start</h2>
      <p className="text-gray-600 mb-6">Please review the following disclaimer.</p>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
        <p className="text-sm text-gray-700 leading-relaxed">
          NutriTrack provides nutrition estimates for informational purposes only.
          AI-generated estimates may not be accurate. This app is not a substitute
          for professional medical advice. By continuing, you acknowledge you
          understand this.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer mb-8">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm text-gray-700">
          I understand and accept this disclaimer
        </span>
      </label>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!accepted}
          className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
