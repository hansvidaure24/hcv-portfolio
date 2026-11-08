const STORAGE_KEY = "sound-enabled";

function readStoredSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

// Keep the sound preference at module scope so all callers share it.
// Sound stays off until the visitor turns it on.
let soundEnabled = readStoredSoundEnabled();
const soundListeners = new Set<() => void>();

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  try {
    if (enabled) window.localStorage.setItem(STORAGE_KEY, "true");
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be unavailable in private browsing or after a quota error.
  }
  soundListeners.forEach((listener) => listener());
}

export function isSoundEnabled() {
  return soundEnabled;
}

/** For useSyncExternalStore: re-render toggles when the preference changes. */
export function subscribeSound(listener: () => void) {
  soundListeners.add(listener);
  return () => {
    soundListeners.delete(listener);
  };
}

export function playSound(src: string, volume = 1) {
  if (!soundEnabled) return;
  const audio = new Audio(src);
  audio.volume = volume;
  audio.play().catch(() => {});
}

// Attach one early listener so audio callers can wait for the first gesture.
let firstGesturePromise: Promise<void> | null = null;

export function getFirstGesturePromise(): Promise<void> {
  if (firstGesturePromise) return firstGesturePromise;

  firstGesturePromise = new Promise((resolve) => {
    if (typeof window === "undefined") return;
    function onGesture() {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      resolve();
    }
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
  });

  return firstGesturePromise;
}
