"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useMotionSettings } from "./MotionPreferenceProvider";
import { useTextSpeed } from "../../lib/preferences";
import styles from "./DialogueBox.module.scss";

type DialogueValue = {
  /** Show one line in the dialogue box, replacing any line already showing. */
  say: (text: string) => void;
};

const DialogueContext = createContext<DialogueValue | null>(null);

export function useDialogue() {
  const ctx = useContext(DialogueContext);
  if (!ctx) throw new Error("useDialogue must be used within DialogueProvider");
  return ctx;
}

const LETTER_MS = 24;
const STAY_MS = 3500;

type Line = { id: number; text: string };

/**
 * The site's one place for feedback ("Email copied!", "Message sent!",
 * Torchic): a GBA-style text box along the bottom that types its line, shows
 * a ▼ when done, and closes on click or after a few seconds. Text speed
 * "Fast" and reduced motion show the whole line at once. Screen readers get
 * the full line through a polite live region.
 */
export default function DialogueProvider({ children }: { children: ReactNode }) {
  const [line, setLine] = useState<Line | null>(null);
  const [shown, setShown] = useState(0);
  const textSpeed = useTextSpeed();
  const { reduced } = useMotionSettings();

  const say = useCallback((text: string) => {
    setLine({ id: Date.now() + Math.random(), text });
  }, []);

  // Type the line out.
  useEffect(() => {
    if (!line) return;
    if (textSpeed === "fast" || reduced) {
      setShown(line.text.length);
      return;
    }
    setShown(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setShown(i);
      if (i >= line.text.length) clearInterval(timer);
    }, LETTER_MS);
    return () => clearInterval(timer);
  }, [line, textSpeed, reduced]);

  const done = line !== null && shown >= line.text.length;

  // Close a few seconds after the line finishes.
  useEffect(() => {
    if (!line || !done) return;
    const timer = setTimeout(() => setLine(null), STAY_MS);
    return () => clearTimeout(timer);
  }, [line, done]);

  return (
    <DialogueContext.Provider value={{ say }}>
      {children}
      <div className={styles.liveRegion} role="status" aria-live="polite">
        {line?.text ?? ""}
      </div>
      {line && (
        <button
          key={line.id}
          type="button"
          className={styles.box}
          aria-label="Dismiss message"
          // First click finishes the line; the next one closes it, like pressing A.
          onClick={() => (done ? setLine(null) : setShown(line.text.length))}
        >
          <span aria-hidden="true">{line.text.slice(0, shown)}</span>
          {done && (
            <span className={styles.arrow} aria-hidden="true">
              ▼
            </span>
          )}
        </button>
      )}
    </DialogueContext.Provider>
  );
}
