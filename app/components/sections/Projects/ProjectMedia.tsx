"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMotionSettings } from "../../providers/MotionPreferenceProvider";
import VideoToggle from "../../ui/VideoToggle";
import type { Project } from "../../../data/projects";
import styles from "./ProjectCard.module.scss";

type ProjectMediaProps = {
  title: string;
  cover: NonNullable<Project["cover"]>;
  video?: Project["video"];
  sizes: string;
  /** view-transition-name, so the card cover morphs into the case-study cover. */
  transitionName?: string;
  /** Load the cover eagerly at high priority (the case-study page, where it is above the fold). */
  priority?: boolean;
};

// Mosaic stages: tiny versions from Next's image optimizer, drawn as big
// pixels. All three widths are in Next's default `imageSizes`.
const MOSAIC_WIDTHS = [16, 32, 64] as const;
const MOSAIC_STEP_MS = 90;

function optimizedSrc(src: string, width: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

// Same breakpoint as the top bar ($bp-nav + $bp-step): phones and small
// tablets get tap-to-play.
const DESKTOP_QUERY = "(min-width: 47.5625em)";

/**
 * A project's cover and demo clip, with one rule for every card:
 * - The cover loads as a blocky mosaic and sharpens in four steps.
 * - Desktop: the demo plays muted and looped while on screen, downloading
 *   only once the card is first scrolled to.
 * - Phones and reduced motion: the cover stays, with a "Play demo" button.
 */
export default function ProjectMedia({ title, cover, video, sizes, transitionName, priority = false }: ProjectMediaProps) {
  const { reduced } = useMotionSettings();
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stage, setStage] = useState(0);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [desktop, setDesktop] = useState(false);
  const [seen, setSeen] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [clickedPlay, setClickedPlay] = useState(false);
  const [paused, setPaused] = useState(false);
  // The observer reads this without being recreated when it changes.
  const pausedRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    setDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Sharpen the mosaic once the full cover has loaded.
  useEffect(() => {
    if (!coverLoaded) return;
    if (reduced) {
      setStage(MOSAIC_WIDTHS.length);
      return;
    }
    const timer = window.setInterval(() => {
      setStage((s) => {
        if (s >= MOSAIC_WIDTHS.length) {
          window.clearInterval(timer);
          return s;
        }
        return s + 1;
      });
    }, MOSAIC_STEP_MS);
    return () => window.clearInterval(timer);
  }, [coverLoaded, reduced]);

  const autoplay = Boolean(video) && desktop && !reduced;

  // Desktop: start downloading when the card first nears the screen, then
  // play only while it's on screen.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !autoplay) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setSeen(true);
          if (!pausedRef.current) videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoplay]);

  const showVideo = video && ((autoplay && seen) || clickedPlay);
  const mosaicDone = stage >= MOSAIC_WIDTHS.length;

  function togglePlayback() {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (next) videoRef.current?.pause();
    else videoRef.current?.play().catch(() => {});
  }

  return (
    <div ref={rootRef} className={styles.media} style={transitionName ? { viewTransitionName: transitionName } : undefined}>
      <Image
        // A cached cover can finish loading before React attaches onLoad, so
        // also check `complete` when the element mounts.
        ref={(img) => {
          if (img?.complete && img.naturalWidth > 0) setCoverLoaded(true);
        }}
        src={cover.src}
        alt={cover.alt}
        fill
        sizes={sizes}
        className={styles.mediaInner}
        priority={priority}
        // `priority` alone only preloads it; this also puts it ahead of the
        // scripts, which made it the case-study page's slowest paint (3s on
        // Lighthouse's mobile run).
        fetchPriority={priority ? "high" : undefined}
        onLoad={() => setCoverLoaded(true)}
      />

      {!mosaicDone &&
        MOSAIC_WIDTHS.map((w, i) => (
          // Deliberately tiny, unoptimized-looking images: next/image would smooth them.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={w}
            src={optimizedSrc(cover.src, w)}
            alt=""
            aria-hidden="true"
            // Decoration: load with the card, not with the page (15 requests at startup before).
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={styles.mosaic}
            style={{ visibility: i === stage ? "visible" : "hidden" }}
          />
        ))}

      {showVideo && (
        <video
          ref={videoRef}
          src={video.src}
          className={`${styles.mediaInner} ${styles.videoLayer} ${videoReady ? styles.videoReady : ""}`}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          controls={clickedPlay}
          onPlaying={() => setVideoReady(true)}
          aria-label={`${title} demo video`}
          disablePictureInPicture
        />
      )}

      {showVideo && autoplay && !clickedPlay && (
        <VideoToggle paused={paused} label={`${title} demo`} onToggle={togglePlayback} />
      )}

      {video && !autoplay && !clickedPlay && (
        <button type="button" className={styles.playBtn} onClick={() => setClickedPlay(true)}>
          <span aria-hidden="true">▶</span> Play demo
        </button>
      )}
    </div>
  );
}
