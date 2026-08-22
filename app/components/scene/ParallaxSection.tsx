"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useScene } from "./SceneProvider";
import styles from "./ParallaxSection.module.scss";

type ParallaxSectionProps = {
  id: string;
  bgClassName?: string;
  contentClassName?: string;
  /** Rendered as a section-level sibling to the centered content, positioned relative to
   * the section itself rather than the centered flex content (e.g. a corner-pinned sign). */
  overlay?: ReactNode;
  children: ReactNode;
};

const contentVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const CONTENT_TRANSITION = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };

export default function ParallaxSection({ id, bgClassName = "", contentClassName = "", overlay, children }: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const scene = useScene();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  // On desktop, SceneProvider/SceneStage lock scroll and toggle each section's visibility
  // directly, so the entrance has to replay on every activation (driven by `activeId`)
  // rather than the natural-scroll `whileInView` used when sections flow freely (mobile).
  const isLockedMode = scene?.isDesktop ?? false;
  const isActive = isLockedMode ? scene?.activeId === id : true;

  return (
    <section id={id} ref={sectionRef} className={styles.section}>
      {reduceMotion ? (
        <div aria-hidden="true" className={`${styles.bgLayer} ${bgClassName}`} />
      ) : (
        <motion.div aria-hidden="true" className={`${styles.bgLayer} ${bgClassName}`} style={{ y: bgY }} />
      )}

      {reduceMotion ? (
        <div className={`${styles.content} ${contentClassName}`}>{children}</div>
      ) : isLockedMode ? (
        <motion.div
          className={`${styles.content} ${contentClassName}`}
          variants={contentVariants}
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          transition={CONTENT_TRANSITION}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          className={`${styles.content} ${contentClassName}`}
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={CONTENT_TRANSITION}
        >
          {children}
        </motion.div>
      )}

      {overlay}
    </section>
  );
}
