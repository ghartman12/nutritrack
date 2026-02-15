"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

interface ExerciseFormProps {
  onSubmit: (data: { activity: string; durationMinutes: number; estimatedCalories: number; isEstimate: boolean; notes: string }) => void;
  loading?: boolean;
}

export default function ExerciseForm({ onSubmit, loading }: ExerciseFormProps) {
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState<number | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [isEstimate, setIsEstimate] = useState(true);
  const [notes, setNotes] = useState("");
  const [manualCalories, setManualCalories] = useState("");

  const handleEstimate = async () => {
    if (!activity.trim() || !duration) return;
    setEstimating(true);
    try {
      const res = await fetch("/api/exercise/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: activity.trim(),
          durationMinutes: parseInt(duration),
          activityLevel: "moderate",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCalories(data.calories);
        setIsEstimate(true);
      }
    } catch {
      // Silently fail — user can enter manually
    } finally {
      setEstimating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cal = manualCalories ? parseFloat(manualCalories) : calories;
    if (!activity.trim() || !duration || cal === null) return;
    onSubmit({
      activity: activity.trim(),
      durationMinutes: parseInt(duration),
      estimatedCalories: cal,
      isEstimate: !manualCalories,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Activity"
        value={activity}
        onChange={(e) => setActivity(e.target.value)}
        placeholder="e.g., Running, Yoga, Weight training"
        required
      />
      <Input
        label="Duration (minutes)"
        type="number"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        placeholder="30"
        required
      />

      {!calories && !manualCalories && (
        <button
          type="button"
          onClick={handleEstimate}
          disabled={!activity.trim() || !duration || estimating}
          className="w-full py-2.5 rounded-xl bg-purple-100 text-purple-800 font-medium hover:bg-purple-200 disabled:opacity-50 transition-colors text-sm"
        >
          {estimating ? "Estimating..." : "Get AI Calorie Estimate"}
        </button>
      )}

      {calories !== null && !manualCalories && (
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-purple-900">{calories}</span>
              <span className="text-purple-600 ml-1">cal burned</span>
            </div>
            <Badge variant="ai" tooltip="This is an AI estimate and may not be accurate. Not intended as medical advice. Consult a healthcare professional for personalized nutrition guidance.">AI estimate</Badge>
          </div>
          <button
            type="button"
            onClick={() => {
              setManualCalories(String(calories));
              setCalories(null);
            }}
            className="text-xs text-purple-600 mt-2 hover:underline"
          >
            Tap to adjust
          </button>
        </div>
      )}

      {(manualCalories || (calories === null && !estimating)) && (
        <Input
          label="Calories Burned"
          type="number"
          value={manualCalories}
          onChange={(e) => {
            setManualCalories(e.target.value);
            setIsEstimate(false);
          }}
          placeholder="Enter calories burned"
        />
      )}

      <Input
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any additional details"
      />

      <button
        type="submit"
        disabled={loading || !activity.trim() || !duration || (calories === null && !manualCalories)}
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving..." : "Log Exercise"}
      </button>
    </form>
  );
}
