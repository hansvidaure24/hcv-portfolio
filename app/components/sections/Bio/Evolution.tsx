"use client";
import PixelPanel from "../../ui/PixelPanel";
import { useContactDialog } from "../../providers/ContactDialogProvider";
import { playSound } from "../../../lib/sound";
import styles from "./Evolution.module.scss";

/** Education, then the role Hans wants next. His work history is in Experience. */
export default function Evolution({ className = "" }: { className?: string }) {
  const { openDialog } = useContactDialog();

  return (
    <PixelPanel title="Education and next role" className={className}>
      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.label}>EDUCATION</span>
          <h4 className={styles.name}>Queens College (CUNY)</h4>
          <p className={styles.when}>2019 – 2023</p>
          {/* Facts from the resume (resume/hcv-resume.html); keep the two in sync. */}
          <p className={styles.text}>
            B.A. in Computer Science. Founded QC TROPA, a Filipino cultural club, and interned at the CUNY Building
            Performance Lab.
          </p>
        </div>
        <div className={`${styles.card} ${styles.next}`}>
          <span className={styles.label}>NEXT</span>
          <h4 className={styles.name}>Your team</h4>
          <p className={styles.text}>A team where I own features end to end and grow toward a senior role.</p>
          <button
            type="button"
            className={styles.cta}
            data-track="message_open"
            onClick={() => {
              playSound("/sounds/button.mp3");
              openDialog();
            }}
          >
            Send a message <span aria-hidden="true">▶</span>
          </button>
        </div>
      </div>
    </PixelPanel>
  );
}
