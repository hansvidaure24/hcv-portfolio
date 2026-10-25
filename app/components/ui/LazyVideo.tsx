"use client";
import { useEffect, useRef, useState } from "react";
import { useMotionSettings } from "../providers/MotionPreferenceProvider";

type LazyVideoProps = {
  src: string;
  poster: string;
  className?: string;
};

/**
 * A muted, looping decorative clip that shows its poster first and only
 * downloads once it's near the viewport. It pauses off screen, and with
 * reduced motion it stays on the poster.
 */
export default function LazyVideo({ src, poster, className }: LazyVideoProps) {
  const { reduced } = useMotionSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [nearView, setNearView] = useState(false);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || reduced) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearView(true);
          el.play().catch(() => {});
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
    if (nearView && !reduced) videoRef.current?.play().catch(() => {});
  }, [nearView, reduced]);

  return (
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
  );
}
