"use client";

import { useState, useEffect } from "react";

interface UserSettings {
  calorieGoal: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  macroUnit: string;
  weightUnit: string;
  activityLevel: string;
  llmProvider: string;
  foodLoggingMode: string;
  onboardingComplete: boolean;
  welcomeMessage: string | null;
  emptyStateMessage: string | null;
}

interface User {
  id: string;
  settings: UserSettings | null;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, refetch: fetchUser };
}
