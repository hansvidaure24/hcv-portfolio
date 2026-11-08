import LazyVideo from "../../ui/LazyVideo";
import PixelPanel from "../../ui/PixelPanel";
import SectionHeading from "../../ui/SectionHeading";
import Evolution from "./Evolution";
import TrainerStats from "./TrainerStats";
import type { TrainerStats as TrainerData } from "../../../lib/github";
import SkillDex from "./SkillDex";
import { CORE_DEX_IDS, DEX } from "../../../data/dex";
import { MOVES, TESTIMONIALS } from "../../../data/party";
import styles from "./BioDashboard.module.scss";

// The skills panel's title bar counts (app/data/dex.ts).
const CORE_COUNT = CORE_DEX_IDS.length;

const INTERESTS = ["Full-stack engineering", "Application security", "Game dev (hobby)"];

const LOOKING_FOR = "Looking for a team where I own features end to end, from API to UI, and grow toward a senior role.";

// Strongest first: outcomes with a before/after, then scope, then volume.
// Same facts as the resume (app/data/resume.ts); keep the two in sync.
const QUEST_LOG = [
  "Replaced a load-everything transaction history with cursor-based pagination, ending multi-minute timeouts for high-volume business accounts and cutting data per request 10–40x",
  "Closed 20 high-severity CVEs in one release by upgrading a shared library across 17 projects in one coordinated change; the approach became the team’s upgrade playbook",
  "Fixed thread-safety and cache-isolation defects in a multi-account download feature running against five banking cores",
  "Shipped features and third-party integrations across 100+ pull requests: REST APIs and React UI in C#, ASP.NET and SQL",
  "Drove ACH production incidents from triage to resolution, and wrote runbooks that cut ramp-up time for the next one",
  "Replaced hand-maintained routing tables with a scheduled sync job covering 24,000+ ACH and wire records",
  "Remediated 1,150+ Fortify security findings during feature work",
];

// Teammate quotes stay hidden in production until there is at least one.
const SHOW_QUOTES_PLACEHOLDER = process.env.NODE_ENV === "development";

/**
 * About: what Hans has shipped and why hire him (moves) first, then who he is
 * (trainer card, skills) and how he got here (the evolution timeline). The old
 * separate "Why me" section now lives here, so nothing is said twice.
 */
export default function BioDashboard({ trainer }: { trainer: TrainerData | null }) {
  const showQuotes = TESTIMONIALS.length > 0 || SHOW_QUOTES_PLACEHOLDER;

  return (
    <div className={styles.dashboard}>
      <SectionHeading>About</SectionHeading>

      <div className={styles.grid}>
        {/* Work first: it's the evidence a recruiter came for. */}
        <PixelPanel title="What I’ve shipped at Fiserv" bodyClassName={styles.panelBody}>
          <ul className={styles.questLog}>
            {QUEST_LOG.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PixelPanel>

        <PixelPanel title="Why hire me" bodyClassName={styles.panelBody}>
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

        <PixelPanel title="Profile" titleAside="NO. 001" bodyClassName={styles.panelBody}>
          <div className={styles.portrait}>
            <LazyVideo src="/videos/bio-photos.mp4" poster="/videos/bio-photos.jpg" />
          </div>
          <p className={styles.name}>HANS VIDAURE</p>
          <p className={styles.tagline}>{LOOKING_FOR}</p>
          <TrainerStats stats={trainer} />
          <div>
            <p className={styles.label}>INTERESTS</p>
            <ul className={styles.chips}>
              {INTERESTS.map((interest) => (
                <li key={interest}>{interest}</li>
              ))}
            </ul>
          </div>
        </PixelPanel>

        <PixelPanel title="Skills, with proof" titleAside={`${CORE_COUNT} CORE · ${DEX.length} IN ALL`} bodyClassName={styles.panelBody}>
          <div className={styles.clip}>
            <LazyVideo src="/videos/bio-thoughts.mp4" poster="/videos/bio-thoughts.jpg" />
          </div>
          <SkillDex />
        </PixelPanel>

        <Evolution className={styles.wide} />

        {showQuotes && (
          <PixelPanel title="What teammates say" className={styles.wide} bodyClassName={styles.panelBody}>
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
