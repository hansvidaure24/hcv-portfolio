"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import PixelPanel from "./PixelPanel";
import { useDialogFocus } from "../../lib/useDialogFocus";
import { useMotionSettings } from "../providers/MotionPreferenceProvider";
import { useSoundSetting } from "../../lib/useSoundSetting";
import {
  setTextSpeed,
  setTimePreference,
  useTextSpeed,
  useTimePreference,
  type TimePreference,
} from "../../lib/preferences";
import { playSound } from "../../lib/sound";
import styles from "./OptionsDialog.module.scss";

type OptionRow = {
  key: string;
  label: string;
  value: string;
  values: string[];
  help: string;
  set: (value: string) => void;
};

/**
 * The OPTIONS screen: every preference in one retro panel. Each row cycles
 * its value on click, and ← → step through values when it has focus.
 */
export default function OptionsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const motion = useMotionSettings();
  const sound = useSoundSetting();
  const textSpeed = useTextSpeed();
  const time = useTimePreference();

  useDialogFocus(open, dialogRef);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const rows: OptionRow[] = [
    {
      key: "text",
      label: "TEXT SPEED",
      value: textSpeed === "fast" ? "FAST" : "NORMAL",
      values: ["NORMAL", "FAST"],
      help: "Fast shows text at once and skips intro animations.",
      set: (v) => setTextSpeed(v === "FAST" ? "fast" : "normal"),
    },
    {
      key: "motion",
      label: "ANIMATIONS",
      value: motion.reduced ? "REDUCED" : "FULL",
      values: ["FULL", "REDUCED"],
      help: "Reduced stops moving scenery, wipes and fades.",
      set: (v) => motion.setPreference(v === "REDUCED" ? "reduce" : "full"),
    },
    {
      key: "sound",
      label: "SOUND",
      value: sound.enabled ? "ON" : "OFF",
      values: ["OFF", "ON"],
      help: "Background music and menu sounds.",
      set: (v) => {
        if ((v === "ON") !== sound.enabled) sound.toggle();
      },
    },
    {
      key: "time",
      label: "TIME OF DAY",
      value: time.toUpperCase(),
      values: ["AUTO", "MORNING", "DAY", "DUSK", "NIGHT"],
      help: "Auto follows your clock.",
      set: (v) => setTimePreference(v.toLowerCase() as TimePreference),
    },
  ];

  function step(row: OptionRow, direction: 1 | -1) {
    const i = row.values.indexOf(row.value);
    const next = row.values[(i + direction + row.values.length) % row.values.length]!;
    row.set(next);
    // After the change, so turning sound on is audible.
    playSound("/sounds/menu-navigation.mp3", 0.5);
  }

  return createPortal(
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="options-title" className={styles.dialog}>
        <PixelPanel
          title="OPTIONS"
          titleAs="h2"
          titleId="options-title"
          titleAside={
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close options">
              ×
            </button>
          }
          bodyClassName={styles.body}
        >
          <ul className={styles.rows}>
            {rows.map((row) => (
              <li key={row.key} className={styles.row}>
                <span className={styles.label} aria-hidden="true">
                  {row.label}
                </span>
                <button
                  type="button"
                  className={styles.value}
                  aria-label={`${row.label.toLowerCase()}: ${row.value.toLowerCase()}`}
                  aria-describedby={`option-${row.key}-help`}
                  onClick={() => step(row, 1)}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") {
                      e.preventDefault();
                      step(row, 1);
                    } else if (e.key === "ArrowLeft") {
                      e.preventDefault();
                      step(row, -1);
                    }
                  }}
                >
                  <span aria-hidden="true">◀</span>
                  <span className={styles.valueText}>{row.value}</span>
                  <span aria-hidden="true">▶</span>
                </button>
                <p id={`option-${row.key}-help`} className={styles.help}>
                  {row.help}
                </p>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.done} onClick={onClose}>
            Done
          </button>
        </PixelPanel>
      </div>
    </div>,
    document.body
  );
}
