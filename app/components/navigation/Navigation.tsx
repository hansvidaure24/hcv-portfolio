"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScene } from "../scene/SceneProvider";
import { useMotionSettings } from "../providers/MotionPreferenceProvider";
import { playSound } from "../../lib/sound";
import { DUR, steps } from "../../lib/motion";
import { useOptions } from "../providers/OptionsProvider";
import styles from "./Navigation.module.scss";

type MenuItem = {
  label: string;
  /** The section this row jumps to. */
  id: string;
};

const ITEMS: MenuItem[] = [
  { label: "WORK", id: "projects" },
  { label: "ABOUT", id: "about" },
  { label: "CONTACT", id: "contact" },
  { label: "TOP", id: "hero" },
];

// The OPTIONS row comes after the section rows in both the rendered list and
// the arrow-key cycle; it opens the shared Options screen instead of navigating.
const OPTIONS_ROW = ITEMS.length;
const TOTAL_ROWS = ITEMS.length + 1;

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const scene = useScene();
  const motionSettings = useMotionSettings();
  // The site's own setting (which can override the OS), not just prefers-reduced-motion.
  const reduceMotion = motionSettings.reduced;
  const { openOptions } = useOptions();

  const selectItem = useCallback((index: number) => {
    playSound("/sounds/button.mp3");
    const item = ITEMS[index];
    if (item?.id) scene?.goTo(item.id);
    setMenuOpen(false);
  }, [scene]);

  function showOptions() {
    playSound("/sounds/button.mp3");
    setMenuOpen(false);
    openOptions();
  }

  function activateRow(index: number) {
    if (index === OPTIONS_ROW) {
      showOptions();
      return;
    }
    selectItem(index);
  }

  function toggleMenu() {
    setMenuOpen((open) => {
      if (!open) setActiveIndex(0);
      return !open;
    });
  }

  // Only play a sound when the highlighted item changes.
  function moveTo(index: number) {
    setActiveIndex((prev) => {
      if (prev !== index) playSound("/sounds/menu-navigation.mp3", 0.5);
      return index;
    });
  }

  useEffect(() => {
    if (!menuOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        playSound("/sounds/menu-navigation.mp3", 0.5);
        setActiveIndex((i) => (i + 1) % TOTAL_ROWS);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        playSound("/sounds/menu-navigation.mp3", 0.5);
        setActiveIndex((i) => (i - 1 + TOTAL_ROWS) % TOTAL_ROWS);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateRow(activeIndex);
      }
    }

    function handleOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleOutside);
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuOpen, activeIndex, selectItem, motionSettings]);

  return (
    <nav ref={rootRef} className={styles.navRoot} aria-label="Site navigation">
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="battle-menu"
            role="menu"
            aria-label="Site menu"
            className={styles.battleMenu}
            style={{ transformOrigin: "bottom right" }}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            transition={{ duration: DUR.base, ease: steps(4) }}
          >
            <div className={styles.battleMenuInner}>
              <ul className={styles.menuList}>
                {ITEMS.map((item, i) => (
                  <li key={item.label} className={styles.menuRow}>
                    <motion.button
                      type="button"
                      role="menuitem"
                      className={styles.menuButton}
                      whileTap={reduceMotion ? undefined : { x: 2 }}
                      onMouseEnter={() => moveTo(i)}
                      onFocus={() => moveTo(i)}
                      onClick={() => selectItem(i)}
                    >
                      <span
                        className={`${styles.cursor}${i === activeIndex ? ' ' + styles.cursorActive : ''}`}
                        aria-hidden="true"
                      >
                        ▶
                      </span>
                      {item.label}
                    </motion.button>
                  </li>
                ))}
                <li className={styles.menuRow}>
                  <motion.button
                    type="button"
                    role="menuitem"
                    aria-haspopup="dialog"
                    className={styles.menuButton}
                    whileTap={reduceMotion ? undefined : { x: 2 }}
                    onMouseEnter={() => moveTo(OPTIONS_ROW)}
                    onFocus={() => moveTo(OPTIONS_ROW)}
                    onClick={showOptions}
                  >
                    <span
                      className={`${styles.cursor}${activeIndex === OPTIONS_ROW ? ' ' + styles.cursorActive : ''}`}
                      aria-hidden="true"
                    >
                      ▶
                    </span>
                    OPTIONS
                  </motion.button>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        className={styles.menuToggle}
        onClick={() => {
          playSound("/sounds/button.mp3");
          toggleMenu();
        }}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="battle-menu"
        style={{
          opacity: menuOpen ? 0 : 1,
          pointerEvents: menuOpen ? "none" : undefined,
        }}
      >
        <img
          src="/icons/icon-pokeball.svg"
          alt=""
          className={styles.menuToggleSvg}
          aria-hidden="true"
        />
      </button>
    </nav>
  );
}
