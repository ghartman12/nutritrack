"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import AboutYouStep from "@/components/onboarding/AboutYouStep";
import BodyStatsStep from "@/components/onboarding/BodyStatsStep";
import GoalsStep from "@/components/onboarding/GoalsStep";
import DisclaimerStep from "@/components/onboarding/DisclaimerStep";
import ReadyStep from "@/components/onboarding/ReadyStep";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [goalsMode, setGoalsMode] = useState<"calculate" | "manual">("calculate");
  const [loading, setLoading] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [data, setData] = useState({
    calorieGoal: 2000,
    proteinTarget: 150,
    carbTarget: 250,
    fatTarget: 65,
    weightUnit: "lbs",
    weight: 0,
    activityLevel: "moderate",
    age: 0,
    sex: "other",
    heightFeet: 5,
    heightInches: 10,
    heightCm: 178,
    goal: "maintain",
    weeklyRate: 1,
  });

  const updateField = (field: string, value: string | number) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const result = await res.json();
        setWelcomeMessage(result.welcomeMessage);
      }
    } catch (error) {
      console.error("Onboarding error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  // When moving to step 5 (ReadyStep), trigger the API call
  const goToReady = () => {
    setStep(5);
    handleSubmit();
  };

  return (
    <PageContainer>
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 mb-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === step ? "w-8 bg-emerald-600" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>

      {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
      {step === 1 && (
        <AboutYouStep
          data={data}
          onChange={updateField}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <BodyStatsStep
          data={data}
          onChange={updateField}
          onNext={() => { setGoalsMode("calculate"); setStep(3); }}
          onBack={() => setStep(1)}
          onSkip={() => { setGoalsMode("manual"); setStep(3); }}
        />
      )}
      {step === 3 && (
        <GoalsStep
          data={data}
          bodyStats={data}
          onChange={updateField}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
          initialMode={goalsMode}
        />
      )}
      {step === 4 && (
        <DisclaimerStep
          onNext={goToReady}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && (
        <ReadyStep
          welcomeMessage={welcomeMessage}
          loading={loading}
          onFinish={handleFinish}
          onBack={() => setStep(4)}
        />
      )}
    </PageContainer>
  );
}
