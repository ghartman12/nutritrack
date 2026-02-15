"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import BottomNav from "@/components/layout/BottomNav";
import SettingsForm from "@/components/settings/SettingsForm";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, refetch } = useUser();
  const { toast, showToast, hideToast } = useToast();
  const [regenerating, setRegenerating] = useState(false);
  const [resettingOnboarding, setResettingOnboarding] = useState(false);

  const handleSave = async (data: any) => {
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      showToast("Settings saved!", "success");
      refetch();
    } else {
      showToast("Failed to save settings.", "error");
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calorieGoal: user?.settings?.calorieGoal || 2000,
          proteinTarget: user?.settings?.proteinTarget || 150,
          carbTarget: user?.settings?.carbTarget || 250,
          fatTarget: user?.settings?.fatTarget || 65,
          weightUnit: user?.settings?.weightUnit || "lbs",
          activityLevel: user?.settings?.activityLevel || "moderate",
        }),
      });
      if (res.ok) {
        showToast("Welcome message regenerated!", "success");
        refetch();
      }
    } catch {
      showToast("Failed to regenerate.", "error");
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Spinner />
      </PageContainer>
    );
  }

  const settings = user?.settings;
  if (!settings) return null;

  return (
    <PageContainer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <div className="px-4 pt-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

        <SettingsForm
          initialData={{
            calorieGoal: settings.calorieGoal,
            proteinTarget: settings.proteinTarget,
            carbTarget: settings.carbTarget,
            fatTarget: settings.fatTarget,
            weightUnit: settings.weightUnit,
            activityLevel: settings.activityLevel,
            llmProvider: settings.llmProvider,
            foodLoggingMode: settings.foodLoggingMode,
          }}
          onSave={handleSave}
        />

        <div className="border-t pt-4 space-y-3">
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            {regenerating ? "Regenerating..." : "Regenerate Welcome Message"}
          </button>
          <button
            onClick={async () => {
              setResettingOnboarding(true);
              try {
                const res = await fetch("/api/user", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ onboardingComplete: false }),
                });
                if (res.ok) {
                  router.push("/onboarding");
                } else {
                  showToast("Failed to reset onboarding.", "error");
                }
              } catch {
                showToast("Failed to reset onboarding.", "error");
              } finally {
                setResettingOnboarding(false);
              }
            }}
            disabled={resettingOnboarding}
            className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            {resettingOnboarding ? "Resetting..." : "Reset Onboarding"}
          </button>
          <Link
            href="/terms"
            className="block w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-sm text-center"
          >
            Terms of Service
          </Link>
        </div>
      </div>
      <BottomNav />
    </PageContainer>
  );
}
