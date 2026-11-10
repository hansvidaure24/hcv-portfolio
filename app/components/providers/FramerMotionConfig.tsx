"use client";
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { useMotionSettings } from "./MotionPreferenceProvider";

/**
 * Framer Motion follows the site's motion setting. Only the home page
 * animates with Framer (the parallax, the card reordering, the section
 * wipe), so only it wraps its content in this and loads the library.
 */
export default function FramerMotionConfig({ children }: { children: ReactNode }) {
  const { reduced } = useMotionSettings();
  return <MotionConfig reducedMotion={reduced ? "always" : "never"}>{children}</MotionConfig>;
}
