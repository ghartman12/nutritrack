"use client";

import { useState, useEffect, useCallback } from "react";
import PageContainer from "@/components/layout/PageContainer";
import BottomNav from "@/components/layout/BottomNav";
import MealForm from "@/components/meals/MealForm";
import type { MealItemData } from "@/components/meals/MealForm";
import SavedMealCard from "@/components/meals/SavedMealCard";
import LogMealModal from "@/components/meals/LogMealModal";
import CreateFromLogsModal from "@/components/meals/CreateFromLogsModal";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { mealTypeLabels, type MealType } from "@/lib/meal-type";
import { apiFetch } from "@/lib/api";

export default function MealsPage() {
  const { toast, showToast, hideToast } = useToast();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateFromLogs, setShowCreateFromLogs] = useState(false);
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prefillData, setPrefillData] = useState<{
    name: string;
    items: MealItemData[];
  } | null>(null);

  const fetchMeals = useCallback(async () => {
    try {
      const res = await apiFetch("/api/meals");
      if (res.ok) {
        const data = await res.json();
        setMeals(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  async function handleCreate(data: { name: string; items: MealItemData[] }) {
    setSaving(true);
    try {
      const res = await apiFetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast("Meal saved!", "success");
        setShowCreate(false);
        setPrefillData(null);
        fetchMeals();
      } else {
        showToast("Failed to save meal.", "error");
      }
    } catch {
      showToast("Failed to save meal.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(data: { name: string; items: MealItemData[] }) {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/meals/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast("Meal updated!", "success");
        setEditingId(null);
        fetchMeals();
      } else {
        showToast("Failed to update meal.", "error");
      }
    } catch {
      showToast("Failed to update meal.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await apiFetch(`/api/meals/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Meal deleted.", "success");
        fetchMeals();
      } else {
        showToast("Failed to delete meal.", "error");
      }
    } catch {
      showToast("Failed to delete meal.", "error");
    }
  }

  async function handleLogConfirm(id: string, mealType: MealType, date: string) {
    setLogLoading(true);
    try {
      const res = await apiFetch(`/api/meals/${id}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealType, date }),
      });
      if (res.ok) {
        setLoggingMealId(null);
        showToast(`Logged to ${mealTypeLabels[mealType]}`, "success");
        fetchMeals();
      } else {
        showToast("Failed to log meal.", "error");
      }
    } catch {
      showToast("Failed to log meal.", "error");
    } finally {
      setLogLoading(false);
    }
  }

  function handleSelectEntries(entries: any[]) {
    const items: MealItemData[] = entries.map((e: any) => ({
      foodName: e.foodName || e.name || "",
      calories: e.calories || 0,
      protein: e.protein || 0,
      carbs: e.carbs || 0,
      fat: e.fat || 0,
      fiber: e.fiber || 0,
      quantity: e.quantity || 1,
    }));
    setPrefillData({ name: "", items });
    setShowCreateFromLogs(false);
    setShowCreate(true);
  }

  function startEditing(id: string) {
    const meal = meals.find((m) => m.id === id);
    if (!meal) return;
    setEditingId(id);
    setShowCreate(false);
    setPrefillData(null);
  }

  function cancelForm() {
    setShowCreate(false);
    setEditingId(null);
    setPrefillData(null);
  }

  const editingMeal = editingId
    ? meals.find((m) => m.id === editingId)
    : null;

  return (
    <PageContainer>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}

      <div className="px-5 pt-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Meals</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCreateFromLogs(true);
                setEditingId(null);
              }}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              From Recent Logs
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreate(true);
                setEditingId(null);
                setPrefillData(null);
              }}
              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              New Meal
            </button>
          </div>
        </div>

        {/* Create form */}
        {showCreate && !editingId && (
          <MealForm
            onSubmit={handleCreate}
            onCancel={cancelForm}
            loading={saving}
            initialData={prefillData ?? undefined}
          />
        )}

        {/* Edit form */}
        {editingId && editingMeal && (
          <MealForm
            key={editingId}
            onSubmit={handleEdit}
            onCancel={cancelForm}
            loading={saving}
            initialData={{
              name: editingMeal.name,
              items: editingMeal.items,
            }}
          />
        )}

        {/* Meals list */}
        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : meals.length === 0 && !showCreate ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
            <p className="text-gray-500">
              No saved meals yet. Create one to quickly log your favorite meals.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <SavedMealCard
                key={meal.id}
                meal={meal}
                onLog={(id) => setLoggingMealId(id)}
                onEdit={startEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Log meal confirmation modal */}
      {loggingMealId && (() => {
        const meal = meals.find((m) => m.id === loggingMealId);
        if (!meal) return null;
        return (
          <LogMealModal
            meal={meal}
            onConfirm={handleLogConfirm}
            onCancel={() => setLoggingMealId(null)}
            loading={logLoading}
          />
        );
      })()}

      {/* Create from logs modal */}
      {showCreateFromLogs && (
        <CreateFromLogsModal
          onClose={() => setShowCreateFromLogs(false)}
          onSelectEntries={handleSelectEntries}
        />
      )}

      <BottomNav />
    </PageContainer>
  );
}
