"use client";

import { useState, useMemo } from "react";
import { mealTypeLabels } from "@/lib/meal-type";

interface SavedMealCardProps {
  meal: {
    id: string;
    name: string;
    items: any[];
    updatedAt: string;
    lastLoggedAt?: string | null;
    lastLoggedMealType?: string | null;
  };
  onLog: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SavedMealCard({
  meal,
  onLog,
  onEdit,
  onDelete,
}: SavedMealCardProps) {
  const [expanded, setExpanded] = useState(false);

  const totalCalories = useMemo(
    () =>
      meal.items.reduce(
        (sum: number, item: any) =>
          sum + (item.calories || 0) * (item.quantity || 1),
        0
      ),
    [meal.items]
  );

  const formattedDate = useMemo(() => {
    try {
      return new Date(meal.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }, [meal.updatedAt]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md">
      {/* Header — clickable to expand */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-gray-900">
            {meal.name}
          </h3>
          <p className="mt-0.5 text-sm text-gray-500">
            {meal.items.length} {meal.items.length === 1 ? "item" : "items"}
            {" · "}
            {Math.round(totalCalories)} cal
            {formattedDate && ` · ${formattedDate}`}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className={`ml-2 h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable item list */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-3 pt-2">
          <ul className="space-y-1.5">
            {meal.items.map((item: any, idx: number) => (
              <li
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate text-gray-700">
                  {item.foodName}
                  {item.quantity > 1 && (
                    <span className="ml-1 text-gray-400">x{item.quantity}</span>
                  )}
                </span>
                <span className="ml-2 shrink-0 text-gray-500">
                  {Math.round((item.calories || 0) * (item.quantity || 1))} cal
                  <span className="ml-1.5 text-xs text-gray-400">
                    P{Math.round(item.protein || 0)} · C{Math.round(item.carbs || 0)} · F{Math.round(item.fat || 0)}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {/* Action buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onLog(meal.id)}
              className="flex-1 rounded-xl bg-emerald-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Log this meal
            </button>
            <button
              type="button"
              onClick={() => onEdit(meal.id)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(meal.id)}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
            >
              Delete
            </button>
          </div>

          {/* Last logged info */}
          <p className="mt-2 text-xs text-gray-400">
            {meal.lastLoggedAt
              ? `Last logged: ${new Date(meal.lastLoggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at ${new Date(meal.lastLoggedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} as ${mealTypeLabels[meal.lastLoggedMealType as keyof typeof mealTypeLabels] ?? meal.lastLoggedMealType}`
              : "Never logged"}
          </p>
        </div>
      )}
    </div>
  );
}
