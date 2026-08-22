"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useScene } from "../scene/SceneProvider";
import { useMotionSettings } from "../providers/MotionPreferenceProvider";
import { playSound } from "../../lib/sound";
import styles from "./Navigation.module.scss";

type MenuItem = {
  label: string;
  /** Omit to make the row just close the menu instead of navigating. */
  id?: string;
};

const ITEMS: MenuItem[] = [
  { label: "WORK", id: "projects" },
  { label: "BIO", id: "about" },
  { label: "CONTACT", id: "contact" },
  { label: "QUIT", id: "hero" },
  { label: "→" },
];

// The "Reduce motion" row is appended after ITEMS in both the rendered list
// and the arrow-key cycle (index === ITEMS.length), rather than living inside
// ITEMS itself, since it toggles a preference instead of navigating/closing.
const TOTAL_ROWS = ITEMS.length + 1;

export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const scene = useScene();
  const motionSettings = useMotionSettings();

  const selectItem = useCallback((index: number) => {
    playSound("/sounds/button.mp3");
    const item = ITEMS[index];
    if (item?.id) scene?.goTo(item.id);
    setMenuOpen(false);
  }, [scene]);

  function toggleReducedMotion() {
    playSound("/sounds/button.mp3");
    motionSettings.toggleReduced();
  }

  function activateRow(index: number) {
    if (index === ITEMS.length) {
      toggleReducedMotion();
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
            initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 20, scale: 0.85 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.battleMenuInner}>
              <ul className={styles.menuList}>
                {ITEMS.map((item, i) => (
                  <li key={item.label} className={styles.menuRow}>
                    <motion.button
                      type="button"
                      role="menuitem"
                      className={styles.menuButton}
                      aria-label={item.id ? undefined : "Close menu"}
                      whileTap={reduceMotion ? undefined : { scale: 0.94 }}
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
                      {item.id ? item.label : <span className={styles.arrowLabel}>{item.label}</span>}
                    </motion.button>
                  </li>
                ))}
                <li className={styles.menuRow}>
                  <motion.button
                    type="button"
                    role="menuitemcheckbox"
                    aria-checked={motionSettings.reduced}
                    className={styles.menuButton}
                    whileTap={reduceMotion ? undefined : { scale: 0.94 }}
                    onMouseEnter={() => moveTo(ITEMS.length)}
                    onFocus={() => moveTo(ITEMS.length)}
                    onClick={toggleReducedMotion}
                  >
                    <span
                      className={`${styles.cursor}${activeIndex === ITEMS.length ? ' ' + styles.cursorActive : ''}`}
                      aria-hidden="true"
                    >
                      ▶
                    </span>
                    REDUCE MOTION: {motionSettings.reduced ? "ON" : "OFF"}
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
