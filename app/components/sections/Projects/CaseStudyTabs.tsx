"use client";
import { useRef, useState, type ReactNode } from "react";
import { playSound } from "../../../lib/sound";
import styles from "./CaseStudyTabs.module.scss";

export type CaseStudyTab = { id: string; label: string; content: ReactNode };

/**
 * Overview / Decisions / Results, like a summary screen's pages. Click a tab
 * or use ← → (Home / End) on the tab row. Every panel stays in the page for
 * search engines; only the active one is shown.
 */
export default function CaseStudyTabs({ tabs }: { tabs: CaseStudyTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (tabs.length === 1) return <>{tabs[0]!.content}</>;

  function select(index: number, focus = false) {
    const tab = tabs[index];
    if (!tab) return;
    if (tab.id !== active) playSound("/sounds/menu-navigation.mp3", 0.5);
    setActive(tab.id);
    if (focus) tabRefs.current[index]?.focus();
  }

  function onKey(e: React.KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight" ? (index + 1) % tabs.length
      : e.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    select(next, true);
  }

  return (
    <div className={styles.tabs}>
      <div role="tablist" aria-label="Case study sections" className={styles.tabList}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active === tab.id ? 0 : -1}
            className={styles.tab}
            onClick={() => select(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
          tabIndex={0}
          className={styles.panel}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
