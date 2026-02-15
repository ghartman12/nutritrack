"use client";
import { useState, useEffect } from "react";

interface RecentEntry {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number | null;
  mealType: string;
}

interface RecentEntriesProps {
  onLogAgain: (entry: RecentEntry) => void;
}

export default function RecentEntries({ onLogAgain }: RecentEntriesProps) {
  const [entries, setEntries] = useState<RecentEntry[]>([]);

  useEffect(() => {
    async function fetchRecent() {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/food?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.slice(0, 5));
      }
    }
    fetchRecent();
  }, []);

  if (entries.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500 mb-2">Recent</h4>
      <div className="space-y-2">
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onLogAgain(entry)}
            className="w-full text-left bg-white rounded-xl p-3 border border-gray-100 hover:border-emerald-200 transition-colors flex justify-between items-center"
          >
            <div>
              <div className="text-sm font-medium text-gray-900">{entry.foodName}</div>
              <div className="text-xs text-gray-500">{Math.round(entry.calories)} cal</div>
            </div>
            <span className="text-xs text-emerald-600 font-medium">Log again</span>
          </button>
        ))}
      </div>
    </div>
  );
}
