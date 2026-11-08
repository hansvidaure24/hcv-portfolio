"use client";
import { useEffect, useRef, useState } from "react";
import { useMotionSettings } from "../providers/MotionPreferenceProvider";
import VideoToggle from "./VideoToggle";

type LazyVideoProps = {
  src: string;
  poster: string;
  className?: string;
};

/**
 * A muted, looping decorative clip that shows its poster first and only
 * downloads once it's near the viewport. It pauses off screen, and with
 * reduced motion it stays on the poster. Its frame must be positioned, for
 * the pause button.
 */
export default function LazyVideo({ src, poster, className }: LazyVideoProps) {
  const { reduced } = useMotionSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [nearView, setNearView] = useState(false);
  const [paused, setPaused] = useState(false);
  // The observer reads this without being recreated when it changes.
  const pausedRef = useRef(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearView(true);
          if (!pausedRef.current) el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  // Start playback once the source is attached after first coming into view.
  useEffect(() => {
    if (nearView && !reduced && !pausedRef.current) videoRef.current?.play().catch(() => {});
  }, [nearView, reduced]);

  function toggle() {
    const next = !pausedRef.current;
    pausedRef.current = next;
    setPaused(next);
    if (next) videoRef.current?.pause();
    else videoRef.current?.play().catch(() => {});
  }

  return (
    <>
      <video
        ref={videoRef}
        src={nearView && !reduced ? src : undefined}
        poster={poster}
        className={className}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        disablePictureInPicture
        disableRemotePlayback
      />
      {nearView && !reduced && <VideoToggle paused={paused} label="background clip" onToggle={toggle} />}
    </>
  );
}
