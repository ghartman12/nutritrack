"use client";
import { useState, useEffect, useCallback } from "react";
import WaterWidget from "@/components/dashboard/WaterWidget";
import { useUser } from "@/hooks/useUser";

interface WaterEntryData {
  id: string;
  ounces: number;
  date: string;
  createdAt: string;
}

const OZ_TO_ML = 29.5735;

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

interface WaterTabProps {
  date?: string;
}

export default function WaterTab({ date }: WaterTabProps) {
  const { user, refetch } = useUser();
  const [entries, setEntries] = useState<WaterEntryData[]>([]);
  const [totalOunces, setTotalOunces] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState("");

  const todayDate = date || new Date().toISOString().split("T")[0];
  const isToday = todayDate === new Date().toISOString().split("T")[0];
  const waterUnit = user?.settings?.waterUnit || "oz";
  const isMetric = waterUnit === "mL";
  const unit = isMetric ? "mL" : "oz";
  const waterGoal = user?.settings?.waterGoal ?? (isMetric ? 2000 : 64);

  const displayAmount = (oz: number) => isMetric ? Math.round(oz * OZ_TO_ML) : oz;

  const fetchWater = useCallback(async () => {
    try {
      const res = await fetch(`/api/water?date=${todayDate}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries);
        setTotalOunces(data.totalOunces);
      }
    } catch { /* non-critical */ }
  }, [todayDate]);

  useEffect(() => {
    fetchWater();
  }, [fetchWater]);

  const handleUpdate = async (newOunces: number) => {
    const delta = newOunces - totalOunces;
    if (delta === 0) return;
    setLoading(true);
    setTotalOunces(newOunces);
    try {
      if (delta > 0) {
        await fetch("/api/water", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ounces: delta, date: todayDate }),
        });
      } else if (entries.length > 0) {
        const mostRecent = entries[entries.length - 1];
        await fetch(`/api/water/${mostRecent.id}`, { method: "DELETE" });
      }
      await fetchWater();
    } catch {
      await fetchWater();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/water/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchWater();
      }
    } catch { /* non-critical */ }
    setDeletingId(null);
    setExpandedId(null);
  };

  const handleEditGoal = () => {
    setGoalInput(String(waterGoal));
    setEditingGoal(true);
  };

  const handleSaveGoal = async () => {
    const val = parseInt(goalInput) || 0;
    const min = isMetric ? 600 : 20;
    const max = isMetric ? 6000 : 200;
    const clamped = Math.max(min, Math.min(max, val));
    try {
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waterGoal: clamped }),
      });
      await refetch();
    } catch { /* non-critical */ }
    setEditingGoal(false);
  };

  return (
    <div className="space-y-4">
      <WaterWidget ounces={totalOunces} onUpdate={handleUpdate} waterUnit={waterUnit} waterGoal={waterGoal} loading={loading} />

      {entries.length > 0 ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-shadow duration-200 hover:shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-gray-900">{isToday ? "Today's" : "Day's"} Entries</h4>
            <span className="text-xs text-gray-400 ml-auto">{entries.length} entry{entries.length !== 1 ? "ies" : ""}</span>
          </div>
          <div className="space-y-1">
            {entries.map((entry) => {
              const isExpanded = expandedId === entry.id;
              return (
                <div key={entry.id}>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="w-full text-left py-1.5 rounded-lg hover:bg-gray-50 transition-colors -mx-1 px-1"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">
                        {formatTime(entry.createdAt)}
                      </span>
                      <span className="text-gray-500">
                        {displayAmount(entry.ounces)} {unit}
                      </span>
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="flex gap-2 mt-1 ml-1">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        className="px-3 py-1 rounded-lg border border-red-200 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === entry.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-xs text-center text-gray-400">
          No water logged{isToday ? " yet today" : " for this day"}. Use the buttons above to get started.
        </p>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        {editingGoal ? (
          <>
            <span>Goal:</span>
            <input
              type="number"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveGoal();
                if (e.key === "Escape") setEditingGoal(false);
              }}
              autoFocus
              min={isMetric ? 600 : 20}
              max={isMetric ? 6000 : 200}
              className="w-16 rounded-lg border border-gray-300 px-2 py-1 text-center text-xs focus:border-sky-500 focus:outline-none"
            />
            <span>{unit}</span>
            <button
              onClick={handleSaveGoal}
              className="text-sky-600 font-medium hover:text-sky-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditingGoal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <span>Your goal: {waterGoal} {unit}</span>
            <button
              onClick={handleEditGoal}
              className="text-sky-600 font-medium hover:text-sky-700"
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
