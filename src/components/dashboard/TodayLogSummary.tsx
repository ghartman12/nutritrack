"use client";
import { useState } from "react";
import { mealTypeLabels, mealTypeEmoji, type MealType } from "@/lib/meal-type";

interface FoodEntry {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  mealType: string;
}

interface ExerciseEntry {
  id: string;
  activity: string;
  durationMinutes: number;
  estimatedCalories: number;
}

interface WeightEntry {
  id: string;
  weight: number;
  unit: string;
}

interface TodayLogSummaryProps {
  foods: FoodEntry[];
  exercises: ExerciseEntry[];
  weights?: WeightEntry[];
  emptyStateMessage?: string | null;
  onEditFood?: (id: string, data: Partial<FoodEntry>) => Promise<void>;
  onDeleteFood?: (id: string) => Promise<void>;
  onEditExercise?: (id: string, data: Partial<ExerciseEntry>) => Promise<void>;
  onDeleteExercise?: (id: string) => Promise<void>;
  onEditWeight?: (id: string, data: Partial<WeightEntry>) => Promise<void>;
  onDeleteWeight?: (id: string) => Promise<void>;
}

const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function FoodEditForm({
  entry,
  onSave,
  onCancel,
}: {
  entry: FoodEntry;
  onSave: (data: Partial<FoodEntry>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    foodName: entry.foodName,
    calories: entry.calories,
    protein: entry.protein,
    carbs: entry.carbs,
    fat: entry.fat,
  });

  return (
    <div className="mt-2 space-y-2">
      <input
        value={form.foodName}
        onChange={(e) => setForm((p) => ({ ...p, foodName: e.target.value }))}
        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
      />
      <div className="grid grid-cols-4 gap-2">
        {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
          <div key={field}>
            <label className="block text-xs text-gray-400 mb-0.5 capitalize">{field === "calories" ? "Cal" : field.charAt(0).toUpperCase()}</label>
            <input
              type="number"
              value={form[field]}
              onChange={(e) => setForm((p) => ({ ...p, [field]: parseFloat(e.target.value) || 0 }))}
              className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
        <button onClick={() => onSave(form)} className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700">Save</button>
      </div>
    </div>
  );
}

function ExerciseEditForm({
  entry,
  onSave,
  onCancel,
}: {
  entry: ExerciseEntry;
  onSave: (data: Partial<ExerciseEntry>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    activity: entry.activity,
    durationMinutes: entry.durationMinutes,
    estimatedCalories: entry.estimatedCalories,
  });

  return (
    <div className="mt-2 space-y-2">
      <input
        value={form.activity}
        onChange={(e) => setForm((p) => ({ ...p, activity: e.target.value }))}
        className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        placeholder="Activity"
      />
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs text-gray-400 mb-0.5">Minutes</label>
          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) => setForm((p) => ({ ...p, durationMinutes: parseInt(e.target.value) || 0 }))}
            className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-0.5">Calories</label>
          <input
            type="number"
            value={form.estimatedCalories}
            onChange={(e) => setForm((p) => ({ ...p, estimatedCalories: parseFloat(e.target.value) || 0 }))}
            className="w-full px-2 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
        <button onClick={() => onSave(form)} className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700">Save</button>
      </div>
    </div>
  );
}

function WeightEditForm({
  entry,
  onSave,
  onCancel,
}: {
  entry: WeightEntry;
  onSave: (data: Partial<WeightEntry>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    weight: entry.weight,
    unit: entry.unit,
  });

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-0.5">Weight</label>
          <input
            type="number"
            step="0.1"
            value={form.weight}
            onChange={(e) => setForm((p) => ({ ...p, weight: parseFloat(e.target.value) || 0 }))}
            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-0.5">Unit</label>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {["lbs", "kg"].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setForm((p) => ({ ...p, unit: u }))}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  form.unit === u ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">Cancel</button>
        <button onClick={() => onSave(form)} className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700">Save</button>
      </div>
    </div>
  );
}

function ActionButtons({
  id,
  deletingId,
  onEdit,
  onDelete,
}: {
  id: string;
  deletingId: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-2 mt-1 ml-1">
      <button onClick={onEdit} className="px-3 py-1 rounded-lg border border-gray-300 text-xs text-gray-600 hover:bg-gray-50">Edit</button>
      <button
        onClick={onDelete}
        disabled={deletingId === id}
        className="px-3 py-1 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {deletingId === id ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}

export default function TodayLogSummary({
  foods,
  exercises,
  weights = [],
  emptyStateMessage,
  onEditFood,
  onDeleteFood,
  onEditExercise,
  onDeleteExercise,
  onEditWeight,
  onDeleteWeight,
}: TodayLogSummaryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (foods.length === 0 && exercises.length === 0 && weights.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-gray-600 text-sm">
          {emptyStateMessage || "No entries yet today. Tap the + button to log your first meal!"}
        </p>
      </div>
    );
  }

  const mealGroups = foods.reduce<Record<string, FoodEntry[]>>((acc, food) => {
    const key = food.mealType;
    if (!acc[key]) acc[key] = [];
    acc[key].push(food);
    return acc;
  }, {});

  const sortedMealTypes = MEAL_ORDER.filter((m) => mealGroups[m]);

  const toggle = (id: string) => {
    if (editingId) return;
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = async (id: string, deleteFn?: (id: string) => Promise<void>) => {
    if (!deleteFn) return;
    setDeletingId(id);
    await deleteFn(id);
    setDeletingId(null);
    setExpandedId(null);
  };

  const finishEdit = () => {
    setEditingId(null);
    setExpandedId(null);
  };

  return (
    <div className="space-y-3">
      {sortedMealTypes.map((mealType) => {
        const entries = mealGroups[mealType];
        return (
          <div key={mealType} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <span>{mealTypeEmoji[mealType] || "🍽️"}</span>
              <h4 className="text-sm font-semibold text-gray-900">
                {mealTypeLabels[mealType] || mealType}
              </h4>
              <span className="text-xs text-gray-400 ml-auto">
                {Math.round(entries.reduce((s, e) => s + e.calories, 0))} cal
              </span>
            </div>
            <div className="space-y-1">
              {entries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const isEditing = editingId === entry.id;

                return (
                  <div key={entry.id}>
                    <button
                      onClick={() => toggle(entry.id)}
                      className="w-full text-left py-1.5 rounded-lg hover:bg-gray-50 transition-colors -mx-1 px-1"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">{entry.foodName}</span>
                        <span className="text-gray-400">{Math.round(entry.calories)} cal</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        P:{Math.round(entry.protein)}g · C:{Math.round(entry.carbs)}g · F:{Math.round(entry.fat)}g
                      </div>
                    </button>

                    {isExpanded && !isEditing && onEditFood && onDeleteFood && (
                      <ActionButtons
                        id={entry.id}
                        deletingId={deletingId}
                        onEdit={() => setEditingId(entry.id)}
                        onDelete={() => handleDelete(entry.id, onDeleteFood)}
                      />
                    )}

                    {isEditing && (
                      <FoodEditForm
                        entry={entry}
                        onSave={async (data) => { await onEditFood?.(entry.id, data); finishEdit(); }}
                        onCancel={() => setEditingId(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {exercises.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span>🏃</span>
            <h4 className="text-sm font-semibold text-gray-900">Exercise</h4>
            <span className="text-xs text-gray-400 ml-auto">
              -{Math.round(exercises.reduce((s, e) => s + e.estimatedCalories, 0))} cal
            </span>
          </div>
          <div className="space-y-1">
            {exercises.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const isEditing = editingId === entry.id;

              return (
                <div key={entry.id}>
                  <button
                    onClick={() => toggle(entry.id)}
                    className="w-full text-left py-1.5 rounded-lg hover:bg-gray-50 transition-colors -mx-1 px-1"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{entry.activity}</span>
                      <span className="text-gray-400">-{Math.round(entry.estimatedCalories)} cal</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {entry.durationMinutes} min
                    </div>
                  </button>

                  {isExpanded && !isEditing && onEditExercise && onDeleteExercise && (
                    <ActionButtons
                      id={entry.id}
                      deletingId={deletingId}
                      onEdit={() => setEditingId(entry.id)}
                      onDelete={() => handleDelete(entry.id, onDeleteExercise)}
                    />
                  )}

                  {isEditing && (
                    <ExerciseEditForm
                      entry={entry}
                      onSave={async (data) => { await onEditExercise?.(entry.id, data); finishEdit(); }}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {weights.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <span>⚖️</span>
            <h4 className="text-sm font-semibold text-gray-900">Weight</h4>
          </div>
          <div className="space-y-1">
            {weights.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const isEditing = editingId === entry.id;

              return (
                <div key={entry.id}>
                  <button
                    onClick={() => toggle(entry.id)}
                    className="w-full text-left py-1.5 rounded-lg hover:bg-gray-50 transition-colors -mx-1 px-1"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{entry.weight} {entry.unit}</span>
                    </div>
                  </button>

                  {isExpanded && !isEditing && onEditWeight && onDeleteWeight && (
                    <ActionButtons
                      id={entry.id}
                      deletingId={deletingId}
                      onEdit={() => setEditingId(entry.id)}
                      onDelete={() => handleDelete(entry.id, onDeleteWeight)}
                    />
                  )}

                  {isEditing && (
                    <WeightEditForm
                      entry={entry}
                      onSave={async (data) => { await onEditWeight?.(entry.id, data); finishEdit(); }}
                      onCancel={() => setEditingId(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
