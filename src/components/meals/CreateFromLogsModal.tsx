"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface CreateFromLogsModalProps {
  onClose: () => void;
  onSelectEntries: (entries: any[]) => void;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function CreateFromLogsModal({
  onClose,
  onSelectEntries,
}: CreateFromLogsModalProps) {
  const [date, setDate] = useState(todayStr());
  const [entries, setEntries] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadEntries() {
    setLoading(true);
    setLoaded(false);
    setSelected(new Set());
    try {
      const res = await apiFetch(`/api/food?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      } else {
        setEntries([]);
      }
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }

  function toggleEntry(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === entries.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(entries.map((_, i) => i)));
    }
  }

  function handleUseSelected() {
    const selectedEntries = entries.filter((_, i) => selected.has(i));
    onSelectEntries(selectedEntries);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-gray-100 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Create from Recent Logs
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Date picker + Load */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="button"
              onClick={loadEntries}
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load entries"}
            </button>
          </div>

          {/* Entries list */}
          {loaded && entries.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-500">
              No entries for this date
            </p>
          )}

          {entries.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"} found
                </p>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  {selected.size === entries.length ? "Deselect all" : "Select all"}
                </button>
              </div>

              <ul className="max-h-60 space-y-1 overflow-y-auto">
                {entries.map((entry: any, idx: number) => (
                  <li key={idx}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selected.has(idx)}
                        onChange={() => toggleEntry(idx)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {entry.foodName || entry.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.calories} cal · P{entry.protein || 0} · C{entry.carbs || 0} · F{entry.fat || 0}
                        </p>
                      </div>
                    </label>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Footer */}
        {entries.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              type="button"
              onClick={handleUseSelected}
              disabled={selected.size === 0}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              Use selected ({selected.size})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
