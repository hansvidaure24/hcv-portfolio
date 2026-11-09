import PixelPanel from "../../ui/PixelPanel";
import styles from "./Evolution.module.scss";

/** Education. His work history is in Experience. */
export default function Evolution({ className = "" }: { className?: string }) {
  return (
    <PixelPanel title="Education" className={className}>
      <div className={styles.card}>
        <h4 className={styles.name}>Queens College (CUNY)</h4>
        <p className={styles.when}>2019 – 2023</p>
        {/* Facts from the resume (resume/hcv-resume.html); keep the two in sync. */}
        <p className={styles.text}>
          B.A. in Computer Science. Founded QC TROPA, a Filipino cultural club, and interned at the CUNY Building
          Performance Lab.
        </p>
      </div>
    </PixelPanel>
  );
}
