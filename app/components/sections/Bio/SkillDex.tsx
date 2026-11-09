"use client";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import {
  CORE_DEX_IDS,
  DEX,
  STATUS_LABEL,
  STATUS_MEANING,
  dexNumber,
  type DexEvidence,
} from "../../../data/dex";
import { useMotionSettings } from "../../providers/MotionPreferenceProvider";
import { useScene } from "../../scene/SceneProvider";
import { playSound } from "../../../lib/sound";
import styles from "./SkillDex.module.scss";

// The core skills' positions in DEX, in dex order (so the numbers only go up).
const CORE = DEX.map((entry, i) => (CORE_DEX_IDS.includes(entry.id) ? i : -1)).filter((i) => i >= 0);
const ALL = DEX.map((_, i) => i);

function EvidenceLink({ evidence }: { evidence: DexEvidence }) {
  return evidence.href.startsWith("/") ? (
    <Link href={evidence.href}>{evidence.source}</Link>
  ) : (
    <a href={evidence.href} target="_blank" rel="noopener noreferrer">
      {evidence.source}
    </a>
  );
}

/**
 * The skills panel (the Skill Dex): every skill on the site with its proof. A
 * vertical tab list (↑ ↓ Home End) on the left, the selected entry on the
 * right; on narrow panels the list sits above. The list starts with the core
 * skills for the roles Hans wants (CORE_DEX_IDS); "Show all" lists the rest.
 * Links like "#dex-csharp" (stack chips, case studies) open an entry, showing
 * the full list first if needed, and scroll here. Every entry stays in the
 * page for search engines; only the selected one is shown.
 */
export default function SkillDex() {
  const [selected, setSelected] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? ALL : CORE;
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
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

  function select(index: number, focus = false) {
    if (!DEX[index]) return;
    if (index !== selected) playSound("/sounds/menu-navigation.mp3", 0.5);
    setSelected(index);
    if (focus) tabRefs.current[index]?.focus();
  }

  // Open an entry from "#dex-<id>": on load, on hash changes, and on clicks
  // of same-page links (which fire no hashchange when the hash is unchanged).
  useEffect(() => {
    // Scroll the dex to just below the top bar. About fades up 32px when it
    // first comes into view (a transform), so measure the layout position
    // (offsetTop ignores transforms) rather than the on-screen one, and mark
    // About as reached by a jump so it appears in place, like section jumps.
    function scrollToDex() {
      const dex = rootRef.current;
      if (!dex) return;
      let top = 0;
      for (let node: HTMLElement | null = dex; node; node = node.offsetParent as HTMLElement | null) top += node.offsetTop;
      const margin = parseFloat(getComputedStyle(dex).scrollMarginTop) || 0;
      const jump = sceneRef.current?.jumpTargetRef;
      if (jump) {
        jump.current = "about";
        window.setTimeout(() => {
          if (jump.current === "about") jump.current = null;
        }, 1500);
      }
      window.scrollTo({ top: top - margin, behavior: reducedRef.current ? "instant" : "smooth" });
    }

    function open(hash: string | null): boolean {
      const index = hash?.startsWith("#dex-") ? DEX.findIndex((e) => e.id === hash.slice(5)) : -1;
      if (index < 0) return false;
      // A skill outside the core list: show the full list first, synchronously,
      // so its row exists (and can take focus) below.
      flushSync(() => {
        if (!CORE.includes(index)) setShowAll(true);
        setSelected(index);
      });
      scrollToDex();
      // Keyboard users land on the entry they asked for, not back at the link.
      const tab = tabRefs.current[index];
      tab?.focus({ preventScroll: true });
      // Scroll the list itself (not the page) so the selected row is visible.
      const list = tab?.parentElement;
      if (tab && list) list.scrollTop = tab.offsetTop - list.offsetTop - (list.clientHeight - tab.offsetHeight) / 2;
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
    // everything above by a few lines, so the dex lands below the top bar.
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
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  // Arrow keys move through the rows that are showing (core or all).
  function onKey(e: React.KeyboardEvent, index: number) {
    const pos = visible.indexOf(index);
    const last = visible.length - 1;
    const nextPos =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? Math.min(pos + 1, last)
      : e.key === "ArrowUp" || e.key === "ArrowLeft" ? Math.max(pos - 1, 0)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (nextPos < 0) return;
    e.preventDefault();
    select(visible[nextPos]!, true);
  }

  function toggleAll() {
    playSound("/sounds/button.mp3");
    // Collapsing while a non-core skill is open: open the first core one.
    if (showAll && !CORE.includes(selected)) setSelected(CORE[0]!);
    setShowAll(!showAll);
  }

  return (
    <div ref={rootRef} className={styles.dex} id="skill-dex">
      <div className={styles.layout}>
        <div className={styles.listColumn}>
          <div id="skill-list" role="tablist" aria-orientation="vertical" aria-label="Skills" className={styles.list}>
            {DEX.map((entry, i) => (
              <button
                key={entry.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`dex-tab-${entry.id}`}
                aria-selected={i === selected}
                aria-controls={`dex-entry-${entry.id}`}
                tabIndex={i === selected ? 0 : -1}
                // Rendered either way, so a "#dex-..." link can always find its row.
                hidden={!visible.includes(i)}
                className={styles.row}
                onClick={() => select(i)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <span className={styles.no}>{dexNumber(entry)}</span>
                <span className={styles.rowName}>{entry.name}</span>
                <span className={styles.ball} data-status={entry.status} aria-hidden="true" />
                <span className={styles.srOnly}>, {STATUS_LABEL[entry.status].toLowerCase()}</span>
              </button>
            ))}
          </div>
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

        {DEX.map((entry, i) => (
          <section
            key={entry.id}
            id={`dex-entry-${entry.id}`}
            role="tabpanel"
            aria-labelledby={`dex-tab-${entry.id}`}
            hidden={i !== selected}
            tabIndex={0}
            className={styles.entry}
          >
            <header className={styles.entryHead}>
              <span className={styles.entryNo}>{dexNumber(entry)}</span>
              <h4 className={styles.entryName}>{entry.name}</h4>
              <span className={styles.status} data-status={entry.status}>
                {STATUS_LABEL[entry.status]}
              </span>
            </header>

            <ul className={styles.evidence} aria-label={`Proof of ${entry.name}`}>
              {entry.evidence.map((ev) => (
                <li key={ev.text}>
                  <span>
                    <EvidenceLink evidence={ev} />: {ev.text}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <p className={styles.legend}>
          <span className={styles.ball} data-status="caught" aria-hidden="true" /> {STATUS_LABEL.caught}:{" "}
          {STATUS_MEANING.caught}. <span className={styles.ball} data-status="seen" aria-hidden="true" />{" "}
          {STATUS_LABEL.seen}: {STATUS_MEANING.seen}.
        </p>
      </div>
    </div>
  );
}
