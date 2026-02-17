"use client";
import { useState, useEffect, useCallback } from "react";
import PageContainer from "@/components/layout/PageContainer";
import BottomNav from "@/components/layout/BottomNav";
import StreakBanner from "@/components/dashboard/StreakBanner";
import CalorieSummary from "@/components/dashboard/CalorieSummary";
import MacroBreakdown from "@/components/dashboard/MacroBreakdown";
import DigestCard from "@/components/dashboard/DigestCard";
import QuickLogButtons from "@/components/dashboard/QuickLogButtons";
import TodayLogSummary from "@/components/dashboard/TodayLogSummary";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const { toast, showToast, hideToast } = useToast();
  const [foods, setFoods] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);

  const fetchData = useCallback(async () => {
    const date = todayStr();
    const [foodRes, exRes, weightRes, streakRes] = await Promise.all([
      fetch(`/api/food?date=${date}`),
      fetch(`/api/exercise?date=${date}`),
      fetch(`/api/weight?date=${date}`),
      fetch("/api/streak"),
    ]);

    if (foodRes.ok) setFoods(await foodRes.json());
    if (exRes.ok) setExercises(await exRes.json());
    if (weightRes.ok) setWeights(await weightRes.json());
    if (streakRes.ok) setStreak(await streakRes.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check for streak milestone from URL params (set after food logging)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const milestone = params.get("milestone");
    if (milestone) {
      showToast(`🔥 ${milestone}-day streak! Keep it up!`, "success");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [showToast]);

  const handleEditFood = async (id: string, data: any) => {
    const res = await fetch(`/api/food/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast("Entry updated!", "success");
      fetchData();
    } else {
      showToast("Failed to update entry.", "error");
    }
  };

  const handleDeleteFood = async (id: string) => {
    const res = await fetch(`/api/food/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Entry deleted.", "success");
      fetchData();
    } else {
      showToast("Failed to delete entry.", "error");
    }
  };

  const handleEditExercise = async (id: string, data: any) => {
    const res = await fetch(`/api/exercise/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast("Exercise updated!", "success");
      fetchData();
    } else {
      showToast("Failed to update exercise.", "error");
    }
  };

  const handleDeleteExercise = async (id: string) => {
    const res = await fetch(`/api/exercise/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Exercise deleted.", "success");
      fetchData();
    } else {
      showToast("Failed to delete exercise.", "error");
    }
  };

  const handleEditWeight = async (id: string, data: any) => {
    const res = await fetch(`/api/weight/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast("Weight updated!", "success");
      fetchData();
    } else {
      showToast("Failed to update weight.", "error");
    }
  };

  const handleDeleteWeight = async (id: string) => {
    const res = await fetch(`/api/weight/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Weight deleted.", "success");
      fetchData();
    } else {
      showToast("Failed to delete weight.", "error");
    }
  };

  const settings = user?.settings;
  const totalCals = foods.reduce((s: number, f: any) => s + f.calories, 0);
  const totalProtein = foods.reduce((s: number, f: any) => s + f.protein, 0);
  const totalCarbs = foods.reduce((s: number, f: any) => s + f.carbs, 0);
  const totalFat = foods.reduce((s: number, f: any) => s + f.fat, 0);
  const totalBurned = exercises.reduce((s: number, e: any) => s + e.estimatedCalories, 0);

  if (userLoading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="px-5 pt-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Today
        </h1>

        {streak && streak.currentStreak > 0 && (
          <StreakBanner
            currentStreak={streak.currentStreak}
            longestStreak={streak.longestStreak}
          />
        )}

        <CalorieSummary
          consumed={totalCals}
          burned={totalBurned}
          goal={settings?.calorieGoal || 2000}
        />

        <MacroBreakdown
          protein={totalProtein}
          carbs={totalCarbs}
          fat={totalFat}
          proteinTarget={settings?.proteinTarget || 150}
          carbTarget={settings?.carbTarget || 250}
          fatTarget={settings?.fatTarget || 65}
        />

        <QuickLogButtons />

        <DigestCard streak={streak?.currentStreak || 0} hasLoggedToday={foods.length > 0} />

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Today&apos;s Log</h2>
          <TodayLogSummary
            foods={foods}
            exercises={exercises}
            weights={weights}
            emptyStateMessage={settings?.emptyStateMessage}
            onEditFood={handleEditFood}
            onDeleteFood={handleDeleteFood}
            onEditExercise={handleEditExercise}
            onDeleteExercise={handleDeleteExercise}
            onEditWeight={handleEditWeight}
            onDeleteWeight={handleDeleteWeight}
          />
        </div>
      </div>
      <BottomNav />
    </PageContainer>
  );
}
