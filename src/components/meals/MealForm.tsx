"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";
import type { FoodSearchResult } from "@/types";
import { apiFetch } from "@/lib/api";

interface BaseRates {
  cal: number;
  pro: number;
  carbs: number;
  fat: number;
  fiber: number;
}

type ServingUnit = "g" | "oz";
const GRAMS_PER_OZ = 28.3495;

export interface MealItemData {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  quantity: number;
}

interface MealFormProps {
  onSubmit: (data: { name: string; items: MealItemData[] }) => void;
  onCancel: () => void;
  loading?: boolean;
  initialData?: { name: string; items: MealItemData[] };
}

const emptyItem: MealItemData = {
  foodName: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  quantity: 1,
};

export default function MealForm({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}: MealFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [items, setItems] = useState<MealItemData[]>(
    initialData?.items?.length ? initialData.items : [{ ...emptyItem }]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchResults, setSearchResults] = useState<FoodSearchResult[][]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean[]>([]);
  const [searchOpen, setSearchOpen] = useState<number | null>(null);
  const [servingGrams, setServingGrams] = useState<(number | null)[]>([]);
  const [servingUnit, setServingUnit] = useState<ServingUnit[]>([]);
  const [servingHelperText, setServingHelperText] = useState<(string | null)[]>([]);
  const baseRatesRef = useRef<(BaseRates | null)[]>([]);
  const dropdownRefs = useRef<(HTMLDivElement | null)[]>([]);

  const searchFood = useCallback(async (index: number, query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearchLoading((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
    setSearchOpen(index);

    try {
      const res = await apiFetch(`/api/food/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) throw new Error("Search failed");
      const data: FoodSearchResult[] = await res.json();
      setSearchResults((prev) => {
        const next = [...prev];
        next[index] = data;
        return next;
      });
    } catch {
      setSearchResults((prev) => {
        const next = [...prev];
        next[index] = [];
        return next;
      });
    } finally {
      setSearchLoading((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }
  }, []);

  function selectResult(index: number, result: FoodSearchResult) {
    let { calories, protein, carbs, fat, fiber } = result;

    if (result.nutrientsPer100g) {
      // Store per-100g base rates for serving size scaling
      baseRatesRef.current[index] = {
        cal: calories,
        pro: protein,
        carbs: carbs,
        fat: fat,
        fiber: fiber,
      };

      const grams = result.servingSizeGrams ?? 100;
      setServingGrams((prev) => {
        const next = [...prev];
        next[index] = grams;
        return next;
      });
      setServingUnit((prev) => {
        const next = [...prev];
        next[index] = "g";
        return next;
      });
      setServingHelperText((prev) => {
        const next = [...prev];
        next[index] = result.householdServingText
          ? `${result.householdServingText} (${grams}g)`
          : null;
        return next;
      });

      const scale = grams / 100;
      calories *= scale;
      protein *= scale;
      carbs *= scale;
      fat *= scale;
      fiber *= scale;
    } else {
      // Non-USDA food: clear any previous base rates
      baseRatesRef.current[index] = null;
      setServingGrams((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      setServingHelperText((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
    }

    setItems((prev) =>
      prev.map((item, i) =>
        i !== index
          ? item
          : {
              ...item,
              foodName: result.foodName,
              calories: Math.round(calories),
              protein: Math.round(protein),
              carbs: Math.round(carbs),
              fat: Math.round(fat),
              fiber: Math.round(fiber),
            }
      )
    );
    setSearchOpen(null);
  }

  function updateServingGrams(index: number, grams: number) {
    setServingGrams((prev) => {
      const next = [...prev];
      next[index] = grams;
      return next;
    });

    const rates = baseRatesRef.current[index];
    if (!rates) return;

    const scale = grams / 100;
    setItems((prev) =>
      prev.map((item, i) =>
        i !== index
          ? item
          : {
              ...item,
              calories: Math.round(rates.cal * scale),
              protein: Math.round(rates.pro * scale),
              carbs: Math.round(rates.carbs * scale),
              fat: Math.round(rates.fat * scale),
              fiber: Math.round(rates.fiber * scale),
            }
      )
    );
  }

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories * item.quantity,
        protein: acc.protein + item.protein * item.quantity,
        carbs: acc.carbs + item.carbs * item.quantity,
        fat: acc.fat + item.fat * item.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [items]);

  function addItem() {
    setSearchOpen(null);
    setItems((prev) => [...prev, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    setSearchOpen(null);
    setSearchResults((prev) => prev.filter((_, i) => i !== index));
    setSearchLoading((prev) => prev.filter((_, i) => i !== index));
    setServingGrams((prev) => prev.filter((_, i) => i !== index));
    setServingUnit((prev) => prev.filter((_, i) => i !== index));
    setServingHelperText((prev) => prev.filter((_, i) => i !== index));
    baseRatesRef.current = baseRatesRef.current.filter((_, i) => i !== index);
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof MealItemData, value: string) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        if (field === "foodName") {
          return { ...item, foodName: value };
        }
        const num = parseFloat(value) || 0;
        return { ...item, [field]: num };
      })
    );
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Meal name is required";
    } else if (name.length > 100) {
      newErrors.name = "Meal name must be 100 characters or less";
    }

    if (items.length === 0) {
      newErrors.items = "At least one item is required";
    }

    items.forEach((item, i) => {
      if (!item.foodName.trim()) {
        newErrors[`item_${i}_foodName`] = "Food name is required";
      }
      if (item.calories <= 0) {
        newErrors[`item_${i}_calories`] = "Calories must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), items });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-4"
    >
      <Input
        id="meal-name"
        label="Meal Name"
        placeholder="e.g. Morning Smoothie Bowl"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={100}
        error={errors.name}
      />

      {errors.items && (
        <p className="text-sm text-red-600">{errors.items}</p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <Input
                  id={`item-${index}-foodName`}
                  placeholder="Food name"
                  value={item.foodName}
                  onChange={(e) => updateItem(index, "foodName", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchFood(index, item.foodName);
                    }
                  }}
                  error={errors[`item_${index}_foodName`]}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (searchOpen === index) {
                    setSearchOpen(null);
                    setSearchResults((prev) => {
                      const next = [...prev];
                      next[index] = [];
                      return next;
                    });
                  } else {
                    searchFood(index, item.foodName);
                  }
                }}
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                aria-label="Search food"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Remove item"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search results dropdown */}
            {searchOpen === index && (
              <div
                ref={(el) => { dropdownRefs.current[index] = el; }}
                className="max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md"
              >
                {searchLoading[index] ? (
                  <div className="space-y-1 p-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse rounded-lg bg-gray-50 p-2">
                        <div className="h-3 w-3/4 rounded bg-gray-200 mb-1" />
                        <div className="h-2.5 w-1/2 rounded bg-gray-100" />
                      </div>
                    ))}
                  </div>
                ) : (searchResults[index] ?? []).length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-gray-500">
                    No results found. Try a different search or enter manually.
                  </div>
                ) : (
                  <div className="p-1">
                    {(searchResults[index] ?? []).map((result, ri) => (
                      <button
                        key={`${result.foodName}-${ri}`}
                        type="button"
                        onClick={() => selectResult(index, result)}
                        className="w-full rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-emerald-50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-gray-900">
                              {result.foodName}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {Math.round(result.calories)} cal &middot; P:{Math.round(result.protein)}g &middot; C:{Math.round(result.carbs)}g &middot; F:{Math.round(result.fat)}g
                            </div>
                            {result.nutrientsPer100g && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {result.householdServingText
                                  ? `${result.householdServingText} (${result.servingSizeGrams ?? 100}g)`
                                  : "Per 100g"}
                              </div>
                            )}
                          </div>
                          <Badge
                            variant={result.source === "custom" ? "custom" : "default"}
                            className="shrink-0 text-[10px]"
                          >
                            {result.source.toUpperCase()}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Serving size input for USDA foods */}
            {servingGrams[index] != null && (() => {
              const unit = servingUnit[index] ?? "g";
              const grams = servingGrams[index] ?? 0;
              const displayValue = unit === "oz"
                ? parseFloat((grams / GRAMS_PER_OZ).toFixed(1))
                : grams;
              return (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 whitespace-nowrap">Serving</label>
                  <input
                    type="number"
                    min={0}
                    step={unit === "oz" ? 0.1 : 1}
                    value={displayValue || ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      const inGrams = unit === "oz" ? val * GRAMS_PER_OZ : val;
                      updateServingGrams(index, inGrams);
                    }}
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <div className="inline-flex rounded-lg border border-gray-300 text-xs">
                    <button
                      type="button"
                      onClick={() => setServingUnit((prev) => {
                        const next = [...prev];
                        next[index] = "g";
                        return next;
                      })}
                      className={`rounded-l-lg px-2 py-1 transition-colors ${
                        unit === "g"
                          ? "bg-emerald-600 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      g
                    </button>
                    <button
                      type="button"
                      onClick={() => setServingUnit((prev) => {
                        const next = [...prev];
                        next[index] = "oz";
                        return next;
                      })}
                      className={`rounded-r-lg px-2 py-1 transition-colors ${
                        unit === "oz"
                          ? "bg-emerald-600 text-white"
                          : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      oz
                    </button>
                  </div>
                  {servingHelperText[index] && (
                    <span className="text-xs text-gray-400">{servingHelperText[index]}</span>
                  )}
                </div>
              );
            })()}

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Calories</label>
                <input
                  type="number"
                  min={0}
                  max={5000}
                  value={item.calories || ""}
                  onChange={(e) => updateItem(index, "calories", e.target.value)}
                  className={`w-full rounded-lg border px-2 py-1.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                    errors[`item_${index}_calories`]
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors[`item_${index}_calories`] && (
                  <p className="mt-0.5 text-xs text-red-600">Required</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Protein (g)</label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={item.protein || ""}
                  onChange={(e) => updateItem(index, "protein", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Carbs (g)</label>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={item.carbs || ""}
                  onChange={(e) => updateItem(index, "carbs", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Fat (g)</label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={item.fat || ""}
                  onChange={(e) => updateItem(index, "fat", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Fiber (g)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={item.fiber || ""}
                  onChange={(e) => updateItem(index, "fiber", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={item.quantity || 1}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:border-emerald-400 hover:text-emerald-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add item
      </button>

      {/* Totals */}
      <div className="rounded-xl bg-emerald-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">
          Totals
        </p>
        <div className="flex items-center justify-between text-sm text-emerald-800">
          <span>{Math.round(totals.calories)} cal</span>
          <span>{Math.round(totals.protein)}g protein</span>
          <span>{Math.round(totals.carbs)}g carbs</span>
          <span>{Math.round(totals.fat)}g fat</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Meal"}
        </button>
      </div>
    </form>
  );
}
