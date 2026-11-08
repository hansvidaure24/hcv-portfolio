import type { Project } from "../../../data/projects";
import styles from "./StatBars.module.scss";

/**
 * Base-stat bars for a case study's numbers that have a real maximum
 * (scores out of 100, x of y test cases). Bar colors follow an HP bar:
 * green from 80%, gold from 40%, red below.
 */
export default function StatBars({ stats }: { stats: NonNullable<Project["stats"]> }) {
  return (
    <div className={styles.stats}>
      <p className={styles.title}>KEY NUMBERS</p>
      <dl className={styles.list}>
        {stats.map((stat) => {
          const pct = Math.round((stat.value / stat.max) * 100);
          const tone = pct >= 80 ? styles.high : pct >= 40 ? styles.mid : styles.low;
          return (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.label}>{stat.label}</dt>
              <dd className={styles.valueRow}>
                <span className={styles.bar} aria-hidden="true">
                  <span className={`${styles.fill} ${tone}`} style={{ width: `${pct}%` }} />
                </span>
                <span className={styles.value}>
                  {stat.value}/{stat.max}
                </span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
