"use client";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import PixelPanel from "../../ui/PixelPanel";
import { useDialogFocus } from "../../../lib/useDialogFocus";
import { useDialogue } from "../../providers/DialogueProvider";
import { playSound } from "../../../lib/sound";
import { track } from "../../../lib/analytics";
import { dexHash, type DexEvidence } from "../../../data/dex";
import { matchPost, summaryLine, type MatchRow, type Matchup, type Section } from "../../../lib/matchup";
import { applyMatchup, type AppliedMatchup } from "./matchupApply";
import type { Project } from "../../../data/projects";
import styles from "./TypeMatchup.module.scss";

const EFFECT_TEXT = { super: "It's super effective!", effective: "It's effective.", closest: "Closest experience:" } as const;

// A made-up post, so a visitor without one can see what it does.
const SAMPLE_POST = `Full-Stack Software Engineer

Requirements:
- 3+ years of professional experience
- C# and ASP.NET Core APIs
- React and TypeScript
- SQL Server

Nice to have:
- Docker
- Azure
- Playwright or Cypress`;

function Proof({ evidence, onLeave }: { evidence: DexEvidence; onLeave: () => void }) {
  const link = evidence.href.startsWith("/") ? (
    <Link href={evidence.href} onClick={onLeave}>
      {evidence.source}
    </Link>
  ) : (
    <a href={evidence.href} target="_blank" rel="noopener noreferrer">
      {evidence.source}
    </a>
  );
  return (
    <p className={styles.proof}>
      {link}: {evidence.text}
    </p>
  );
}

function Row({ row, onLeave }: { row: MatchRow; onLeave: () => void }) {
  if (row.kind === "dex") {
    const renamed = row.term.toLowerCase() !== row.entry.name.toLowerCase();
    return (
      <li className={styles.row} data-effect={row.effect}>
        <p className={styles.rowHead}>
          <span className={styles.term}>{row.term}</span>
          {renamed && (
            <span className={styles.as}>
              {" "}
              →{" "}
              <a href={dexHash(row.entry)} onClick={onLeave}>
                {row.entry.name}
              </a>
            </span>
          )}{" "}
          <span className={styles.effect}>
            {EFFECT_TEXT[row.effect]}
            {row.entry.status === "seen" && " (learned, not shipped)"}
          </span>
        </p>
        {row.entry.evidence[0] && <Proof evidence={row.entry.evidence[0]} onLeave={onLeave} />}
      </li>
    );
  }
  const first = row.closest[0];
  return (
    <li className={styles.row} data-effect="closest">
      <p className={styles.rowHead}>
        <span className={styles.term}>{row.term}</span> <span className={styles.effect}>{EFFECT_TEXT.closest}</span>{" "}
        {row.closest.map((entry, i) => (
          <span key={entry.id}>
            {i > 0 && ", "}
            <a href={dexHash(entry)} onClick={onLeave}>
              {entry.name}
            </a>
          </span>
        ))}
      </p>
      {first?.evidence[0] && <Proof evidence={first.evidence[0]} onLeave={onLeave} />}
    </li>
  );
}

function Group({ title, rows, onLeave }: { title: string; rows: MatchRow[]; onLeave: () => void }) {
  if (!rows.length) return null;
  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
      <ul className={styles.rows}>
        {rows.map((row) => (
          <Row key={`${row.kind}:${row.id}`} row={row} onLeave={onLeave} />
        ))}
      </ul>
    </section>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  /** The matchup the cards are ordered by now, if any (shown when reopened). */
  current: AppliedMatchup | null;
  onApply: (applied: AppliedMatchup) => void;
};

/**
 * TYPE MATCHUP: paste a job post, see each skill it asks for matched against
 * the Skill Dex with proof. Runs entirely in this browser: the post is never
 * sent anywhere or saved, and the shareable link holds skill ids only.
 */
export default function TypeMatchup({ open, onClose, projects, current, onApply }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  // Focus on open goes to whichever is showing: the textarea or the summary.
  const firstFocusRef = useRef<HTMLElement | null>(null);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState<Matchup | null>(null);
  // Until the visitor starts over, opening shows the matchup the cards are ordered by.
  const [showCurrent, setShowCurrent] = useState(true);
  const [copyFallback, setCopyFallback] = useState<string | null>(null);
  const { say } = useDialogue();
  const textId = useId();
  const privacyId = useId();
  const result = checked ?? (showCurrent ? current?.matchup ?? null : null);

  useDialogFocus(open, dialogRef, firstFocusRef);

  // When the cards' matchup is cleared, the next open starts from an empty post.
  const hadCurrent = useRef(!!current);
  useEffect(() => {
    if (hadCurrent.current && !current) {
      setChecked(null);
      setText("");
      setShowCurrent(true);
    }
    hadCurrent.current = !!current;
  }, [current]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  function check() {
    if (!text.trim()) return;
    playSound("/sounds/button.mp3");
    const m = matchPost(text);
    setChecked(m);
    setCopyFallback(null);
    say(summaryLine(m));
    // Analytics learns that a matchup ran, never what the post said.
    track("matchup_run", { skills: m.rows.length });
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  function show() {
    if (!result) return;
    playSound("/sounds/button.mp3");
    onApply(applyMatchup(result, projects));
    onClose();
  }

  async function copyLink() {
    if (!result) return;
    const url = `${window.location.origin}/?match=${applyMatchup(result, projects).link}#projects`;
    try {
      await navigator.clipboard.writeText(url);
      say("Matchup link copied! It holds skill names only, not the post.");
      setCopyFallback(null);
    } catch {
      setCopyFallback(url);
    }
  }

  function again() {
    setChecked(null);
    setShowCurrent(false);
    setText("");
    setCopyFallback(null);
    requestAnimationFrame(() => textRef.current?.focus());
  }

  const bySection = (section: Section) => result?.rows.filter((r) => r.section === section) ?? [];
  const years = result?.years;

  return createPortal(
    <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="matchup-title" className={styles.dialog}>
        <PixelPanel
          title="TYPE MATCHUP"
          titleAs="h2"
          titleId="matchup-title"
          titleAside={
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close type matchup">
              ×
            </button>
          }
          bodyClassName={styles.body}
        >
          {!result ? (
            <>
              <p className={styles.intro}>
                Paste a job post. Each skill it asks for is matched against my Skill Dex, with the proof.
              </p>
              <label htmlFor={textId} className={styles.label}>
                JOB POST
              </label>
              <textarea
                id={textId}
                ref={(el) => {
                  textRef.current = el;
                  firstFocusRef.current = el;
                }}
                className={styles.textarea}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={9}
                maxLength={20000}
                aria-describedby={privacyId}
                placeholder="Paste the requirements, or the whole post"
              />
              <p id={privacyId} className={styles.privacy}>
                Your job post stays in this browser: nothing is sent or saved. No AI, just matching words.
              </p>
              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={check} disabled={!text.trim()}>
                  Check matchup <span aria-hidden="true">▶</span>
                </button>
                <button type="button" className={styles.secondary} onClick={() => setText(SAMPLE_POST)}>
                  Try a sample post
                </button>
              </div>
            </>
          ) : (
            <>
              <p
                ref={(el) => {
                  summaryRef.current = el;
                  firstFocusRef.current = el;
                }}
                tabIndex={-1}
                className={styles.summary}
              >
                {summaryLine(result)}
              </p>

              {years && (
                <p className={styles.years} data-effect={years.has >= years.asked ? "super" : "closest"}>
                  <span className={styles.term}>{years.asked}+ years</span>{" "}
                  <span className={styles.effect}>
                    {years.has >= years.asked ? EFFECT_TEXT.super : EFFECT_TEXT.closest}
                  </span>{" "}
                  {years.has} years full-time at Fiserv since Sep 2023, plus side projects.
                </p>
              )}

              <Group title="REQUIRED" rows={bySection("required")} onLeave={onClose} />
              <Group title="NICE TO HAVE" rows={bySection("nice")} onLeave={onClose} />

              <p className={styles.note}>
                Only skills it recognizes are listed; read the post for the rest.
              </p>

              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={show}>
                  Show matching projects <span aria-hidden="true">▶</span>
                </button>
                <button type="button" className={styles.secondary} onClick={copyLink}>
                  Copy matchup link
                </button>
                <button type="button" className={styles.secondary} onClick={again}>
                  Check another post
                </button>
              </div>
              {copyFallback && (
                <p className={styles.fallback}>
                  Copy this link (skill names only):{" "}
                  <input readOnly value={copyFallback} onFocus={(e) => e.currentTarget.select()} aria-label="Matchup link" />
                </p>
              )}
            </>
          )}
        </PixelPanel>
      </div>
    </div>,
    document.body
  );
}
