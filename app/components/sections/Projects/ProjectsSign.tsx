"use client";
import { motion, useReducedMotion } from "framer-motion";
import { useScene } from "../../scene/SceneProvider";
import styles from "./ProjectsSign.module.scss";

const signVariants = {
  hidden: { y: "-140%" },
  visible: { y: "0%" },
};

const SIGN_TRANSITION = { duration: 0.6, ease: [0.34, 1.15, 0.64, 1] as const };

export default function ProjectsSign() {
  const reduceMotion = useReducedMotion();
  const scene = useScene();

  // Mirrors ParallaxSection's dual-mode entrance: on desktop the section is locked/toggled
  // via SceneProvider (replay on every activation), on mobile it's driven by natural scroll.
  const isLockedMode = scene?.isDesktop ?? false;
  const isActive = isLockedMode ? scene?.activeId === "projects" : true;

  if (reduceMotion) {
    return (
      <div className={styles.sign}>
        <h2 className={styles.signText}>Projects</h2>
      </div>
    );
  }

  if (isLockedMode) {
    return (
      <motion.div
        className={styles.sign}
        variants={signVariants}
        initial="hidden"
        animate={isActive ? "visible" : "hidden"}
        transition={SIGN_TRANSITION}
      >
        <h2 className={styles.signText}>Projects</h2>
      </motion.div>
    );
  }

  // Mount-triggered animation works reliably in the natural-scroll layout.
  return (
    <motion.div
      className={styles.sign}
      initial={{ y: "-140%" }}
      animate={{ y: "0%" }}
      transition={SIGN_TRANSITION}
    >
      <h1 className={styles.signText}>Projects</h1>
    </motion.div>
  );
}
