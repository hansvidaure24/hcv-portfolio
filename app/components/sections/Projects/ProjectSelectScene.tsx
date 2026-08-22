"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import NextImage from "next/image";
import { CSSProperties, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../../../data/projects-data";
import Bag from "../../ui/Bag";
import PixelPanel from "../../ui/PixelPanel";
import PokeBall from "../../ui/PokeBall";
import { useScene } from "../../scene/SceneProvider";
import { playSound } from "../../../lib/sound";
import styles from "./Projects.module.scss";

const PAGE_SIZE = 3;

// Positions for the loose desktop arrangement around the bag.
const SCATTER_POSITIONS: CSSProperties[] = [
  { left: "-24%", bottom: "28%" },
  { left: "85%", bottom: "16%" },
  { left: "48%", bottom: "-6%", transform: "translateX(-50%)" },
];

const SCATTER_POSITIONS_MOBILE: CSSProperties[] = [
  { left: "2%", bottom: "30%" },
  { left: "62%", bottom: "14%" },
  { left: "32%", bottom: "-6%" },
];

export default function ProjectSelectScene({ projects }: { projects: Project[] }) {
  const reduceMotion = useReducedMotion();
  const scene = useScene();
  const [page, setPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const scatterPositions = isMobile ? SCATTER_POSITIONS_MOBILE : SCATTER_POSITIONS;
  const [selected, setSelected] = useState<number | null>(null);
  // On touch devices, the first tap previews a ball and the second opens it.
  const [armedIndex, setArmedIndex] = useState<number | null>(null);
  // Render the detail overlay at the document root so fixed positioning covers the viewport.
  const [portalReady, setPortalReady] = useState(false);
  useEffect(() => setPortalReady(true), []);

  const pageCount = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  const pageProjects = projects.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const activeProject = selected !== null ? projects[selected] : null;

  useEffect(() => {
    if (selected === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        playSound("/sounds/back.mp3");
        setSelected(null);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected]);

  // Lock background scrolling while the detail overlay is open.
  useEffect(() => {
    if (selected === null) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousTouchAction = body.style.touchAction;
    body.style.overflow = "hidden";
    body.style.touchAction = "none";

    // Prevent touch scrolling on browsers that ignore the body styles.
    function blockTouchScroll(e: TouchEvent) {
      e.preventDefault();
    }
    document.addEventListener("touchmove", blockTouchScroll, { passive: false });

    return () => {
      body.style.overflow = previousOverflow;
      body.style.touchAction = previousTouchAction;
      document.removeEventListener("touchmove", blockTouchScroll);
    };
  }, [selected]);

  // Clear the detail view when leaving the projects scene.
  useEffect(() => {
    if (scene && scene.activeId !== "projects") {
      setSelected(null);
      setArmedIndex(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.activeId]);

  function selectProject(index: number) {
    setArmedIndex(null);
    setSelected(index);
  }

  // Clear a touch preview when the user taps outside a pokeball.
  useEffect(() => {
    if (armedIndex === null) return;
    function handleOutsideClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-pokeball="true"]')) return;
      setArmedIndex(null);
    }
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [armedIndex]);

  return (
    <div className={styles.scene}>

      <div className={styles.cluster}>
        <Bag className={styles.bag} />
        {pageProjects.map((project, i) => {
          const globalIndex = page * PAGE_SIZE + i;
          return (
            <PokeBall
              key={project.title}
              label={project.title}
              onSelect={() => selectProject(globalIndex)}
              selected={selected === globalIndex}
              armed={armedIndex === globalIndex}
              onArm={() => setArmedIndex(globalIndex)}
              style={{
                position: "absolute",
                ...scatterPositions[i],
                "--wobble-delay": `${i * 0.7}s`,
              } as CSSProperties}
              size="lg"
              previewImage={project.image}
            />
          );
        })}
      </div>
      {pageCount > 1 && (
        <div className={styles.pager}>
          <button
            type="button"
            className={styles.pagerBtn}
            onClick={() => {
              playSound("/sounds/button.mp3");
              setArmedIndex(null);
              setPage((p) => (p === 0 ? pageCount - 1 : p - 1));
            }}
            aria-label="Previous projects"
          >
            ◀
          </button>
          <span className={styles.pagerLabel}>{page + 1} / {pageCount}</span>
          <button
            type="button"
            className={styles.pagerBtn}
            onClick={() => {
              playSound("/sounds/button.mp3");
              setArmedIndex(null);
              setPage((p) => (p === pageCount - 1 ? 0 : p + 1));
            }}
            aria-label="Next projects"
          >
            ▶
          </button>
        </div>
      )}

      {portalReady &&
        createPortal(
          <AnimatePresence>
            {activeProject && (
              <motion.div
                className={styles.overlay}
                role="dialog"
                aria-modal="true"
                aria-label={activeProject.title}
                onClick={() => {
                  playSound("/sounds/back.mp3");
                  setSelected(null);
                }}
                initial={reduceMotion ? false : { opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
                exit={reduceMotion ? undefined : { opacity: 0, backdropFilter: "blur(0px)" }}
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                >
                  <PixelPanel className={styles.detail} title={activeProject.title}>
                    <div className={styles.detailImage}>
                      {activeProject.video ? (
                        <video
                          key={activeProject.video}
                          src={activeProject.video}
                          className={styles.detailImageInner}
                          autoPlay
                          loop
                          muted
                          playsInline
                          disablePictureInPicture
                          disableRemotePlayback
                          controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                        />
                      ) : (
                        <NextImage
                          src={activeProject.image}
                          alt={activeProject.title}
                          fill
                          sizes="(max-width: 768px) 90vw, 480px"
                          className={styles.detailImageInner}
                        />
                      )}
                    </div>
                    <p className={styles.detailDescription}>{activeProject.description}</p>
                    <button
                      type="button"
                      className={styles.backBtn}
                      onClick={() => {
                        playSound("/sounds/back.mp3");
                        setSelected(null);
                      }}
                    >
                      Back
                    </button>
                  </PixelPanel>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
