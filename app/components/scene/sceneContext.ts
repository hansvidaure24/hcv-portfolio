"use client";
import { RefObject, createContext, useContext } from "react";

// The scene's context on its own, without SceneProvider's animation code:
// the top bar, the menu and case-study links read it on every page, and only
// the home page (where SceneProvider runs) needs the animation library.

export type SceneContextValue = {
  activeIndex: number;
  activeId: string;
  sectionIds: string[];
  /** Calls onStart when navigation begins and resolves with whether it ran. */
  goTo: (id: string, onStart?: () => void) => Promise<boolean>;
  /** The section a jump is landing on, so it can skip its own fade-in. */
  jumpTargetRef: RefObject<string | null>;
  /** Flips the tiles in to cover the screen, e.g. before leaving for a case study. */
  cover: () => Promise<void>;
};

export const SceneContext = createContext<SceneContextValue | null>(null);

/** The home page's scene, or null on other pages. */
export function useScene() {
  return useContext(SceneContext);
}
