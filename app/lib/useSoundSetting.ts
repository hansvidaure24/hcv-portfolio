"use client";
import { useSyncExternalStore } from "react";
import { isSoundEnabled, setSoundEnabled, subscribeSound } from "./sound";

/** Shared sound on/off state for every toggle on the page. */
export function useSoundSetting() {
  const enabled = useSyncExternalStore(subscribeSound, isSoundEnabled, () => false);

  return { enabled, toggle: () => setSoundEnabled(!isSoundEnabled()) };
}
