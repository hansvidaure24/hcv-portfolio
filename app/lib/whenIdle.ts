/**
 * Runs `task` once the browser has a quiet moment after the page loads, or
 * after two seconds where requestIdleCallback isn't supported (Safari).
 * Returns a function that cancels it.
 */
export function whenIdle(task: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(task, { timeout: 5000 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(task, 2000);
  return () => clearTimeout(id);
}
