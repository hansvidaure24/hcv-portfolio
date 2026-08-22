"use client";

import { useEffect, useRef, useState } from "react";
import { getFirstGesturePromise, playSound, setSoundEnabled, startBackgroundMusic } from "../../lib/sound";
import { getEffectiveReducedMotion } from "../../lib/motionPreference";
import styles from "./BootScreen.module.scss";

const MIN_DURATION = 700;
const PROGRESS_DURATION = 650;
const EXIT_DURATION = 420;
const BAR_SEGMENTS = 10;

export default function BootScreen() {
  const [progress, setProgress] = useState(0);
  const [awaitingChoice, setAwaitingChoice] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduceMotionRef = useRef(false);

  // Register the first-gesture listener as soon as the app starts.
  useEffect(() => {
    getFirstGesturePromise();
  }, []);

  useEffect(() => {
    const reduceMotion = getEffectiveReducedMotion();
    reduceMotionRef.current = reduceMotion;
    const start = performance.now();
    let choiceTimer: ReturnType<typeof setTimeout>;

    // Wait for the sound preference before entering the site.
    function reachChoice(elapsed: number) {
      const remaining = Math.max(0, MIN_DURATION - elapsed);
      choiceTimer = setTimeout(() => {
        setProgress(100);
        setAwaitingChoice(true);
      }, remaining);
    }

    if (reduceMotion) {
      setProgress(100);
      reachChoice(0);
      return () => clearTimeout(choiceTimer);
    }

    const interval = setInterval(() => {
      const elapsed = performance.now() - start;
      const pct = Math.min(100, Math.round((elapsed / PROGRESS_DURATION) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(interval);
        reachChoice(elapsed);
      }
    }, 40);

    return () => {
      clearInterval(interval);
      clearTimeout(choiceTimer);
    };
  }, []);

  function choose(withSound: boolean) {
    setSoundEnabled(withSound);
    if (withSound) startBackgroundMusic();
    setExiting(true);
    document.documentElement.classList.add("app-booted");
    setTimeout(() => setHidden(true), reduceMotionRef.current ? 0 : EXIT_DURATION);
  }

  if (hidden) return null;

  const filled = Math.round((progress / 100) * BAR_SEGMENTS);
  const bar = "▰".repeat(filled) + "▱".repeat(BAR_SEGMENTS - filled);

  return (
    <div
      className={`${styles.boot} ${exiting ? styles.bootExit : ""}`}
      role="status"
      aria-live="polite"
      aria-label={awaitingChoice ? "Choose sound preference" : "Loading"}
    >
      <div className={styles.panel}>
        {!awaitingChoice ? (
          <>
            <p className={styles.blinkText}>PLEASE WAIT</p>
            <p className={styles.bar} aria-hidden="true">{bar}</p>
            <p className={styles.percent}>{progress}%</p>
            <p className={styles.blinkText}>LOADING GAME...</p>
          </>
        ) : (
          <>
            <p className={styles.choiceTitle}>SOUND?</p>
            <div className={styles.choiceButtons}>
              <button type="button" className={styles.choiceBtn} onClick={() => { choose(true); playSound("/sounds/button.mp3"); }}>
                Play w/ sound
              </button>
              <button type="button" className={styles.choiceBtn} onClick={() => choose(false)}>
                Play w/o sound
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
