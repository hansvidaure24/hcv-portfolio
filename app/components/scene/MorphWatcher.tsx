"use client";
import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { resolvePendingMorph } from "../../lib/morphNavigation";

/** Finishes a pending card → case-study morph once the new route is on screen. */
export default function MorphWatcher() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    // A timer, not requestAnimationFrame: while a view transition waits for
    // its update, the browser suppresses rendering, so rAF callbacks never
    // run. The zero-delay timer still lets Next reset the scroll position first.
    const timer = window.setTimeout(() => resolvePendingMorph(), 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return null;
}
