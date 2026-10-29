import ParallaxSection from "../../scene/ParallaxSection";
import { MOVES, TESTIMONIALS } from "../../../data/party";
import styles from "./Party.module.scss";

const SHOW_PLACEHOLDER = process.env.NODE_ENV === "development";

/** The "why hire me" outro: three strengths styled as moves, then teammate quotes. */
export default function Party() {
  const showTestimonials = TESTIMONIALS.length > 0 || SHOW_PLACEHOLDER;

  return (
    <ParallaxSection id="party" bgClassName={styles.partyBg} contentClassName={styles.partyContent}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>ADD HANS TO YOUR PARTY?</h2>
        </div>

        <div className={`${styles.layout} ${showTestimonials ? "" : styles.layoutSingle}`}>
          <section className={styles.panel} aria-labelledby="party-moves">
            <h3 id="party-moves" className={styles.panelHeader}>MOVES</h3>
            <ol className={styles.moves}>
              {MOVES.map((move) => (
                <li key={move.name} className={styles.move}>
                  <div className={styles.moveTop}>
                    <span className={styles.moveName}>{move.name}</span>
                    <span className={`${styles.type} ${styles[`type${move.type}`]}`}>{move.type}</span>
                  </div>
                  <p className={styles.effect}>{move.effect}</p>
                  <p className={styles.proof}>
                    <span className={styles.proofLabel}>PROOF</span> {move.proof}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          {showTestimonials && (
            <section className={styles.panel} aria-labelledby="party-quotes">
              <h3 id="party-quotes" className={styles.panelHeader}>WHAT TEAMMATES SAY</h3>
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
            </section>
          )}
        </div>
      </div>
    </ParallaxSection>
  );
}
