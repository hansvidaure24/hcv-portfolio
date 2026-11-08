declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsParams = Record<string, string | number>;

/** Records an event, when analytics is loaded. Never pass anything a visitor typed. */
export function track(event: string, params?: AnalyticsParams) {
  window.gtag?.("event", event, params);
}
