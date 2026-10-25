"use client";
import { useEffect, useSyncExternalStore } from "react";
import { getFirstGesturePromise, isSoundEnabled, setSoundEnabled, startBackgroundMusic, subscribeSound } from "./sound";

let resumedStoredSound = false;

/** Shared sound on/off state for every toggle on the page. */
export function useSoundSetting() {
  const enabled = useSyncExternalStore(subscribeSound, isSoundEnabled, () => false);

  // A returning visitor who left sound on gets music back after their first
  // gesture, since browsers block audio before one.
  useEffect(() => {
    if (resumedStoredSound || !isSoundEnabled()) return;
    resumedStoredSound = true;
    getFirstGesturePromise().then(() => {
      if (isSoundEnabled()) startBackgroundMusic();
    });
  }, []);

  return { enabled, toggle: () => setSoundEnabled(!isSoundEnabled()) };
}
