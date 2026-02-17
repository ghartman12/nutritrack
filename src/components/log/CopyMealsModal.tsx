"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { mealTypeLabels, mealTypeEmoji, type MealType } from "@/lib/meal-type";
import { apiFetch } from "@/lib/api";

interface CopyMealsModalProps {
  onCopy: (entries: any[], sourceDateLabel: string) => void;
  onClose: () => void;
}

const mealTypes: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export default function CopyMealsModal({ onCopy, onClose }: CopyMealsModalProps) {
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  });
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(mealTypes));
  const [preserveTypes, setPreserveTypes] = useState(true);

  const fetchEntries = useCallback(async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/food?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
        // Select all types that have entries
        const types = new Set<string>(data.map((e: any) => e.mealType));
        setSelectedTypes(types);
      } else {
        setEntries([]);
        setSelectedTypes(new Set());
      }
    } catch {
      setEntries([]);
      setSelectedTypes(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries(date);
  }, [date, fetchEntries]);

  const grouped = useMemo(() => {
    const groups: Record<string, { items: any[]; totalCal: number }> = {};
    for (const entry of entries) {
      const type = entry.mealType || "snack";
      if (!groups[type]) groups[type] = { items: [], totalCal: 0 };
      groups[type].items.push(entry);
      groups[type].totalCal += entry.calories || 0;
    }
    return groups;
  }, [entries]);

  const selectedEntries = useMemo(
    () => entries.filter((e) => selectedTypes.has(e.mealType)),
    [entries, selectedTypes]
  );

  const totalCal = useMemo(
    () => selectedEntries.reduce((s, e) => s + (e.calories || 0), 0),
    [selectedEntries]
  );

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const formattedDate = useMemo(() => {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [date]);

  const handleCopy = () => {
    if (selectedEntries.length === 0) return;
    onCopy(
      preserveTypes
        ? selectedEntries
        : selectedEntries.map((e) => ({ ...e, mealType: undefined })),
      formattedDate
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col p-5 sm:mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Copy Meals</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Date picker */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Copy from which day?</label>
          <input
            type="date"
            value={date}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Meal type checkboxes */}
        <div className="flex-1 overflow-y-auto mb-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              No entries found for {formattedDate}.
            </div>
          ) : (
            <div className="space-y-2">
              {mealTypes.map((type) => {
                const group = grouped[type];
                if (!group) return null;
                const checked = selectedTypes.has(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`w-full flex items-center gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors ${
                      checked
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      checked ? "border-emerald-600 bg-emerald-600" : "border-gray-300"
                    }`}>
                      {checked && (
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-base">{mealTypeEmoji[type]}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900">
                        {mealTypeLabels[type]}
                      </span>
                      <span className="text-xs text-gray-500 ml-1.5">
                        {group.items.length} {group.items.length === 1 ? "item" : "items"} &middot; {Math.round(group.totalCal)} cal
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Preserve meal types toggle */}
        {selectedEntries.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setPreserveTypes((p) => !p)}
              className="flex items-center gap-2 text-xs text-gray-500"
            >
              <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                preserveTypes ? "border-emerald-600 bg-emerald-600" : "border-gray-300"
              }`}>
                {preserveTypes && (
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              Keep original meal types
            </button>
          </div>
        )}

        {/* Preview */}
        {selectedEntries.length > 0 && (
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 mb-4">
            Copying <span className="font-semibold">{selectedEntries.length} {selectedEntries.length === 1 ? "item" : "items"}</span>
            {" "}({Math.round(totalCal).toLocaleString()} cal) from{" "}
            <span className="font-semibold">{formattedDate}</span> to today
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={selectedEntries.length === 0}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            Copy {selectedEntries.length > 0 ? `${selectedEntries.length} items` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
