"use client";
import { LayoutGroup, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import ProjectCard from "./ProjectCard";
import PixelPanel from "../../ui/PixelPanel";
import { useDialogue } from "../../providers/DialogueProvider";
import { useScene } from "../../scene/SceneProvider";
import { FOCUSES, FOCUS_STACK, FOCUS_STORAGE_KEY, type FocusId } from "../../../data/focus";
import type { Project } from "../../../data/projects";
import { DUR, steps } from "../../../lib/motion";
import { playSound } from "../../../lib/sound";
import { RESUME_URL } from "../../../lib/site";
import styles from "./Projects.module.scss";

const LAYOUT_TRANSITION = { layout: { duration: DUR.base, ease: steps(4) } };
// Restoring a saved pick on load places the cards without animating them.
const INSTANT_LAYOUT = { layout: { duration: 0 } };

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
 * remembered for the next visit.
 */
export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const [focus, setFocus] = useState<FocusId>("all");
  const [animateLayout, setAnimateLayout] = useState(false);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
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

  function choose(next: FocusId) {
    if (next === focus) return;
    setAnimateLayout(true);
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

  const ordered = useMemo(() => orderFor(projects, focus), [projects, focus]);
  const highlight = focus === "all" ? [] : FOCUS_STACK[focus];
  const [first, ...rest] = ordered;
  if (!first) return null;

  return (
    <>
      <div className={styles.focus} role="radiogroup" aria-labelledby="focus-label">
        <span id="focus-label" className={styles.focusLabel}>
          CHOOSE YOUR FOCUS
        </span>
        <div className={styles.focusOptions}>
          {FOCUSES.map((f, i) => (
            <button
              key={f.id}
              ref={(el) => {
                optionRefs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={focus === f.id}
              tabIndex={focus === f.id ? 0 : -1}
              className={styles.focusOption}
              onClick={() => choose(f.id)}
              onKeyDown={(e) => onOptionKey(e, i)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {focus === "dotnet" && (
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
          <ProjectCard project={first} featured highlight={highlight} />
        </motion.div>
        {rest.length > 0 && (
          <div className={styles.grid}>
            {rest.map((project) => (
              <motion.div key={project.slug} layoutId={project.slug} transition={animateLayout ? LAYOUT_TRANSITION : INSTANT_LAYOUT} className={styles.cell}>
                <ProjectCard project={project} featured={false} highlight={highlight} />
              </motion.div>
            ))}
          </div>
        )}
      </LayoutGroup>
    </>
  );
}
