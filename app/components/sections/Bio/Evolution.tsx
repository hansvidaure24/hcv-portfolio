"use client";
import { useEffect, useRef, useState } from "react";
import PixelPanel from "../../ui/PixelPanel";
import { useContactDialog } from "../../providers/ContactDialogProvider";
import { useMotionSettings } from "../../providers/MotionPreferenceProvider";
import { useTextSpeed } from "../../../lib/preferences";
import { playSound } from "../../../lib/sound";
import styles from "./Evolution.module.scss";

// Facts from the resume (resume/hcv-resume.html); keep the two in sync.
const STAGES = [
  {
    name: "PLAYER",
    when: "Growing up",
    text: "Grew up in the Philippines and got into programming through video games.",
  },
  {
    name: "STUDENT",
    when: "2019 – 2023",
    text: "B.A. in Computer Science at Queens College (CUNY). Founded QC TROPA, a Filipino cultural club, and interned at the CUNY Building Performance Lab.",
  },
  {
    name: "TRAINEE",
    when: "Sep 2023 – Jan 2024",
    text: "Fiserv technical trainee: built a full-stack capstone (React, Spring Boot, MySQL) in five months and presented it for sign-off.",
  },
  {
    name: "ENGINEER",
    when: "Jan 2024 – now",
    text: "Software Development Engineer at Fiserv: C#/ASP.NET APIs, React UI and SQL for online banking, plus security fixes, concurrency bugs and incidents. Still builds games and game tools on the side.",
  },
];

/**
 * Career timeline as an evolution chain. When it scrolls into view each
 * stage flashes in turn, like an evolution; reduced motion and text speed
 * "Fast" show it as-is. The last stage is the role Hans is looking for.
 */
export default function Evolution({ className = "" }: { className?: string }) {
  const listRef = useRef<HTMLOListElement>(null);
  const { openDialog } = useContactDialog();
  const { reduced } = useMotionSettings();
  const textFast = useTextSpeed() === "fast";
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = listRef.current;
    if (!el || reduced || textFast) {
      setArmed(false);
      return;
    }
    setArmed(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, textFast]);

  return (
    <PixelPanel title="Career path" titleAside="What? HANS is evolving!" className={className}>
      <ol
        ref={listRef}
        className={`${styles.chain} ${armed ? styles.armed : ""} ${visible ? styles.visible : ""}`}
      >
        {STAGES.map((stage, i) => (
          <li key={stage.name} className={styles.stage} style={{ "--i": i } as React.CSSProperties}>
            <span className={styles.stageNo}>STAGE {i + 1}</span>
            <h4 className={styles.stageName}>{stage.name}</h4>
            <p className={styles.when}>{stage.when}</p>
            <p className={styles.text}>{stage.text}</p>
          </li>
        ))}
        <li className={`${styles.stage} ${styles.next}`} style={{ "--i": STAGES.length } as React.CSSProperties}>
          <span className={styles.stageNo}>NEXT</span>
          {/* "???" is the reveal; screen readers hear what it means. */}
          <h4 className={styles.stageName}>
            <span aria-hidden="true">???</span>
            <span className={styles.srOnly}>Next role</span>
          </h4>
          <p className={styles.when}>Your team</p>
          {/* Same target as the trainer card's line in BioDashboard: one level, said once. */}
          <p className={styles.text}>A team where I own features end to end and grow toward a senior role.</p>
          <button
            type="button"
            className={styles.cta}
            onClick={() => {
              playSound("/sounds/button.mp3");
              openDialog();
            }}
          >
            Send a message <span aria-hidden="true">▶</span>
          </button>
        </li>
      </ol>
    </PixelPanel>
  );
}
