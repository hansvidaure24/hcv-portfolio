"use client";
import { useAnimate } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";
import { SceneContext } from "./sceneContext";
import { useMotionSettings } from "../providers/MotionPreferenceProvider";
import { DUR, steps } from "../../lib/motion";
import styles from "./SceneTransition.module.scss";

// The same tile grid as the hero's intro wipe, so the site has one transition.
export const TILE_COLS = 10;
export const TILE_ROWS = 6;
const TILES = Array.from({ length: TILE_COLS * TILE_ROWS }, (_, i) => i);

// Tiles flip in a diagonal sweep from the top-left, each in three steps.
const TILE_STEP = 0.018;
const diagonalDelay = (i: number) => ((i % TILE_COLS) + Math.floor(i / TILE_COLS)) * TILE_STEP;
const TILE_TRANSITION = { duration: DUR.fast, ease: steps(3), delay: diagonalDelay };

export default function SceneProvider({ sectionIds, children }: { sectionIds: string[]; children: ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { reduced: reduceMotion } = useMotionSettings();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const lockedRef = useRef(false);
  const jumpTargetRef = useRef<string | null>(null);

  // The page scrolls normally, so the active section is whichever one
  // crosses the middle of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = sectionIds.indexOf(entry.target.id);
          if (index !== -1) setActiveIndex(index);
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sectionIds]);

  // Keep the URL in sync with the active section without duplicate history entries.
  function syncHash(id: string) {
    // Keep the default hero section at the root URL instead of using #hero.
    const isHome = id === sectionIds[0];
    const targetHash = isHome ? "" : `#${id}`;
    if (window.location.hash === targetHash) return;
    const url = isHome ? window.location.pathname + window.location.search : targetHash;
    window.history.pushState(null, "", url);
  }

  async function goTo(id: string, onStart?: () => void): Promise<boolean> {
    const nextIndex = sectionIds.indexOf(id);
    const target = document.getElementById(id);
    if (nextIndex === -1 || !target || lockedRef.current) return false;

    onStart?.();

    // Reduced motion: jump straight there.
    if (reduceMotion || !scope.current) {
      jumpTargetRef.current = id;
      target.scrollIntoView({ behavior: "instant", block: "start" });
      setActiveIndex(nextIndex);
      syncHash(id);
      window.setTimeout(() => {
        jumpTargetRef.current = null;
      }, 200);
      return true;
    }

    lockedRef.current = true;
    // Always release the navigation lock, including when animation fails.
    try {
      await animate("span", { scale: 1 }, TILE_TRANSITION);
      // The landing section shows up already in place: the wipe is the transition.
      jumpTargetRef.current = id;
      target.scrollIntoView({ behavior: "instant", block: "start" });
      setActiveIndex(nextIndex);
      syncHash(id);
      await animate("span", { scale: 0 }, TILE_TRANSITION);
      return true;
    } finally {
      jumpTargetRef.current = null;
      lockedRef.current = false;
    }
  }

  async function cover() {
    if (reduceMotion || !scope.current) return;
    await animate("span", { scale: 1 }, TILE_TRANSITION);
  }

  // Handle browser back and forward.
  useEffect(() => {
    function handlePopState() {
      const id = window.location.hash.slice(1) || sectionIds[0];
      if (!id || !sectionIds.includes(id)) return;
      goTo(id);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIds, reduceMotion]);

  return (
    <SceneContext.Provider
      value={{ activeIndex, activeId: sectionIds[activeIndex] ?? "", sectionIds, goTo, jumpTargetRef, cover }}
    >
      {children}
      <div ref={scope} className={styles.tiles} aria-hidden="true">
        {TILES.map((i) => (
          <span key={i} className={styles.tile} />
        ))}
      </div>
    </SceneContext.Provider>
  );
}
