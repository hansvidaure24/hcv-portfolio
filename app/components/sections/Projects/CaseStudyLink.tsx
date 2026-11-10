"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMotionSettings } from "../../providers/MotionPreferenceProvider";
import { useScene } from "../../scene/sceneContext";
import { morphTo } from "../../../lib/morphNavigation";
import { playSound } from "../../../lib/sound";

/**
 * Opens a case study with the card → page morph (View Transitions). Browsers
 * without it get the site's tile wipe before navigating; reduced motion and
 * modified clicks (new tab, etc.) are plain links.
 */
export default function CaseStudyLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const router = useRouter();
  const { reduced } = useMotionSettings();
  const scene = useScene();

  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        playSound("/sounds/press-start.mp3");
        if (reduced) return;
        e.preventDefault();
        if (morphTo(() => router.push(href))) return;
        if (scene) scene.cover().then(() => router.push(href));
        else router.push(href);
      }}
    >
      {children}
    </Link>
  );
}
