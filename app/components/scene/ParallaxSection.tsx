"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useMotionSettings } from "../providers/MotionPreferenceProvider";
import styles from "./ParallaxSection.module.scss";

type ParallaxSectionProps = {
  id: string;
  bgClassName?: string;
  contentClassName?: string;
  /** Rendered as a section-level sibling to the centered content, positioned relative to
   * the section itself rather than the centered flex content (e.g. a corner-pinned sign). */
  overlay?: ReactNode;
  /** Fade the content in when it scrolls into view. The hero turns this off so its
   * text is visible on first paint instead of waiting for JavaScript. */
  reveal?: boolean;
  children: ReactNode;
};

const CONTENT_TRANSITION = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

export default function ParallaxSection({
  id,
  bgClassName = "",
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

  return (
    <section id={id} ref={sectionRef} className={styles.section}>
      {reduceMotion ? (
        <div aria-hidden="true" className={`${styles.bgLayer} ${bgClassName}`} />
      ) : (
        <motion.div aria-hidden="true" className={`${styles.bgLayer} ${bgClassName}`} style={{ y: bgY }} />
      )}

      {reduceMotion || !reveal ? (
        <div className={`${styles.content} ${contentClassName}`}>{children}</div>
      ) : (
        <motion.div
          className={`${styles.content} ${contentClassName}`}
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={CONTENT_TRANSITION}
        >
          {children}
        </motion.div>
      )}

      {overlay}
    </section>
  );
}
