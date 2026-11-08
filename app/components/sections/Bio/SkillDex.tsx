"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DEX, dexNumber, type DexEntry, type DexEvidence } from "../../../data/dex";
import { useMotionSettings } from "../../providers/MotionPreferenceProvider";
import { useScene } from "../../scene/SceneProvider";
import { playSound } from "../../../lib/sound";
import styles from "./SkillDex.module.scss";

// Chip-style spellings ("Unity / C#", "WebRTC (PeerJS)") match chips but aren't worth listing.
const shownAliases = (entry: DexEntry) => entry.aliases.filter((alias) => !/[/(+]/.test(alias));

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
 * The SKILL DEX: every skill on the site with its proof. A vertical tab list
 * (↑ ↓ Home End) on the left, the selected entry on the right; on narrow
 * panels the list sits above. Links like "#dex-csharp" (stack chips, case
 * studies) open an entry and scroll here. Every entry stays in the page for
 * search engines; only the selected one is shown.
 */
export default function SkillDex() {
  const [selected, setSelected] = useState(0);
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
      setSelected(index);
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

  function onKey(e: React.KeyboardEvent, index: number) {
    const last = DEX.length - 1;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? Math.min(index + 1, last)
      : e.key === "ArrowUp" || e.key === "ArrowLeft" ? Math.max(index - 1, 0)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    select(next, true);
  }

  return (
    <div ref={rootRef} className={styles.dex} id="skill-dex">
      <div className={styles.layout}>
        <div role="tablist" aria-orientation="vertical" aria-label="Skills" className={styles.list}>
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
              className={styles.row}
              onClick={() => select(i)}
              onKeyDown={(e) => onKey(e, i)}
            >
              <span className={styles.no}>{dexNumber(entry)}</span>
              <span className={styles.rowName}>{entry.name}</span>
              <span className={styles.ball} data-status={entry.status} aria-hidden="true" />
              <span className={styles.srOnly}>, {entry.status}</span>
            </button>
          ))}
        </div>

        {DEX.map((entry, i) => {
          const aliases = shownAliases(entry);
          const related = (entry.related ?? []).map((id) => DEX.findIndex((e) => e.id === id)).filter((n) => n >= 0);
          return (
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
                  {entry.status === "caught" ? "CAUGHT" : "SEEN"}
                </span>
              </header>
              <p className={styles.type}>
                <span className={styles.label}>TYPE</span> {entry.type}
              </p>

              <ul className={styles.evidence} aria-label={`Proof of ${entry.name}`}>
                {entry.evidence.map((ev) => (
                  <li key={ev.text}>
                    <span>
                      <EvidenceLink evidence={ev} />: {ev.text}
                    </span>
                  </li>
                ))}
              </ul>

              {aliases.length > 0 && (
                <p className={styles.small}>
                  <span className={styles.label}>ALSO CALLED</span> {aliases.join(", ")}
                </p>
              )}
              {related.length > 0 && (
                <p className={styles.small}>
                  <span className={styles.label}>RELATED</span>{" "}
                  {related.map((index, n) => (
                    <span key={DEX[index]!.id}>
                      {n > 0 && " · "}
                      <button type="button" className={styles.relatedButton} onClick={() => select(index, true)}>
                        {DEX[index]!.name}
                      </button>
                    </span>
                  ))}
                </p>
              )}
            </section>
          );
        })}

        <p className={styles.legend}>
          <span className={styles.ball} data-status="caught" aria-hidden="true" /> CAUGHT: used at Fiserv or in a live or
          public project. <span className={styles.ball} data-status="seen" aria-hidden="true" /> SEEN: only in training, or
          in a game still in development.
        </p>
      </div>
    </div>
  );
}
