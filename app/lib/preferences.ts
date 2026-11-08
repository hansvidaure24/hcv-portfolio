"use client";
import { useSyncExternalStore } from "react";
import { TIMES_OF_DAY, timeOfDayForHour, type TimeOfDay } from "./timeOfDay";
import { TEXT_FAST_HTML_CLASS, TEXT_SPEED_KEY, TIME_KEY } from "./preferenceKeys";

// Text speed and time of day: the two Options settings that aren't sound or
// motion. Each is remembered in localStorage and mirrored onto <html> (a
// class and a data attribute) so CSS can react before React hydrates; the
// pre-paint boot scripts in layout.tsx apply the stored values on load.

export type TextSpeed = "normal" | "fast";
export type TimePreference = "auto" | TimeOfDay;


const listeners = new Set<() => void>();
function notify() {
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private browsing, quota); the setting still applies for this visit.
  }
}

/* --- Text speed --- */

export function getTextSpeed(): TextSpeed {
  if (typeof document === "undefined") return "normal";
  return document.documentElement.classList.contains(TEXT_FAST_HTML_CLASS) ? "fast" : "normal";
}

export function setTextSpeed(speed: TextSpeed) {
  write(TEXT_SPEED_KEY, speed === "fast" ? "fast" : null);
  document.documentElement.classList.toggle(TEXT_FAST_HTML_CLASS, speed === "fast");
  notify();
}

export function useTextSpeed(): TextSpeed {
  return useSyncExternalStore(subscribe, getTextSpeed, () => "normal");
}

/* --- Time of day --- */

function isTime(value: string | null): value is TimeOfDay {
  return (TIMES_OF_DAY as string[]).includes(value ?? "");
}

export function getTimePreference(): TimePreference {
  if (typeof window === "undefined") return "auto";
  const stored = read(TIME_KEY);
  return isTime(stored) ? stored : "auto";
}

export function setTimePreference(pref: TimePreference) {
  write(TIME_KEY, pref === "auto" ? null : pref);
  const time = pref === "auto" ? timeOfDayForHour(new Date().getHours()) : pref;
  document.documentElement.setAttribute("data-time", time);
  notify();
}

export function useTimePreference(): TimePreference {
  return useSyncExternalStore(subscribe, getTimePreference, () => "auto");
}

