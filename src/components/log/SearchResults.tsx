"use client";
import Badge from "@/components/ui/Badge";
import type { FoodSearchResult } from "@/types";

interface SearchResultsProps {
  results: FoodSearchResult[];
  onSelect: (result: FoodSearchResult) => void;
  loading?: boolean;
  query?: string;
}

export default function SearchResults({ results, onSelect, loading, query }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-xl p-4 border border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No results found for &quot;{query}&quot;. Try a different search or enter manually.
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-500">Search Results</h4>
      {results.map((result, i) => (
        <button
          key={`${result.foodName}-${i}`}
          onClick={() => onSelect(result)}
          className="w-full text-left bg-white rounded-xl p-4 border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-medium text-gray-900 text-sm">{result.foodName}</div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round(result.calories)} cal &middot; P:{Math.round(result.protein)}g &middot; C:{Math.round(result.carbs)}g &middot; F:{Math.round(result.fat)}g
              </div>
              {result.nutrientsPer100g && (
                <div className="text-xs text-gray-400 mt-0.5">
                  {result.householdServingText
                    ? `Serving: ${result.householdServingText} (${result.servingSizeGrams ?? 100}g) · per 100g shown`
                    : "Per 100g shown"}
                </div>
              )}
            </div>
            <Badge
              variant={result.source === "ai" ? "ai" : result.source === "custom" ? "custom" : "default"}
              tooltip={result.source === "ai" ? "This is an AI estimate and may not be accurate. Not intended as medical advice. Consult a healthcare professional for personalized nutrition guidance." : undefined}
            >
              {result.source === "ai" ? "AI ESTIMATE" : result.source.toUpperCase()}
            </Badge>
          </div>
        </button>
      ))}
    </div>
  );
}
