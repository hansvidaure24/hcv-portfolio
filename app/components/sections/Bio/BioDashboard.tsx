import LazyVideo from "../../ui/LazyVideo";
import PixelPanel from "../../ui/PixelPanel";
import SectionHeading from "../../ui/SectionHeading";
import Evolution from "./Evolution";
import { MOVES, TESTIMONIALS } from "../../../data/party";
import styles from "./BioDashboard.module.scss";

const SKILL_GROUPS = [
  { label: "AT WORK", skills: ["C#", "ASP.NET", "React", "SQL"] },
  { label: "ALSO", skills: ["TypeScript", "Next.js", "Playwright", "WebRTC", "Tauri", "Unity", "Java / Spring Boot", "Python"] },
];

const INTERESTS = ["Full-stack engineering", "Application security", "Game dev (hobby)"];

const LOOKING_FOR = "Looking for a team where I own features end to end, from API to UI, and grow toward a senior role.";

const QUEST_LOG = [
  "Shipped 10+ features and third-party integrations across C#, ASP.NET, React and SQL",
  "Automated data maintenance with SQL scripts and a scheduled sync job",
  "Wrote runbooks for the team",
];

// Teammate quotes stay hidden in production until there is at least one.
const SHOW_QUOTES_PLACEHOLDER = process.env.NODE_ENV === "development";

/**
 * About: who Hans is (trainer card, skills), how he got here (the evolution
 * timeline), what he's shipped, and why hire him (moves). The old separate
 * "Why me" section now lives here, so nothing is said twice.
 */
export default function BioDashboard() {
  const showQuotes = TESTIMONIALS.length > 0 || SHOW_QUOTES_PLACEHOLDER;

  return (
    <div className={styles.dashboard}>
      <SectionHeading>Trainer profile</SectionHeading>

      <div className={styles.grid}>
        <PixelPanel title="TRAINER" titleAside="NO. 001" bodyClassName={styles.panelBody}>
          <div className={styles.portrait}>
            <LazyVideo src="/videos/bio-photos.mp4" poster="/videos/bio-photos.jpg" />
          </div>
          <p className={styles.name}>HANS VIDAURE</p>
          <p className={styles.tagline}>{LOOKING_FOR}</p>
          <div>
            <p className={styles.label}>INTERESTS</p>
            <ul className={styles.chips}>
              {INTERESTS.map((interest) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          </div>
        </PixelPanel>

        <PixelPanel title="SKILLS" bodyClassName={styles.panelBody}>
          <div className={styles.clip}>
            <LazyVideo src="/videos/bio-thoughts.mp4" poster="/videos/bio-thoughts.jpg" />
          </div>
          <dl className={styles.skillGroups}>
            {SKILL_GROUPS.map((group) => (
              <div key={group.label}>
                <dt className={styles.label}>{group.label}</dt>
                <dd className={styles.chips}>
                  {group.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </PixelPanel>

        <Evolution className={styles.wide} />

        <PixelPanel title="WHAT I'VE SHIPPED AT FISERV" bodyClassName={styles.panelBody}>
          <ul className={styles.questLog}>
            {QUEST_LOG.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PixelPanel>

        <PixelPanel title="WHY HIRE ME: MOVES" bodyClassName={styles.panelBody}>
          <ol className={styles.moves}>
            {MOVES.map((move) => (
              <li key={move.name} className={styles.move}>
                <div className={styles.moveTop}>
                  <span className={styles.moveName}>{move.name}</span>
                  <span className={styles.type}>{move.type}</span>
                </div>
                <p className={styles.effect}>{move.effect}</p>
                <p className={styles.proof}>
                  <span className={styles.proofLabel}>PROOF</span> {move.proof}
                </p>
              </li>
            ))}
          </ol>
        </PixelPanel>

        {showQuotes && (
          <PixelPanel title="WHAT TEAMMATES SAY" className={styles.wide} bodyClassName={styles.panelBody}>
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
  );
}
