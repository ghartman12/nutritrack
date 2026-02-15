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
  const [tab, setTab] = useState<"food" | "exercise" | "weight">(initialTab as any);
  const [mealType, setMealType] = useState<MealType>(suggestMealType());
  const [showScanner, setShowScanner] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [nlpLoading, setNlpLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionEstimate | null>(null);
  const [searchResults, setSearchResults] = useState<FoodSearchResult[]>([]);
  const [savedSearchResults, setSavedSearchResults] = useState<FoodSearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [entryMethod, setEntryMethod] = useState<string>("nlp");
  const [todayFoods, setTodayFoods] = useState<any[]>([]);
  const [todayExercises, setTodayExercises] = useState<any[]>([]);
  const [todayWeights, setTodayWeights] = useState<any[]>([]);

  const todayDate = new Date().toISOString().split("T")[0];

  const fetchTodayFoods = async () => {
    try {
      const res = await fetch(`/api/food?date=${todayDate}`);
      if (res.ok) setTodayFoods(await res.json());
    } catch { /* non-critical */ }
  };

  const fetchTodayExercises = async () => {
    try {
      const res = await fetch(`/api/exercise?date=${todayDate}`);
      if (res.ok) setTodayExercises(await res.json());
    } catch { /* non-critical */ }
  };

  const fetchTodayWeights = async () => {
    try {
      const res = await fetch(`/api/weight?date=${todayDate}`);
      if (res.ok) setTodayWeights(await res.json());
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    fetchTodayFoods();
    fetchTodayExercises();
    fetchTodayWeights();
  }, []);

  const foodLoggingMode = user?.settings?.foodLoggingMode || "fast";

  const handleSmartInput = async (query: string) => {
    setSearchResults([]);
    setNutritionData(null);

    if (foodLoggingMode === "accurate") {
      // Accurate mode: USDA search first, fall back to NLP
      setSearchLoading(true);
      setSearchQuery(query);
      setEntryMethod("search");

      try {
        const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setSearchResults(data);
            setSearchLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to NLP
      }

      // Fallback to NLP estimate
      setSearchLoading(false);
      setNlpLoading(true);
      setEntryMethod("nlp");
      try {
        const res = await fetch("/api/food/nlp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        if (res.ok) {
          const data = await res.json();
          setNutritionData(data);
        } else {
          showToast("Could not estimate nutrition. Try manual entry.", "error");
        }
      } catch {
        showToast("Estimation failed. Try manual entry.", "error");
      } finally {
        setNlpLoading(false);
      }
    } else {
      // Fast mode (default): NLP variations first, fall back to USDA search
      setNlpLoading(true);
      setEntryMethod("nlp");
      setSearchQuery(query);

      try {
        const res = await fetch("/api/food/nlp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variations: true }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSearchResults(data);
            setEntryMethod("search");
            setNlpLoading(false);
            return;
          }
        }
      } catch {
        // Fall through to USDA search
      }

      // Fallback to USDA search
      setNlpLoading(false);
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/food/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setEntryMethod("search");
        }
      } catch {
        showToast("Search failed. Try manual entry.", "error");
      } finally {
        setSearchLoading(false);
      }
    }
  };

  const handleSearchUSDA = async () => {
    if (!searchQuery) return;
    setSearchResults([]);
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/food/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setEntryMethod("search");
      }
    } catch {
      showToast("Search failed. Try manual entry.", "error");
    } finally {
      setSearchLoading(false);
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
        }),
      });
      if (res.ok) {
        const result = await res.json();
        showToast("Food logged!", "success");
        setNutritionData(null);
        setSearchResults([]);
        setShowManual(false);
        fetchTodayFoods();
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
      fetchTodayFoods();
    } else {
      showToast("Failed to update entry.", "error");
    }
  };

  const handleDeleteFood = async (id: string) => {
    const res = await fetch(`/api/food/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Entry deleted.", "success");
      fetchTodayFoods();
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
      fetchTodayExercises();
    } else {
      showToast("Failed to update exercise.", "error");
    }
  };

  const handleDeleteExercise = async (id: string) => {
    const res = await fetch(`/api/exercise/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Exercise deleted.", "success");
      fetchTodayExercises();
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
      fetchTodayWeights();
    } else {
      showToast("Failed to update weight.", "error");
    }
  };

  const handleDeleteWeight = async (id: string) => {
    const res = await fetch(`/api/weight/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Weight deleted.", "success");
      fetchTodayWeights();
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
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast("Exercise logged!", "success");
        fetchTodayExercises();
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
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast("Weight logged!", "success");
        fetchTodayWeights();
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

      <div className="px-4 pt-6 space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Log</h1>

        {/* Tab selector */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(["food", "exercise", "weight"] as const).map((t) => (
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

            {!nutritionData && !showManual && (
              <>
                <SmartInput
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

                {searchResults.length > 0 && searchResults[0].source === "ai" && (
                  <button
                    onClick={handleSearchUSDA}
                    className="w-full py-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Not what you&apos;re looking for? Search USDA database
                  </button>
                )}

                <button
                  onClick={() => setShowManual(true)}
                  className="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Or enter nutrition manually
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

            {todayFoods.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Today&apos;s Entries</h2>
                <TodayLogSummary
                  foods={todayFoods}
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
            <ExerciseForm onSubmit={handleExerciseSubmit} loading={saveLoading} />

            {todayExercises.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Today&apos;s Exercises</h2>
                <TodayLogSummary
                  foods={[]}
                  exercises={todayExercises}
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
              defaultUnit={user?.settings?.weightUnit || "lbs"}
              onSubmit={handleWeightSubmit}
              loading={saveLoading}
            />

            {todayWeights.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Today&apos;s Weigh-ins</h2>
                <TodayLogSummary
                  foods={[]}
                  exercises={[]}
                  weights={todayWeights}
                  onEditWeight={handleEditWeight}
                  onDeleteWeight={handleDeleteWeight}
                />
              </div>
            )}
          </div>
        )}
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
