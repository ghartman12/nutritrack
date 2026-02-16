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

export default function WaterTab() {
  const { user } = useUser();
  const [entries, setEntries] = useState<WaterEntryData[]>([]);
  const [totalOunces, setTotalOunces] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const todayDate = new Date().toISOString().split("T")[0];
  const waterUnit = user?.settings?.waterUnit || "oz";
  const isMetric = waterUnit === "mL";
  const goal = isMetric ? 2000 : 64;
  const unit = isMetric ? "mL" : "oz";

  const displayTotal = isMetric ? Math.round(totalOunces * OZ_TO_ML) : totalOunces;
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

  return (
    <div className="space-y-4">
      <WaterWidget ounces={totalOunces} onUpdate={handleUpdate} waterUnit={waterUnit} loading={loading} />

      <div className="text-center">
        <span className="text-sm font-medium text-gray-700">
          {displayTotal} / {goal} {unit} today
        </span>
      </div>

      {entries.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Today&apos;s Entries</h4>
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
          No water logged yet today. Use the buttons above to get started.
        </p>
      )}

      <p className="text-xs text-center text-gray-400">
        Track your daily water intake. Aim for {isMetric ? "2000 mL" : "64 oz"} a day.
      </p>
    </div>
  );
}
