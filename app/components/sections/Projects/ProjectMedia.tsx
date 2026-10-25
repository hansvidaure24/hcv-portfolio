"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useMotionSettings } from "../../providers/MotionPreferenceProvider";
import type { Project } from "../../../data/projects";
import styles from "./ProjectCard.module.scss";

type ProjectMediaProps = {
  title: string;
  cover: NonNullable<Project["cover"]>;
  video?: Project["video"];
  sizes: string;
};

/**
 * The cover image, upgraded to a video when the project has one. Small clips
 * autoplay muted while on screen; large ones download only after a click.
 */
export default function ProjectMedia({ title, cover, video, sizes }: ProjectMediaProps) {
  const { reduced } = useMotionSettings();
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoplay = Boolean(video?.autoplay) && !reduced;

  // Pause autoplaying clips while they're off screen.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !autoplay) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoplay]);

  if (video && (autoplay || playing)) {
    return (
      <div className={styles.media}>
        <video
          ref={videoRef}
          src={video.src}
          poster={cover.src}
          className={styles.mediaInner}
          muted
          loop
          playsInline
          autoPlay={playing}
          preload={autoplay ? "auto" : "none"}
          controls={playing}
          aria-label={`${title} demo video`}
          disablePictureInPicture
        />
      </div>
    );
  }

  return (
    <div className={styles.media}>
      <Image src={cover.src} alt={cover.alt} fill sizes={sizes} className={styles.mediaInner} />
      {video && (
        <button type="button" className={styles.playBtn} onClick={() => setPlaying(true)}>
          <span aria-hidden="true">▶</span> Play demo
        </button>
      )}
    </div>
  );
}
