"use client";
import { LayoutGroup, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ProjectCard from "./ProjectCard";
import type { AppliedMatchup } from "./matchupApply";
import { whenIdle } from "../../../lib/whenIdle";
import PixelPanel from "../../ui/PixelPanel";
import { useDialogue } from "../../providers/DialogueProvider";
import { useScene } from "../../scene/SceneProvider";
import { FOCUSES, FOCUS_STACK, FOCUS_STORAGE_KEY, type FocusId } from "../../../data/focus";
import type { Project } from "../../../data/projects";
import type { CiStatus } from "../../../lib/github";
import { DUR, steps } from "../../../lib/motion";
import { playSound } from "../../../lib/sound";
import { RESUME_URL } from "../../../lib/site";
import styles from "./Projects.module.scss";

const LAYOUT_TRANSITION = { layout: { duration: DUR.base, ease: steps(4) } };
// Restoring a saved pick on load places the cards without animating them.
const INSTANT_LAYOUT = { layout: { duration: 0 } };

// Type Matchup and its matcher aren't startup JavaScript: fetched when the
// page is idle, mounted on first open.
const loadTypeMatchup = () => import("./TypeMatchup");
const TypeMatchup = dynamic(loadTypeMatchup, { ssr: false });

function isFocus(value: string | null): value is FocusId {
  return FOCUSES.some((f) => f.id === value);
}

/** Most relevant first; ties keep the original order. "All" is the original order. */
function orderFor(projects: Project[], focus: FocusId): Project[] {
  if (focus === "all") return projects;
  return projects
    .map((project, index) => ({ project, index, score: project.focus?.[focus] ?? 0 }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.project);
}

/**
 * "Choose your focus" plus the project cards. The pick reorders the cards
 * (the top one gets the wide layout), highlights matching stack chips, and is
 * remembered for the next visit. "Paste a job post" (Type Matchup) orders
 * them for a job post instead, and a shared ?match= link does the same.
 */
export default function ProjectGrid({ projects, ci = {} }: { projects: Project[]; ci?: Record<string, CiStatus> }) {
  const [focus, setFocus] = useState<FocusId>("all");
  const [animateLayout, setAnimateLayout] = useState(false);
  const [matchup, setMatchup] = useState<AppliedMatchup | null>(null);
  const [matchupFromLink, setMatchupFromLink] = useState(false);
  const [matchupOpen, setMatchupOpen] = useState(false);
  const [matchupUsed, setMatchupUsed] = useState(false);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const matchupButtonRef = useRef<HTMLButtonElement>(null);
  const { say } = useDialogue();
  const scene = useScene();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FOCUS_STORAGE_KEY);
      if (isFocus(stored)) setFocus(stored);
    } catch {
      // Storage unavailable: start from "All".
    }
  }, []);

  // A shared matchup link (?match=csharp,aspnet,...) orders the cards for that post.
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("match");
    if (!value) return;
    import("./matchupApply").then(({ applyFromLink }) => {
      const applied = applyFromLink(value, projects);
      if (!applied) return;
      setMatchup(applied);
      setMatchupFromLink(true);
    });
  }, [projects]);

  useEffect(() => whenIdle(() => void loadTypeMatchup()), []);

  const closeMatchup = useCallback(() => setMatchupOpen(false), []);

  function openMatchup() {
    playSound("/sounds/button.mp3");
    setMatchupUsed(true);
    setMatchupOpen(true);
  }

  function applyMatchup(applied: AppliedMatchup) {
    setAnimateLayout(true);
    setMatchup(applied);
    setMatchupFromLink(false);
    say(`Matchup applied! ${applied.summary}`);
  }

  function clearMatchup() {
    playSound("/sounds/button.mp3");
    setAnimateLayout(true);
    setMatchup(null);
    setMatchupFromLink(false);
    // Drop ?match= from the address so a reload shows the normal order.
    const url = new URL(window.location.href);
    if (url.searchParams.has("match")) {
      url.searchParams.delete("match");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
    say("Matchup cleared. Back to your focus pick.");
    matchupButtonRef.current?.focus();
  }

  function choose(next: FocusId) {
    if (next === focus && !matchup) return;
    setAnimateLayout(true);
    setMatchup(null);
    setFocus(next);
    playSound("/sounds/menu-navigation.mp3", 0.5);
    say(FOCUSES.find((f) => f.id === next)!.said);
    try {
      if (next === "all") window.localStorage.removeItem(FOCUS_STORAGE_KEY);
      else window.localStorage.setItem(FOCUS_STORAGE_KEY, next);
    } catch {
      // Not remembered, but still applied.
    }
  }

  // Radio-group keys: arrows move the choice and the focus together.
  function onOptionKey(e: React.KeyboardEvent, index: number) {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const nextIndex = (index + delta + FOCUSES.length) % FOCUSES.length;
    choose(FOCUSES[nextIndex]!.id);
    optionRefs.current[nextIndex]?.focus();
  }

  const ordered = useMemo(() => {
    if (!matchup) return orderFor(projects, focus);
    const bySlug = new Map(projects.map((p) => [p.slug, p]));
    return matchup.order.map((slug) => bySlug.get(slug)).filter((p): p is Project => !!p);
  }, [projects, focus, matchup]);
  const highlight = matchup ? matchup.chips : focus === "all" ? [] : FOCUS_STACK[focus];
  // While a matchup orders the cards, no focus option is picked.
  const checked = (id: FocusId) => !matchup && focus === id;
  const [first, ...rest] = ordered;
  if (!first) return null;

  return (
    <>
      <div className={styles.focus}>
        <span id="focus-label" className={styles.focusLabel}>
          CHOOSE YOUR FOCUS
        </span>
        <div className={styles.focusOptions} role="radiogroup" aria-labelledby="focus-label">
          {FOCUSES.map((f, i) => (
            <button
              key={f.id}
              ref={(el) => {
                optionRefs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked(f.id)}
              tabIndex={checked(f.id) || (matchup && i === 0) ? 0 : -1}
              className={styles.focusOption}
              onClick={() => choose(f.id)}
              onKeyDown={(e) => onOptionKey(e, i)}
            >
              {f.label}
            </button>
          ))}
        </div>
        {/* Outside the radio group's options: it opens a panel, it isn't a pick. */}
        <button
          ref={matchupButtonRef}
          type="button"
          className={styles.matchupButton}
          aria-haspopup="dialog"
          onClick={openMatchup}
        >
          Paste a job post <span aria-hidden="true">▶</span>
        </button>
      </div>

      {matchup && (
        <PixelPanel
          title={matchupFromLink ? "MATCHUP FOR A SHARED JOB POST" : "ORDERED FOR YOUR JOB POST"}
          bodyClassName={styles.noteBody}
        >
          <p>
            {matchup.summary} Matching projects come first, and their matching skills are highlighted.
          </p>
          <div className={styles.noteLinks}>
            <button type="button" className={styles.noteLink} aria-haspopup="dialog" onClick={openMatchup}>
              View the matchup <span aria-hidden="true">▶</span>
            </button>
            <button type="button" className={styles.noteLink} onClick={clearMatchup}>
              Clear
            </button>
          </div>
        </PixelPanel>
      )}

      {matchupUsed && (
        <TypeMatchup
          open={matchupOpen}
          onClose={closeMatchup}
          projects={projects}
          current={matchup}
          onApply={applyMatchup}
        />
      )}

      {focus === "dotnet" && !matchup && (
        <PixelPanel title="MOST OF THIS WORK IS AT FISERV" bodyClassName={styles.noteBody}>
          <p>
            My day-to-day C#, ASP.NET and SQL work is on Fiserv&apos;s online banking platform, which isn&apos;t public:
            1,150+ Fortify findings remediated, 20 high-severity CVEs closed in one release across 17 projects, and
            thread-safety fixes across five banking cores.
          </p>
          <div className={styles.noteLinks}>
            <a
              href="#about"
              className={styles.noteLink}
              onClick={(e) => {
                if (!scene) return;
                e.preventDefault();
                scene.goTo("about", () => playSound("/sounds/button.mp3"));
              }}
            >
              Fiserv work <span aria-hidden="true">▼</span>
            </a>
            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className={styles.noteLink}>
              Resume (PDF) <span aria-hidden="true">↗</span>
            </a>
          </div>
        </PixelPanel>
      )}

      <LayoutGroup>
        <motion.div key={first.slug} layoutId={first.slug} transition={animateLayout ? LAYOUT_TRANSITION : INSTANT_LAYOUT} className={styles.cell}>
          <ProjectCard project={first} featured highlight={highlight} ci={ci[first.slug]} />
        </motion.div>
        {rest.length > 0 && (
          <div className={styles.grid}>
            {rest.map((project) => (
              <motion.div key={project.slug} layoutId={project.slug} transition={animateLayout ? LAYOUT_TRANSITION : INSTANT_LAYOUT} className={styles.cell}>
                <ProjectCard project={project} featured={false} highlight={highlight} ci={ci[project.slug]} />
              </motion.div>
            ))}
          </div>
        )}
      </LayoutGroup>
    </>
  );
}
