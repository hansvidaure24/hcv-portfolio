"use client";
import { useAnimate, useReducedMotion, motion } from "framer-motion";
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";
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
  const reduceMotion = useReducedMotion();
  const [scope, animate] = useAnimate();
  const lockedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

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
    // Wait for the hero reveal before allowing navigation.
    if (!document.documentElement.classList.contains("hero-revealed")) return false;

    const nextIndex = sectionIds.indexOf(id);
    if (nextIndex === -1) return false;

    if (!isDesktop) {
      onStart?.();
      // Track the active section on mobile too, even though sections scroll normally.
      setActiveIndex(nextIndex);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      syncHash(id);
      return true;
    }

    if (lockedRef.current || nextIndex === activeIndex) return false;
    lockedRef.current = true;
    onStart?.();

    // Always release the navigation lock, including when animation fails.
    try {
      if (reduceMotion) {
        setActiveIndex(nextIndex);
        syncHash(id);
        return true;
      }

      if (!scope.current) {
        setActiveIndex(nextIndex);
        syncHash(id);
        return true;
      }

      await animate(scope.current, { x: "0vw", skewX: -12 }, { duration: 0.35, ease: EASE });
      setActiveIndex(nextIndex);
      syncHash(id);
      await animate(scope.current, { x: "200vw", skewX: -12 }, { duration: 0.35, ease: EASE });
      animate(scope.current, { x: "-200vw", skewX: -12 }, { duration: 0 });
      return true;
    } finally {
      lockedRef.current = false;
    }
  }

  // Effects with stable dependencies use the latest navigation function.
  const goToRef = useRef(goTo);
  useEffect(() => {
    goToRef.current = goTo;
  });

  // Restore a valid deep link after the hero reveal completes.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const requestedId = window.location.hash.slice(1);
    if (!requestedId || !sectionIds.includes(requestedId) || requestedId === sectionIds[0]) return;

    let cancelled = false;
    function restore() {
      if (cancelled) return;
      goToRef.current(requestedId);
    }

    if (document.documentElement.classList.contains("hero-revealed")) {
      restore();
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains("hero-revealed")) {
        observer.disconnect();
        restore();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      cancelled = true;
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    function handleWheel(e: WheelEvent) {
      if (document.getElementById("battle-menu")) return;
      if (!document.documentElement.classList.contains("hero-revealed")) return;
      if (lockedRef.current) {
        e.preventDefault();
        return;
      }
      if (Math.abs(e.deltaY) < 4) return;

      const goingDown = e.deltaY > 0;
      const activeId = sectionIds[activeIndex];
      const activeEl = document.querySelector<HTMLElement>(`[data-slide="${activeId}"]`);

      if (activeEl) {
        const { scrollTop, scrollHeight, clientHeight } = activeEl;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
        const atTop = scrollTop <= 2;
        if (goingDown && !atBottom) return;
        if (!goingDown && !atTop) return;
      }

      const nextIndex = activeIndex + (goingDown ? 1 : -1);
      if (nextIndex < 0 || nextIndex >= sectionIds.length) return;

      e.preventDefault();
      const nextSectionId = sectionIds[nextIndex];
      if (nextSectionId) goTo(nextSectionId);
    }

    function handleKey(e: KeyboardEvent) {
      if (document.getElementById("battle-menu")) return;
      if (!document.documentElement.classList.contains("hero-revealed")) return;
      if (lockedRef.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        if (activeIndex < sectionIds.length - 1) {
          e.preventDefault();
          const nextSectionId = sectionIds[activeIndex + 1];
          if (nextSectionId) goTo(nextSectionId);
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (activeIndex > 0) {
          e.preventDefault();
          const previousSectionId = sectionIds[activeIndex - 1];
          if (previousSectionId) goTo(previousSectionId);
        }
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop, activeIndex, sectionIds, reduceMotion]);

  // Handle browser back and forward on both desktop and mobile.
  useEffect(() => {
    function handlePopState() {
      const id = window.location.hash.slice(1) || sectionIds[0];
      if (!id || !sectionIds.includes(id)) return;
      if (id === sectionIds[activeIndex]) return;
      goTo(id);
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, sectionIds]);

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
