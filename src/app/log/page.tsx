"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import BottomNav from "@/components/layout/BottomNav";
import SmartInput from "@/components/log/SmartInput";
import BarcodeScanner from "@/components/log/BarcodeScanner";
import MealTypeSelector from "@/components/log/MealTypeSelector";
import NutritionConfirm from "@/components/log/NutritionConfirm";
import ManualEntryForm from "@/components/log/ManualEntryForm";
import SearchResults from "@/components/log/SearchResults";
import RecentEntries from "@/components/log/RecentEntries";
import CustomFoodForm from "@/components/log/CustomFoodForm";
import CopyMealsModal from "@/components/log/CopyMealsModal";
import WaterTab from "@/components/log/WaterTab";
import TodayLogSummary from "@/components/dashboard/TodayLogSummary";
import ExerciseForm from "@/components/exercise/ExerciseForm";
import WeightForm from "@/components/weight/WeightForm";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";
import { suggestMealType, type MealType } from "@/lib/meal-type";
import type { NutritionEstimate, FoodSearchResult } from "@/types";

function LogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { toast, showToast, hideToast } = useToast();

  const initialTab = searchParams.get("tab") || "food";
  const [tab, setTab] = useState<"food" | "exercise" | "weight" | "water">(initialTab as any);
  const [mealType, setMealType] = useState<MealType>(suggestMealType());
  const [showScanner, setShowScanner] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showCustomFood, setShowCustomFood] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyingMeals, setCopyingMeals] = useState(false);
  const [nlpLoading, setNlpLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionEstimate | null>(null);
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [savedSearchResults, setSavedSearchResults] = useState<FoodSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [entryMethod, setEntryMethod] = useState<string>("nlp");
  const [dateFoods, setDateFoods] = useState<any[]>([]);
  const [dateExercises, setDateExercises] = useState<any[]>([]);
  const [dateWeights, setDateWeights] = useState<any[]>([]);
  const [formResetKey, setFormResetKey] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const isToday = selectedDate === todayStr;

  function formatDateLabel(dateStr: string): string {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const d = new Date(dateStr + "T12:00:00");
    const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (dateStr === today) return `Today, ${formatted}`;
    if (dateStr === yesterdayStr) return `Yesterday, ${formatted}`;
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    return `${dayName}, ${formatted}`;
  }

  function shortDateLabel(dateStr: string): string {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const navigateDate = (delta: number) => {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const fetchFoods = async (d: string) => {
    try {
      const res = await fetch(`/api/food?date=${d}`);
      if (res.ok) setDateFoods(await res.json());
    } catch { /* non-critical */ }
  };

  const fetchExercises = async (d: string) => {
    try {
      const res = await fetch(`/api/exercise?date=${d}`);
      if (res.ok) setDateExercises(await res.json());
    } catch { /* non-critical */ }
  };

  const fetchWeights = async (d: string) => {
    try {
      const res = await fetch(`/api/weight?date=${d}`);
      if (res.ok) setDateWeights(await res.json());
    } catch { /* non-critical */ }
  };

  const refreshData = () => {
    fetchFoods(selectedDate);
    fetchExercises(selectedDate);
    fetchWeights(selectedDate);
  };

  useEffect(() => {
    refreshData();
  }, [selectedDate]);

  const handleSmartInput = async (query: string) => {
    setSearchResults([]);
    setNutritionData(null);
    setSearchLoading(true);
    setSearchQuery(query);
    setEntryMethod("search");

    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch {
      showToast("Search failed. Try manual entry.", "error");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTryAIEstimate = async () => {
    if (!searchQuery) return;
    setNlpLoading(true);
    try {
      const res = await fetch("/api/food/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, variations: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSearchResults(data);
          setEntryMethod("search");
        } else if (data && !Array.isArray(data)) {
          setNutritionData(data);
          setEntryMethod("nlp");
        }
      } else {
        showToast("AI estimation failed. Try manual entry.", "error");
      }
    } catch {
      showToast("AI estimation failed. Try manual entry.", "error");
    } finally {
      setNlpLoading(false);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    setShowScanner(false);
    setNlpLoading(true);
    setEntryMethod("barcode");
    try {
      const res = await fetch(`/api/food/barcode?code=${barcode}`);
      if (res.ok) {
        const data = await res.json();
        setNutritionData(data);
      } else {
        const err = await res.json();
        showToast(err.error || "Product not found. Try searching by name.", "error");
      }
    } catch {
      showToast("Barcode lookup failed. Try searching by name.", "error");
    } finally {
      setNlpLoading(false);
    }
  };

  const parseQuantityFromQuery = (query: string): number | undefined => {
    const match = query.match(/^(\d+(?:\.\d+)?)\s+/);
    if (match) {
      const q = parseFloat(match[1]);
      if (q > 1) return q;
    }
    return undefined;
  };

  const handleSearchSelect = (result: FoodSearchResult) => {
    setSavedSearchResults(searchResults);
    setNutritionData({
      foodName: result.foodName,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      fiber: result.fiber,
      isEstimate: false,
      quantity: parseQuantityFromQuery(searchQuery),
      servingSizeGrams: result.servingSizeGrams,
      householdServingText: result.householdServingText,
      nutrientsPer100g: result.nutrientsPer100g,
    });
    setSearchResults([]);
    setEntryMethod("search");
  };

  const handleBackToResults = () => {
    setNutritionData(null);
    setSearchResults(savedSearchResults);
  };

  const handleSaveFood = async (data: NutritionEstimate) => {
    setSaveLoading(true);
    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          foodName: data.foodName,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fat,
          fiber: data.fiber,
          entryMethod,
          isEstimate: data.isEstimate,
          ...(!isToday ? { date: selectedDate } : {}),
        }),
      });
      if (res.ok) {
        const result = await res.json();
        showToast("Food logged!", "success");
        setNutritionData(null);
        setSearchResults([]);
        setSavedSearchResults([]);
        setSearchQuery("");
        setShowManual(false);
        setFormResetKey((k) => k + 1);
        fetchFoods(selectedDate);
        if (result.milestone) {
          router.push(`/dashboard?milestone=${result.milestone}`);
        }
      }
    } catch {
      showToast("Failed to save. Please try again.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleManualSave = (data: { foodName: string; calories: number; protein: number; carbs: number; fat: number; fiber: number }) => {
    handleSaveFood({ ...data, isEstimate: false });
    setEntryMethod("manual");
  };

  const handleCopyFromDay = async (entries: any[], sourceDateLabel: string) => {
    setCopyingMeals(true);
    try {
      for (const entry of entries) {
        await fetch("/api/food", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mealType: entry.mealType || mealType,
            foodName: entry.foodName,
            calories: entry.calories,
            protein: entry.protein,
            carbs: entry.carbs,
            fat: entry.fat,
            fiber: entry.fiber,
            entryMethod: "copy",
            isEstimate: false,
            ...(!isToday ? { date: selectedDate } : {}),
          }),
        });
      }
      showToast(`Copied ${entries.length} items from ${sourceDateLabel}!`, "success");
      setShowCopyModal(false);
      fetchFoods(selectedDate);
    } catch {
      showToast("Failed to copy meals.", "error");
    } finally {
      setCopyingMeals(false);
    }
  };

  const handleCreateCustomFood = async (data: { foodName: string; servingSize: string; calories: number; protein: number; carbs: number; fat: number; fiber: number }) => {
    try {
      const res = await fetch("/api/custom-foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast("Custom food created!", "success");
        setShowCustomFood(false);
      } else {
        showToast("Failed to create custom food.", "error");
      }
    } catch {
      showToast("Failed to create custom food.", "error");
    }
  };

  const handleLogAgain = (entry: any) => {
    setNutritionData({
      foodName: entry.foodName,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      fiber: entry.fiber || 0,
      isEstimate: false,
    });
    setEntryMethod("search");
  };

  const handleEditFood = async (id: string, data: any) => {
    const res = await fetch(`/api/food/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast("Entry updated!", "success");
      fetchFoods(selectedDate);
    } else {
      showToast("Failed to update entry.", "error");
    }
  };

  const handleDeleteFood = async (id: string) => {
    const res = await fetch(`/api/food/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Entry deleted.", "success");
      fetchFoods(selectedDate);
    } else {
      showToast("Failed to delete entry.", "error");
    }
  };

  const handleEditExercise = async (id: string, data: any) => {
    const res = await fetch(`/api/exercise/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast("Exercise updated!", "success");
      fetchExercises(selectedDate);
    } else {
      showToast("Failed to update exercise.", "error");
    }
  };

  const handleDeleteExercise = async (id: string) => {
    const res = await fetch(`/api/exercise/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Exercise deleted.", "success");
      fetchExercises(selectedDate);
    } else {
      showToast("Failed to delete exercise.", "error");
    }
  };

  const handleEditWeight = async (id: string, data: any) => {
    const res = await fetch(`/api/weight/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast("Weight updated!", "success");
      fetchWeights(selectedDate);
    } else {
      showToast("Failed to update weight.", "error");
    }
  };

  const handleDeleteWeight = async (id: string) => {
    const res = await fetch(`/api/weight/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Weight deleted.", "success");
      fetchWeights(selectedDate);
    } else {
      showToast("Failed to delete weight.", "error");
    }
  };

  const handleExerciseSubmit = async (data: { activity: string; durationMinutes: number; estimatedCalories: number; isEstimate: boolean; notes: string }) => {
    setSaveLoading(true);
    try {
      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...(!isToday ? { date: selectedDate } : {}) }),
      });
      if (res.ok) {
        showToast("Exercise logged!", "success");
        setFormResetKey((k) => k + 1);
        fetchExercises(selectedDate);
      }
    } catch {
      showToast("Failed to save. Please try again.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleWeightSubmit = async (data: { weight: number; unit: string }) => {
    setSaveLoading(true);
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...(!isToday ? { date: selectedDate } : {}) }),
      });
      if (res.ok) {
        showToast("Weight logged!", "success");
        setFormResetKey((k) => k + 1);
        fetchWeights(selectedDate);
      }
    } catch {
      showToast("Failed to save. Please try again.", "error");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {showScanner && <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />}
      {showCopyModal && <CopyMealsModal onCopy={handleCopyFromDay} onClose={() => setShowCopyModal(false)} />}

      <div className="px-4 pt-6 space-y-4">
        {/* Date navigator */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate(-1)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Previous day"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex flex-col items-center">
            <button
              onClick={() => setShowDatePicker((p) => !p)}
              className="text-lg font-bold text-gray-900 hover:text-emerald-600 transition-colors"
            >
              {formatDateLabel(selectedDate)}
            </button>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                className="text-xs text-emerald-600 font-medium mt-0.5 hover:text-emerald-700"
              >
                Jump to today
              </button>
            )}
          </div>

          <button
            onClick={() => navigateDate(1)}
            disabled={isToday}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            aria-label="Next day"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {showDatePicker && (
          <div className="flex justify-center">
            <input
              type="date"
              value={selectedDate}
              max={todayStr}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setShowDatePicker(false);
              }}
              className="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        )}

        {!isToday && (
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Logging to {shortDateLabel(selectedDate)}
          </div>
        )}

        {/* Tab selector */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(["food", "exercise", "weight", "water"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "food" && (
          <div className="space-y-4">
            <MealTypeSelector value={mealType} onChange={setMealType} />

            {!nutritionData && !showManual && !showCustomFood && (
              <>
                <button
                  onClick={() => setShowCopyModal(true)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Copy meals from another day
                </button>

                <SmartInput
                  key={formResetKey}
                  onSubmit={handleSmartInput}
                  onScanBarcode={() => setShowScanner(true)}
                  loading={nlpLoading}
                />

                <SearchResults
                  results={searchResults}
                  onSelect={handleSearchSelect}
                  loading={searchLoading}
                  query={searchQuery}
                />

                {searchResults.length > 0 && searchResults[0].source !== "ai" && (
                  <button
                    onClick={handleTryAIEstimate}
                    disabled={nlpLoading}
                    className="w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {nlpLoading ? "Estimating..." : "Not finding what you need? Try AI estimate"}
                  </button>
                )}

                <button
                  onClick={() => setShowManual(true)}
                  className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Or enter nutrition manually
                </button>

                <button
                  onClick={() => setShowCustomFood(true)}
                  className="w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Create a custom food
                </button>

                <RecentEntries onLogAgain={handleLogAgain} />
              </>
            )}

            {nutritionData && (
              <NutritionConfirm
                data={nutritionData}
                onConfirm={handleSaveFood}
                onCancel={() => setNutritionData(null)}
                onBackToResults={savedSearchResults.length > 0 ? handleBackToResults : undefined}
                loading={saveLoading}
              />
            )}

            {showManual && (
              <ManualEntryForm
                onSubmit={handleManualSave}
                onCancel={() => setShowManual(false)}
                loading={saveLoading}
              />
            )}

            {showCustomFood && (
              <CustomFoodForm
                onSubmit={handleCreateCustomFood}
                onCancel={() => setShowCustomFood(false)}
              />
            )}

            {dateFoods.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{isToday ? "Today's" : `${shortDateLabel(selectedDate)}'s`} Entries</h2>
                <TodayLogSummary
                  foods={dateFoods}
                  exercises={[]}
                  onEditFood={handleEditFood}
                  onDeleteFood={handleDeleteFood}
                />
              </div>
            )}
          </div>
        )}

        {tab === "exercise" && (
          <div className="space-y-4">
            <ExerciseForm key={formResetKey} onSubmit={handleExerciseSubmit} loading={saveLoading} />

            {dateExercises.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{isToday ? "Today's" : `${shortDateLabel(selectedDate)}'s`} Exercises</h2>
                <TodayLogSummary
                  foods={[]}
                  exercises={dateExercises}
                  onEditExercise={handleEditExercise}
                  onDeleteExercise={handleDeleteExercise}
                />
              </div>
            )}
          </div>
        )}

        {tab === "weight" && (
          <div className="space-y-4">
            <WeightForm
              key={formResetKey}
              defaultUnit={user?.settings?.weightUnit || "lbs"}
              onSubmit={handleWeightSubmit}
              loading={saveLoading}
            />

            {dateWeights.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{isToday ? "Today's" : `${shortDateLabel(selectedDate)}'s`} Weigh-ins</h2>
                <TodayLogSummary
                  foods={[]}
                  exercises={[]}
                  weights={dateWeights}
                  onEditWeight={handleEditWeight}
                  onDeleteWeight={handleDeleteWeight}
                />
              </div>
            )}
          </div>
        )}

        {tab === "water" && <WaterTab key={selectedDate} date={selectedDate} />}
      </div>
      <BottomNav />
    </PageContainer>
  );
}

export default function LogPage() {
  return (
    <Suspense fallback={<PageContainer><div className="flex items-center justify-center pt-20 text-gray-400">Loading...</div></PageContainer>}>
      <LogContent />
    </Suspense>
  );
}
