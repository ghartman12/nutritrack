"use client";
import { useState, useEffect } from "react";
import CustomFoodForm from "@/components/log/CustomFoodForm";

interface CustomFood {
  id: string;
  foodName: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
}

interface CustomFoodListProps {
  onToast: (message: string, type: "success" | "error") => void;
}

export default function CustomFoodList({ onToast }: CustomFoodListProps) {
  const [foods, setFoods] = useState<CustomFood[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFoods = async () => {
    try {
      const res = await fetch("/api/custom-foods");
      if (res.ok) setFoods(await res.json());
    } catch { /* non-critical */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFoods(); }, []);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/custom-foods/${id}`, { method: "DELETE" });
    if (res.ok) {
      onToast("Custom food deleted.", "success");
      fetchFoods();
    } else {
      onToast("Failed to delete.", "error");
    }
  };

  const handleEdit = async (id: string, data: any) => {
    const res = await fetch(`/api/custom-foods/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      onToast("Custom food updated.", "success");
      setEditingId(null);
      fetchFoods();
    } else {
      onToast("Failed to update.", "error");
    }
  };

  if (loading) return null;
  if (foods.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No custom foods yet. Create one from the Log page.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {foods.map((food) =>
        editingId === food.id ? (
          <CustomFoodForm
            key={food.id}
            initialData={{ ...food, fiber: food.fiber ?? 0 }}
            onSubmit={(data) => handleEdit(food.id, data)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div
            key={food.id}
            className="bg-white rounded-xl p-4 border border-gray-100"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-gray-900 text-sm">{food.foodName}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {food.servingSize} &middot; {Math.round(food.calories)} cal &middot; P:{Math.round(food.protein)}g &middot; C:{Math.round(food.carbs)}g &middot; F:{Math.round(food.fat)}g
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(food.id)}
                  className="text-xs text-emerald-600 hover:text-emerald-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(food.id)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
