"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef, useState } from "react";
import { useScene } from "./SceneProvider";
import { useTextSpeed } from "../../lib/preferences";
import { useMotionSettings } from "../providers/MotionPreferenceProvider";
import { DUR, EASE_OUT } from "../../lib/motion";
import styles from "./ParallaxSection.module.scss";

type ParallaxSectionProps = {
  id: string;
  bgClassName?: string;
  /** Drawn inside the background layer, so it slides with it (a painted backdrop). */
  background?: ReactNode;
  contentClassName?: string;
  /** Rendered as a section-level sibling to the centered content, positioned relative to
   * the section itself rather than the centered flex content (e.g. a corner-pinned sign). */
  overlay?: ReactNode;
  /** Fade the content in when it scrolls into view. The hero turns this off so its
   * text is visible on first paint instead of waiting for JavaScript. */
  reveal?: boolean;
  children: ReactNode;
};

const CONTENT_TRANSITION = { duration: DUR.scene, ease: EASE_OUT };

export default function ParallaxSection({
  id,
  bgClassName = "",
  background,
  contentClassName = "",
  overlay,
  reveal = true,
  children,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // The site's own setting (which can override the OS), not just prefers-reduced-motion.
  const { reduced: reduceMotion } = useMotionSettings();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const scene = useScene();
  // Text speed "Fast" skips the fade-ins too: the content is simply there.
  const textFast = useTextSpeed() === "fast";
  const [shown, setShown] = useState(false);
  const [landedByJump, setLandedByJump] = useState(false);

  return (
    <section id={id} ref={sectionRef} className={styles.section}>
      {reduceMotion ? (
        <div aria-hidden="true" className={`${styles.bgLayer} ${bgClassName}`}>
          {background}
        </div>
      ) : (
        <motion.div aria-hidden="true" className={`${styles.bgLayer} ${bgClassName}`} style={{ y: bgY }}>
          {background}
        </motion.div>
      )}

      {reduceMotion || textFast || !reveal ? (
        <div className={`${styles.content} ${contentClassName}`}>{children}</div>
      ) : (
        <motion.div
          // Starts invisible for the fade-in; layout.tsx's <noscript> style
          // shows it at once when JavaScript is off.
          data-reveal=""
          className={`${styles.content} ${contentClassName}`}
          variants={{
            hidden: { opacity: 0, y: 32 },
            shown: { opacity: 1, y: 0, transition: landedByJump ? { duration: 0 } : CONTENT_TRANSITION },
          }}
          initial="hidden"
          animate={shown ? "shown" : "hidden"}
          viewport={{ once: true, amount: 0.15 }}
          onViewportEnter={() => {
            if (shown) return;
            // A section reached through the tile wipe is already "revealed" by
            // the wipe, so it appears in place instead of fading in a second time.
            setLandedByJump(scene?.jumpTargetRef.current === id);
            setShown(true);
          }}
        >
          {children}
        </motion.div>
      )}

      {overlay}
    </section>
  );
}
