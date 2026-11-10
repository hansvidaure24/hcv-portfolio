"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { CORE_DEX_IDS, DEX, STATUS_LABEL, STATUS_MEANING, type DexEvidence } from "../../../data/dex";
import { useMotionSettings } from "../../providers/MotionPreferenceProvider";
import { useScene } from "../../scene/sceneContext";
import { playSound } from "../../../lib/sound";
import styles from "./SkillDex.module.scss";

// The core skills' positions in DEX, in dex order.
const CORE = DEX.map((entry, i) => (CORE_DEX_IDS.includes(entry.id) ? i : -1)).filter((i) => i >= 0);

// The day-job stack: core skills whose strongest proof is Fiserv. They share
// one line ("At Fiserv: C# · .NET · …") instead of six that all say "online
// banking features"; their other proof is on the project cards.
const WORK = CORE.filter((i) => DEX[i]!.evidence[0]?.source === "Fiserv");
const WORK_PROOF = DEX[WORK[0] ?? -1]?.evidence[0];
const WORK_SUMMARY = "online banking features from API to UI, through review, testing and release";

// How long a skill opened from a link stays highlighted.
const FLASH_MS = 1600;

/** A proof's source as a link; its detail shows on hover when it isn't written out. */
function EvidenceLink({ evidence, title }: { evidence: DexEvidence; title?: string }) {
  return evidence.href.startsWith("/") ? (
    <Link href={evidence.href} title={title}>
      {evidence.source}
    </Link>
  ) : (
    <a href={evidence.href} target="_blank" rel="noopener noreferrer" title={title}>
      {evidence.source}
    </a>
  );
}

/**
 * The skills panel (the Skill Dex): every skill on the site with its proof,
 * one line each, readable at a glance: no tabs to click through. It starts
 * with the core skills for the roles Hans wants (CORE_DEX_IDS); "Show all"
 * lists the rest. Links like "#dex-csharp" (stack chips, case studies, Type
 * Matchup) jump to a skill, showing the full list first if needed, and
 * highlight it for a moment. Every skill stays in the page for search
 * engines, shown or not.
 */
export default function SkillDex() {
  const [showAll, setShowAll] = useState(false);
  const [flash, setFlash] = useState<number | null>(null);
  // Where each skill is on the page: its own line, or its name on the Fiserv line.
  const rowRefs = useRef<(HTMLElement | null)[]>([]);
  const { reduced } = useMotionSettings();
  const scene = useScene();
  // Read by the listeners below, which are set up once: the scene context
  // changes on every section change, and re-running that effect would replay
  // the "#dex-..." jump from the URL while the visitor scrolls away.
  const sceneRef = useRef(scene);
  const reducedRef = useRef(reduced);
  useEffect(() => {
    sceneRef.current = scene;
    reducedRef.current = reduced;
  });

  // Jump to a skill from "#dex-<id>": on load, on hash changes, and on clicks
  // of same-page links (which fire no hashchange when the hash is unchanged).
  useEffect(() => {
    let flashTimer: ReturnType<typeof setTimeout> | undefined;

    // Scroll the skill to just below the top bar. Work fades up 32px when it
    // first comes into view (a transform), so measure the layout position
    // (offsetTop ignores transforms) rather than the on-screen one, and mark
    // Work as reached by a jump so it appears in place, like section jumps.
    function scrollToRow(row: HTMLElement) {
      let top = 0;
      for (let node: HTMLElement | null = row; node; node = node.offsetParent as HTMLElement | null)
        top += node.offsetTop;
      const margin = parseFloat(getComputedStyle(row).scrollMarginTop) || 0;
      const jump = sceneRef.current?.jumpTargetRef;
      if (jump) {
        jump.current = "projects";
        window.setTimeout(() => {
          if (jump.current === "projects") jump.current = null;
        }, 1500);
      }
      window.scrollTo({
        top: top - margin,
        behavior: reducedRef.current ? "instant" : "smooth",
      });
    }

    function open(hash: string | null): boolean {
      const index = hash?.startsWith("#dex-") ? DEX.findIndex((e) => e.id === hash.slice(5)) : -1;
      if (index < 0) return false;
      // A skill outside the core list: show the full list first, synchronously,
      // so its row is laid out (and can take focus) below.
      flushSync(() => {
        if (!CORE.includes(index)) setShowAll(true);
        setFlash(index);
      });
      clearTimeout(flashTimer);
      flashTimer = setTimeout(() => setFlash(null), FLASH_MS);
      const row = rowRefs.current[index];
      if (!row) return true;
      scrollToRow(row);
      // Keyboard and screen reader users land on the skill they asked for.
      row.focus({ preventScroll: true });
      return true;
    }

    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[href^="#dex-"]');
      const hash = link?.getAttribute("href") ?? null;
      if (open(hash)) {
        e.preventDefault();
        window.history.replaceState(null, "", hash);
      }
    }
    const onHashChange = () => open(window.location.hash);

    // Arriving from another page: wait for the web fonts, whose swap shifts
    // everything above by a few lines, so the skill lands below the top bar.
    let cancelled = false;
    const initialHash = window.location.hash;
    if (initialHash.startsWith("#dex-")) {
      (document.fonts?.ready ?? Promise.resolve()).then(() => {
        if (!cancelled) open(initialHash);
      });
    }
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelled = true;
      clearTimeout(flashTimer);
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  function toggleAll() {
    playSound("/sounds/button.mp3");
    setShowAll(!showAll);
  }

  return (
    <div className={styles.dex} id="skill-dex">
      <ul id="skill-list" className={styles.list} aria-label="Skills, with proof">
        {WORK_PROOF && WORK.length > 1 && (
          <li className={styles.row}>
            <span className={styles.name}>At Fiserv</span>
            <span className={styles.proof}>
              <span className={styles.stack}>
                {WORK.map((i, k) => (
                  <Fragment key={DEX[i]!.id}>
                    {k > 0 && (
                      <span className={styles.dot} aria-hidden="true">
                        {" · "}
                      </span>
                    )}
                    <span
                      ref={(el) => {
                        rowRefs.current[i] = el;
                      }}
                      id={`dex-entry-${DEX[i]!.id}`}
                      tabIndex={-1}
                      data-flash={flash === i ? "" : undefined}
                      className={styles.stackSkill}
                    >
                      {DEX[i]!.name}
                    </span>
                  </Fragment>
                ))}
              </span>
              <span className={styles.workProof}>
                <EvidenceLink evidence={WORK_PROOF} />: {WORK_SUMMARY}
              </span>
            </span>
          </li>
        )}
        {DEX.map((entry, i) =>
          WORK.length > 1 && WORK.includes(i) ? null : (
            <li
              key={entry.id}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              id={`dex-entry-${entry.id}`}
              // Focusable, so a "#dex-..." jump can move focus here.
              tabIndex={-1}
              // Rendered either way, so a "#dex-..." link can always find its row.
              hidden={!showAll && !CORE.includes(i)}
              data-flash={flash === i ? "" : undefined}
              className={styles.row}
            >
              <span className={styles.name}>
                {entry.name}
                {entry.status === "seen" && (
                  <span className={styles.learned} title={STATUS_MEANING.seen}>
                    {STATUS_LABEL.seen.toLowerCase()}
                  </span>
                )}
              </span>
              {/* Each proof by name, linking to it, with the detail on hover, so a
                skill stays on about one line. The strongest (listed first) is
                written out where there's room, unless it's a project: the cards
                above already say what each project proves. */}
              <span className={styles.proof}>
                {entry.evidence.map((ev, k) => (
                  <Fragment key={ev.text}>
                    {k > 0 && (
                      <span className={styles.dot} aria-hidden="true">
                        {" · "}
                      </span>
                    )}
                    <EvidenceLink evidence={ev} title={ev.text} />
                    {k === 0 && !ev.href.startsWith("/projects/") && (
                      <span className={styles.detail}>: {ev.text}</span>
                    )}
                  </Fragment>
                ))}
              </span>
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        className={styles.more}
        aria-expanded={showAll}
        aria-controls="skill-list"
        onClick={toggleAll}
      >
        {showAll ? `Show the ${CORE.length} core skills` : `Show all ${DEX.length} skills`}
      </button>
    </div>
  );
}
