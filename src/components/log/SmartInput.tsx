"use client";
import { useState } from "react";

interface SmartInputProps {
  onSubmit: (query: string) => void;
  onScanBarcode: () => void;
  loading?: boolean;
}

export default function SmartInput({ onSubmit, onScanBarcode, loading }: SmartInputProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Try "2 eggs and toast with butter"'
        className="w-full rounded-2xl border border-gray-300 pl-4 pr-24 py-3.5 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        disabled={loading}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <button
          type="button"
          onClick={onScanBarcode}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Scan barcode"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2M7 8h10M7 12h10M7 16h10" />
          </svg>
        </button>
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="bg-emerald-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
        >
          {loading ? "..." : "Go"}
        </button>
      </div>
    </form>
  );
}
