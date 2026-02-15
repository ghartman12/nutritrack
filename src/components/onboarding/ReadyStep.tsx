"use client";
import Spinner from "@/components/ui/Spinner";

interface ReadyStepProps {
  welcomeMessage: string | null;
  loading: boolean;
  onFinish: () => void;
  onBack: () => void;
}

export default function ReadyStep({ welcomeMessage, loading, onFinish, onBack }: ReadyStepProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
      <div className="text-5xl mb-6">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">You&apos;re All Set!</h2>

      {loading ? (
        <div className="my-8">
          <Spinner />
          <p className="text-gray-500 mt-3">Preparing your personalized experience...</p>
        </div>
      ) : (
        <div className="bg-emerald-50 rounded-2xl p-5 mb-8 max-w-sm">
          <p className="text-gray-700 leading-relaxed">
            {welcomeMessage || "Welcome to NutriTrack! Start by logging your first meal."}
          </p>
        </div>
      )}

      <div className="flex gap-3 w-full max-w-xs">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">
          Back
        </button>
        <button
          onClick={onFinish}
          disabled={loading}
          className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          Start Tracking
        </button>
      </div>
    </div>
  );
}
