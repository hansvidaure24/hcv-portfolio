// Shared by the boot script, provider, and imperative animation code.

export type MotionPreference = "system" | "reduce" | "full";

const STORAGE_KEY = "motion-preference";
export const REDUCE_MOTION_HTML_CLASS = "reduce-motion";

export function getStoredMotionPreference(): MotionPreference {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "reduce" || stored === "full" ? stored : "system";
  } catch {
    return "system";
  }
}

export function setStoredMotionPreference(pref: MotionPreference) {
  if (typeof window === "undefined") return;
  try {
    if (pref === "system") window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, pref);
  } catch {
    // Storage may be unavailable in private browsing or after a quota error.
  }
}

export function systemPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function resolveEffectiveReducedMotion(pref: MotionPreference): boolean {
  if (pref === "reduce") return true;
  if (pref === "full") return false;
  return systemPrefersReducedMotion();
}

/** One-shot check for code that just needs to know "reduce motion right
 * now or not" without subscribing to future changes. */
export function getEffectiveReducedMotion(): boolean {
  return resolveEffectiveReducedMotion(getStoredMotionPreference());
}

export function applyMotionClass(effectiveReduced: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle(REDUCE_MOTION_HTML_CLASS, effectiveReduced);
}

// Run this before first paint so reduced-motion styles apply immediately.
export const MOTION_BOOT_SCRIPT = `(function(){try{var KEY="${STORAGE_KEY}";var stored=window.localStorage.getItem(KEY);var reduce=stored==="reduce"?true:stored==="full"?false:window.matchMedia("(prefers-reduced-motion: reduce)").matches;if(reduce)document.documentElement.classList.add("${REDUCE_MOTION_HTML_CLASS}");}catch(e){}})();`;
