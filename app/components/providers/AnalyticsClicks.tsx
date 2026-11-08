"use client";
import { useEffect } from "react";
import { track, type AnalyticsParams } from "../../lib/analytics";
import { RESUME_URL } from "../../lib/site";

/** The event a click stands for, if it's one worth counting. */
function eventFor(element: Element): [string, AnalyticsParams?] | null {
  const named = element.getAttribute("data-track");
  if (named === "email_copy") return ["email_click", { method: "copy" }];
  if (named) return [named];
  const href = element.getAttribute("href");
  if (!href) return null;
  if (href.startsWith("mailto:")) return ["email_click", { method: "mailto" }];
  if (href === RESUME_URL) return ["resume_click", { target: "pdf" }];
  if (href === "/resume") return ["resume_click", { target: "page" }];
  return null;
}

/**
 * Counts the clicks that mean someone wants to get in touch: resume, email and
 * the message form, with the part of the page they came from. One listener
 * covers every link on every page, including those in server components.
 */
export default function AnalyticsClicks() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const element = (e.target as Element | null)?.closest?.("a[href], [data-track]");
      if (!element) return;
      const found = eventFor(element);
      if (!found) return;
      const [event, params] = found;
      const from = element.closest("header") ? "header" : element.closest("section[id]")?.id ?? "page";
      track(event, { ...params, from });
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
