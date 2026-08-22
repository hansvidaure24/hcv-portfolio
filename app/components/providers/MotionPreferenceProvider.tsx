"use client";

import { MotionConfig } from "framer-motion";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  applyMotionClass,
  getStoredMotionPreference,
  resolveEffectiveReducedMotion,
  setStoredMotionPreference,
  systemPrefersReducedMotion,
  type MotionPreference,
} from "../../lib/motionPreference";

type MotionSettings = {
  preference: MotionPreference;
  reduced: boolean;
  setPreference: (pref: MotionPreference) => void;
  /** Toggle the manual motion preference. */
  toggleReduced: () => void;
};

const MotionSettingsContext = createContext<MotionSettings | null>(null);

export function useMotionSettings() {
  const ctx = useContext(MotionSettingsContext);
  if (!ctx) throw new Error("useMotionSettings must be used within MotionPreferenceProvider");
  return ctx;
}

export default function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<MotionPreference>("system");
  const [reduced, setReduced] = useState(false);

  // Match the pre-paint boot script and keep listening for system changes until
  // the user picks a manual preference.
  useEffect(() => {
    const stored = getStoredMotionPreference();
    setPreferenceState(stored);
    setReduced(resolveEffectiveReducedMotion(stored));

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    function handleSystemChange() {
      setPreferenceState((current) => {
        if (current === "system") setReduced(systemPrefersReducedMotion());
        return current;
      });
    }
    mq.addEventListener("change", handleSystemChange);
    return () => mq.removeEventListener("change", handleSystemChange);
  }, []);

  useEffect(() => {
    applyMotionClass(reduced);
  }, [reduced]);

  function setPreference(pref: MotionPreference) {
    setStoredMotionPreference(pref);
    setPreferenceState(pref);
    setReduced(resolveEffectiveReducedMotion(pref));
  }

  function toggleReduced() {
    setPreference(reduced ? "full" : "reduce");
  }

  return (
    <MotionSettingsContext.Provider value={{ preference, reduced, setPreference, toggleReduced }}>
      <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>
    </MotionSettingsContext.Provider>
  );
}
