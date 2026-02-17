"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";

interface UserContextType {
  userId: string | null;
  resetUser: () => void;
}

const UserContext = createContext<UserContextType>({
  userId: null,
  resetUser: () => {},
});

export function useUserId() {
  return useContext(UserContext);
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let id = localStorage.getItem("nutritrack_user_id");
    const isNew = !id;

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("nutritrack_user_id", id);
    }

    setUserId(id);

    // Ensure user exists in DB and check onboarding
    apiFetch("/api/user").then(async (res) => {
      if (res.ok) {
        const user = await res.json();
        if (
          !user.settings?.onboardingComplete &&
          pathname !== "/onboarding" &&
          pathname !== "/terms"
        ) {
          router.replace("/onboarding");
        }
      }

      // Show warning for first-time users
      if (isNew && !localStorage.getItem("nutritrack_warning_seen")) {
        setShowWarning(true);
      }

      setReady(true);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
    localStorage.setItem("nutritrack_warning_seen", "true");
  }, []);

  const resetUser = useCallback(() => {
    localStorage.removeItem("nutritrack_user_id");
    localStorage.removeItem("nutritrack_warning_seen");
    const newId = crypto.randomUUID();
    localStorage.setItem("nutritrack_user_id", newId);
    setUserId(newId);
    router.push("/onboarding");
  }, [router]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ userId, resetUser }}>
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="mx-auto max-w-[430px] flex items-start gap-3">
            <div className="flex-1 text-sm text-amber-800">
              Your data is tied to this browser. Clearing browser data or
              switching devices will reset your account.
            </div>
            <button
              onClick={dismissWarning}
              className="shrink-0 text-amber-600 font-medium text-sm hover:text-amber-800"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {children}
    </UserContext.Provider>
  );
}
