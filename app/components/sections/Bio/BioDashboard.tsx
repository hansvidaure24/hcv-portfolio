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

const LOOKING_FOR = "Looking for a team where I own features from API to UI.";

// Teammate quotes stay hidden in production until there is at least one.
const SHOW_QUOTES_PLACEHOLDER = process.env.NODE_ENV === "development";

/**
 * About: why hire him (moves) first, then who he is (trainer card, skills) and
 * his education. What he has shipped is in the Experience section above, so
 * nothing is said twice.
 */
export default function BioDashboard({ trainer }: { trainer: TrainerData | null }) {
  const showQuotes = TESTIMONIALS.length > 0 || SHOW_QUOTES_PLACEHOLDER;

  return (
    <div className={styles.dashboard}>
      <SectionHeading>About</SectionHeading>

      <div className={styles.grid}>
        <PixelPanel title="Why hire me" className={styles.wide} bodyClassName={styles.panelBody}>
          <ol className={styles.moves}>
            {MOVES.map((move) => (
              <li key={move.name} className={styles.move}>
                <div className={styles.moveTop}>
                  <span className={styles.moveName}>{move.name}</span>
                  <span className={styles.type}>{move.type}</span>
                </div>
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
        </PixelPanel>

        <PixelPanel title="Skills, with proof" titleAside={`${CORE_COUNT} CORE · ${DEX.length} IN ALL`} bodyClassName={styles.panelBody}>
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
