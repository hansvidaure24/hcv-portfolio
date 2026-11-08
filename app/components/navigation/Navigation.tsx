"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useScene } from "../scene/SceneProvider";
import { useMotionSettings } from "../providers/MotionPreferenceProvider";
import { playSound } from "../../lib/sound";
import { DUR, steps } from "../../lib/motion";
import { useOptions } from "../providers/OptionsProvider";
import styles from "./Navigation.module.scss";

type MenuItem = {
  label: string;
  /** The section this row jumps to. */
  id?: string;
  /** Or a page this row opens. */
  href?: string;
};

const ITEMS: MenuItem[] = [
  { label: "EXPERIENCE", id: "experience" },
  { label: "WORK", id: "projects" },
  { label: "ABOUT", id: "about" },
  { label: "CONTACT", id: "contact" },
  { label: "NOTES", href: "/notes" },
  { label: "RESUME", href: "/resume" },
  { label: "TOP", id: "hero" },
];

// The OPTIONS row comes after the other rows; it opens the shared Options
// screen instead of navigating.
const OPTIONS_ROW = ITEMS.length;
const TOTAL_ROWS = ITEMS.length + 1;

/**
 * The phone menu, styled like the battle menu. It's a disclosure: a button
 * that shows and hides a list of links (not an ARIA `menu`, which is for
 * application menus). Opening it moves focus to the first row; ↑ ↓ Home End
 * move between rows, Escape closes it and puts focus back on the button, and
 * tabbing out of it closes it too. TopBar renders it, on every page.
 */
export default function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);
  // Set when closing should hand focus back to the button (Escape).
  const returnFocusRef = useRef(false);
  const scene = useScene();
  // The site's own setting (which can override the OS), not just prefers-reduced-motion.
  const { reduced: reduceMotion } = useMotionSettings();
  const { openOptions } = useOptions();

  function close(returnFocus = false) {
    returnFocusRef.current = returnFocus;
    setMenuOpen(false);
  }

  function open() {
    setActiveIndex(0);
    setMenuOpen(true);
  }

  // Focus follows the menu: into the first row on open, back to the button
  // when Escape closed it.
  useEffect(() => {
    if (menuOpen) {
      rowRefs.current[0]?.focus();
    } else if (returnFocusRef.current) {
      returnFocusRef.current = false;
      toggleRef.current?.focus();
    }
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      returnFocusRef.current = true;
      setMenuOpen(false);
    }
    function handleOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    window.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleOutside);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleOutside);
    };
  }, [menuOpen]);

  // Only play a sound when the highlighted row changes.
  function moveTo(index: number) {
    setActiveIndex((prev) => {
      if (prev !== index) playSound("/sounds/menu-navigation.mp3", 0.5);
      return index;
    });
  }

  function focusRow(index: number) {
    const next = (index + TOTAL_ROWS) % TOTAL_ROWS;
    rowRefs.current[next]?.focus();
  }

  function onListKey(e: React.KeyboardEvent) {
    const current = rowRefs.current.findIndex((row) => row === document.activeElement);
    const target =
      e.key === "ArrowDown" ? current + 1
      : e.key === "ArrowUp" ? current - 1
      : e.key === "Home" ? 0
      : e.key === "End" ? TOTAL_ROWS - 1
      : null;
    if (target === null) return;
    e.preventDefault();
    focusRow(target);
  }

  // Tabbing to something outside the menu closes it. A click on a gap inside
  // the menu has no relatedTarget, so it's left to the outside-click handler.
  function onBlur(e: React.FocusEvent) {
    const next = e.relatedTarget as Node | null;
    if (menuOpen && next && !rootRef.current?.contains(next)) close();
  }

  function jumpTo(e: React.MouseEvent, id: string) {
    if (!scene) return;
    e.preventDefault();
    playSound("/sounds/button.mp3");
    close();
    scene.goTo(id);
  }

  function showOptions() {
    playSound("/sounds/button.mp3");
    close();
    openOptions();
  }

  const rowProps = (i: number) => ({
    ref: (el: HTMLElement | null) => {
      rowRefs.current[i] = el;
    },
    className: styles.menuButton,
    onMouseEnter: () => moveTo(i),
    onFocus: () => moveTo(i),
  });

  const cursor = (i: number) => (
    <span className={`${styles.cursor}${i === activeIndex ? " " + styles.cursorActive : ""}`} aria-hidden="true">
      ▶
    </span>
  );

  return (
    <nav ref={rootRef} className={styles.navRoot} aria-label="Site navigation" onBlur={onBlur}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.menuToggle}
        onClick={() => {
          playSound("/sounds/button.mp3");
          if (menuOpen) close(true);
          else open();
        }}
        aria-expanded={menuOpen}
        aria-controls="battle-menu"
      >
        Menu
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="battle-menu"
            className={styles.battleMenu}
            style={{ transformOrigin: "top right" }}
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: DUR.base, ease: steps(4) }}
          >
            <div className={styles.battleMenuInner}>
              <ul className={styles.menuList} onKeyDown={onListKey}>
                {ITEMS.map((item, i) => (
                  <li key={item.label} className={styles.menuRow}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        {...rowProps(i)}
                        onClick={() => {
                          playSound("/sounds/button.mp3");
                          close();
                        }}
                      >
                        {cursor(i)}
                        {item.label}
                      </Link>
                    ) : (
                      <a href={`${scene ? "" : "/"}#${item.id}`} {...rowProps(i)} onClick={(e) => jumpTo(e, item.id!)}>
                        {cursor(i)}
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
                <li className={styles.menuRow}>
                  <button type="button" aria-haspopup="dialog" {...rowProps(OPTIONS_ROW)} onClick={showOptions}>
                    {cursor(OPTIONS_ROW)}
                    OPTIONS
                  </button>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
