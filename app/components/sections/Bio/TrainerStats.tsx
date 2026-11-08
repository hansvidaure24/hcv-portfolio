import { CAREER_START, NOW } from "../../../data/now";
import { GITHUB_USER, type TrainerStats as TrainerData } from "../../../lib/github";
import styles from "./TrainerStats.module.scss";

const UTC_DATE: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" };

/** "3 YRS 2 MOS" since the first full-time role. */
function playTime(since: string, now: Date): string {
  const start = new Date(since);
  const months = (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + (now.getUTCMonth() - start.getUTCMonth());
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years ? `${years} YR${years === 1 ? "" : "S"}` : "", rest ? `${rest} MO${rest === 1 ? "" : "S"}` : ""]
    .filter(Boolean)
    .join(" ");
}

// The year strip only shows once at least a quarter of the weeks have public
// commits. Most public repos went up in Oct–Nov 2026, so until then a mostly
// empty strip would undersell a year that was spent largely on private work.
const MIN_ACTIVE_WEEKS = 13;

/** 0 (no commits) to 4 (the busiest weeks), relative to the busiest week. */
function level(count: number, max: number): number {
  return count === 0 || max === 0 ? 0 : Math.max(1, Math.ceil((count / max) * 4));
}

/**
 * The trainer card's live stats: play time since the first full-time role,
 * public GitHub numbers and a year of side-project commits, plus the Now
 * line. GitHub data refreshes at most once a day; if GitHub is unavailable,
 * only play time and Now show. The page fetches it (app/page.tsx) and passes
 * it down, so nothing in About waits on the network while rendering.
 */
export default function TrainerStats({ stats }: { stats: TrainerData | null }) {
  const now = new Date();
  const weekly = stats?.weeklyCommits;
  const total = weekly?.reduce((sum, n) => sum + n, 0) ?? 0;
  const busiest = weekly ? Math.max(...weekly) : 0;
  const activeWeeks = weekly?.filter((n) => n > 0).length ?? 0;

  return (
    <div className={styles.card}>
      <dl className={styles.stats}>
        <div>
          <dt>PLAY TIME</dt>
          <dd>{playTime(CAREER_START, now)}</dd>
        </div>
        {stats && (
          <div>
            <dt>PUBLIC REPOS</dt>
            <dd>
              <a href={`https://github.com/${GITHUB_USER}?tab=repositories`} target="_blank" rel="noopener noreferrer">
                {stats.publicRepos}
              </a>
            </dd>
          </div>
        )}
        {stats?.lastPush && (
          <div>
            <dt>LAST PUSH</dt>
            <dd>
              <a href={`https://github.com/${GITHUB_USER}/${stats.lastPush.repo}`} target="_blank" rel="noopener noreferrer">
                {stats.lastPush.repo}
              </a>{" "}
              <span className={styles.muted}>{new Date(stats.lastPush.at).toLocaleDateString("en-US", UTC_DATE)}</span>
            </dd>
          </div>
        )}
      </dl>

      {weekly && activeWeeks >= MIN_ACTIVE_WEEKS && (
        <figure className={styles.activity}>
          <div
            className={styles.strip}
            role="img"
            aria-label={`${total} commits to public repos in the last 12 months; the busiest week had ${busiest}.`}
          >
            {weekly.map((count, i) => (
              <span
                key={i}
                className={styles.week}
                data-level={level(count, busiest)}
                title={`${count} commit${count === 1 ? "" : "s"}, ${51 - i === 0 ? "this week" : `${51 - i} week${51 - i === 1 ? "" : "s"} ago`}`}
              />
            ))}
          </div>
          <figcaption className={styles.caption}>
            {total} commits to public side projects in the last 12 months. Fiserv work is private.
          </figcaption>
        </figure>
      )}

      <p className={styles.now}>
        <span className={styles.nowLabel}>
          NOW · {new Date(NOW.updated).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).toUpperCase()}
        </span>{" "}
        {NOW.text}
      </p>
    </div>
  );
}
