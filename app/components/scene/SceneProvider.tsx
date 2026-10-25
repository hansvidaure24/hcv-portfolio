"use client";
import { useAnimate, motion } from "framer-motion";
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
import { useMotionSettings } from "../providers/MotionPreferenceProvider";
import styles from "./SceneTransition.module.scss";

type SceneContextValue = {
  activeIndex: number;
  activeId: string;
  isDesktop: boolean;
  sectionIds: string[];
  /** Calls onStart when navigation begins and resolves with whether it ran. */
  goTo: (id: string, onStart?: () => void) => Promise<boolean>;
};

const SceneContext = createContext<SceneContextValue | null>(null);

export function useScene() {
  return useContext(SceneContext);
}

const EASE = [0.65, 0, 0.35, 1] as const;

export default function SceneProvider({ sectionIds, children }: { sectionIds: string[]; children: ReactNode }) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { reduced: reduceMotion } = useMotionSettings();
  const [scope, animate] = useAnimate();
  const lockedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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

    // Mobile and reduced motion just scroll; desktop hides the jump behind the band wipe.
    if (!isDesktop || reduceMotion || !scope.current) {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      setActiveIndex(nextIndex);
      syncHash(id);
      return true;
    }

    lockedRef.current = true;
    // Always release the navigation lock, including when animation fails.
    try {
      await animate(scope.current, { x: "0vw", skewX: -12 }, { duration: 0.35, ease: EASE });
      target.scrollIntoView({ behavior: "instant", block: "start" });
      setActiveIndex(nextIndex);
      syncHash(id);
      await animate(scope.current, { x: "200vw", skewX: -12 }, { duration: 0.35, ease: EASE });
      animate(scope.current, { x: "-200vw", skewX: -12 }, { duration: 0 });
      return true;
    } finally {
      lockedRef.current = false;
    }
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
  }, [sectionIds, isDesktop, reduceMotion]);

  return (
    <SceneContext.Provider
      value={{ activeIndex, activeId: sectionIds[activeIndex] ?? "", isDesktop, sectionIds, goTo }}
    >
      {children}
      {isDesktop && (
        <motion.div
          ref={scope}
          className={styles.band}
          style={{ x: "-200vw", skewX: -12 }}
          aria-hidden="true"
        />
      )}
    </SceneContext.Provider>
  );
}
