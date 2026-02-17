"use client";
import { useState, useEffect, useCallback } from "react";
import PageContainer from "@/components/layout/PageContainer";
import BottomNav from "@/components/layout/BottomNav";
import WeightChart from "@/components/progress/WeightChart";
import CalorieChart from "@/components/progress/CalorieChart";
import MacroChart from "@/components/progress/MacroChart";
import ExerciseChart from "@/components/progress/ExerciseChart";
import { useUser } from "@/hooks/useUser";
import { apiFetch } from "@/lib/api";

interface DayAgg {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ExerciseDayAgg {
  date: string;
  minutes: number;
  calories: number;
}

export default function ProgressPage() {
  const { user } = useUser();
  const [weights, setWeights] = useState<any[]>([]);
  const [calorieDays, setCalorieDays] = useState<DayAgg[]>([]);
  const [macroDays, setMacroDays] = useState<DayAgg[]>([]);
  const [exerciseDays, setExerciseDays] = useState<ExerciseDayAgg[]>([]);
  const fetchData = useCallback(async () => {
    const weightRes = await apiFetch("/api/weight?days=90");

    if (weightRes.ok) setWeights(await weightRes.json());

    // Aggregate food data by day for the last 30 days
    const days: DayAgg[] = [];
    const exDays: ExerciseDayAgg[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const [foodRes, exRes] = await Promise.all([
        apiFetch(`/api/food?date=${dateStr}`),
        apiFetch(`/api/exercise?date=${dateStr}`),
      ]);

      if (foodRes.ok) {
        const foods = await foodRes.json();
        if (foods.length > 0) {
          days.push({
            date: dateStr,
            calories: foods.reduce((s: number, f: any) => s + f.calories, 0),
            protein: foods.reduce((s: number, f: any) => s + f.protein, 0),
            carbs: foods.reduce((s: number, f: any) => s + f.carbs, 0),
            fat: foods.reduce((s: number, f: any) => s + f.fat, 0),
          });
        }
      }

      if (exRes.ok) {
        const exercises = await exRes.json();
        if (exercises.length > 0) {
          exDays.push({
            date: dateStr,
            minutes: exercises.reduce((s: number, e: any) => s + e.durationMinutes, 0),
            calories: exercises.reduce((s: number, e: any) => s + e.estimatedCalories, 0),
          });
        }
      }
    }
    setCalorieDays(days);
    setMacroDays(days);
    setExerciseDays(exDays);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <PageContainer>
      <div className="px-5 pt-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Progress</h1>

        <WeightChart entries={weights} />
        <CalorieChart data={calorieDays} goal={user?.settings?.calorieGoal || 2000} />
        <MacroChart data={macroDays} />
        <ExerciseChart data={exerciseDays} />
      </div>
      <BottomNav />
    </PageContainer>
  );
}
