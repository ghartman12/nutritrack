"use client";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="text-6xl mb-6">🥗</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Welcome to NutriTrack</h1>
      <p className="text-lg text-gray-600 mb-8 max-w-sm">
        Track your nutrition, log exercises, and get AI-powered insights to reach your health goals.
      </p>
      <button
        onClick={onNext}
        className="w-full max-w-xs bg-emerald-600 text-white py-3 rounded-xl text-lg font-medium hover:bg-emerald-700 transition-colors"
      >
        Get Started
      </button>
    </div>
  );
}
