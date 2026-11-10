import Link from "next/link";
import ParallaxSection from "../../scene/ParallaxSection";
import WaterBackdrop from "./WaterBackdrop";
import Seam from "../../scene/Seam";
import LazyVideo from "../../ui/LazyVideo";
import PixelPanel from "../../ui/PixelPanel";
import SectionHeading from "../../ui/SectionHeading";
import TrainerStats from "./TrainerStats";
import { RESUME, type ResumeEntry } from "../../../data/resume";
import { TESTIMONIALS } from "../../../data/party";
import type { TrainerStats as TrainerData } from "../../../lib/github";
import styles from "./Experience.module.scss";

const LOOKING_FOR = "Looking for a team where I own features from API to UI.";

// Teammate quotes stay hidden in production until there is at least one.
const SHOW_QUOTES_PLACEHOLDER = process.env.NODE_ENV === "development";

/** "Jan 2024 – Present" → "JAN '24 – NOW". */
function shortWhen(when = "") {
  return when.replace(/([A-Z][a-z]{2}) \d{2}(\d{2})/g, (_, month: string, year: string) => `${month.toUpperCase()} '${year}`).replace("Present", "NOW");
}

/**
 * One row of the timeline, from an entry in the resume data, so the two
 * never disagree: the role is the entry's detail up to its first comma, and
 * the lines are its points (or, for a degree, the rest of its detail).
 */
function row(list: readonly ResumeEntry[], name: string, role: string) {
  const entry = list.find((e) => e.name === name && e.detail?.startsWith(role));
  if (!entry) return [];
  const [title = "", ...rest] = (entry.detail ?? "").split(", ");
  const lines = entry.points.length > 0 ? entry.points : rest.length > 0 ? [rest.join(", ")] : [];
  return [{ role: title, org: name, when: shortWhen(entry.when), lines }];
}

// Work first, newest first, then school. General responsibilities only for
// Fiserv: specifics about its systems, performance or security need its
// review before they can be public (see app/data/resume.ts).
const TIMELINE = [
  ...row(RESUME.experience, "Fiserv", "Software Development Engineer"),
  ...row(RESUME.experience, "Fiserv", "Technical Trainee"),
  ...row(RESUME.experience, "CUNY Building Performance Lab", "Student Intern"),
  ...row(RESUME.leadership, "QC TROPA", "Founder"),
  ...row(RESUME.education, "Queens College (CUNY)", "B.A."),
];

/**
 * Experience and About in one: the career as a timeline you can read in a
 * few seconds (when, role @ place, what it was), beside a short profile.
 * Professional work comes first on the page: it's the evidence a recruiter
 * came for. The skills list is under Work, next to the projects that prove it.
 */
export default function Experience({ trainer }: { trainer: TrainerData | null }) {
  const showQuotes = TESTIMONIALS.length > 0 || SHOW_QUOTES_PLACEHOLDER;

  return (
    <ParallaxSection
      id="experience"
      bgClassName={styles.experienceBg}
      background={<WaterBackdrop />}
      overlay={<Seam kind="field-water" />}
      contentClassName={styles.experienceContent}
    >
      <div className={styles.inner}>
        <SectionHeading>Experience</SectionHeading>

        <div className={styles.grid}>
          <PixelPanel title="Timeline" className={styles.timelinePanel} bodyClassName={styles.timelineBody}>
            <ol className={styles.timeline}>
              {TIMELINE.map((item) => (
                <li key={`${item.org} ${item.role}`} className={styles.row}>
                  <p className={styles.when}>{item.when}</p>
                  <div className={styles.what}>
                    <h4 className={styles.role}>
                      {item.role} <span className={styles.org}>@ {item.org}</span>
                    </h4>
                    {item.lines.map((line) => (
                      <p key={line} className={styles.line}>
                        {line}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/resume" className={styles.resumeLink}>
              Full resume <span aria-hidden="true">▶</span>
            </Link>
          </PixelPanel>

          <PixelPanel title="Profile" titleAside="NO. 001" className={styles.profilePanel} bodyClassName={styles.profileBody}>
            <div className={styles.portrait}>
              <LazyVideo src="/videos/bio-photos.mp4" poster="/videos/bio-photos.jpg" />
            </div>
            <p className={styles.name}>HANS VIDAURE</p>
            <p className={styles.tagline}>{LOOKING_FOR}</p>
            <TrainerStats stats={trainer} />
          </PixelPanel>

          {showQuotes && (
            <PixelPanel title="What teammates say" className={styles.wide} bodyClassName={styles.quotesBody}>
              {TESTIMONIALS.length > 0 ? (
                <ul className={styles.quotes}>
                  {TESTIMONIALS.map((t) => (
                    <li key={t.name} className={styles.quote}>
                      <blockquote className={styles.quoteText}>
                        <p>&ldquo;{t.quote}&rdquo;</p>
                      </blockquote>
                      <p className={styles.quoteBy}>
                        {t.href ? (
                          <a href={t.href} target="_blank" rel="noopener noreferrer">
                            {t.name}
                          </a>
                        ) : (
                          t.name
                        )}
                        <span className={styles.quoteRole}>{t.role}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.placeholder}>
                  Dev only: add quotes to <code>TESTIMONIALS</code> in app/data/party.ts. This panel stays hidden in
                  production until there is at least one.
                </p>
              )}
            </PixelPanel>
          )}
        </div>
      </div>
    </ParallaxSection>
  );
}
