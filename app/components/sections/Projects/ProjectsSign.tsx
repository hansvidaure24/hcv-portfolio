import styles from "./ProjectsSign.module.scss";

/** The wooden route sign, used as the Projects section heading. */
export default function ProjectsSign() {
  return (
    <div className={styles.sign}>
      <h2 className={styles.signText}>Selected work</h2>
    </div>
  );
}
