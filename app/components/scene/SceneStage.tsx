"use client";
import { Fragment, ReactNode } from "react";
import { useScene } from "./SceneProvider";
import styles from "./SceneStage.module.scss";

type Scene = { id: string; node: ReactNode };

export default function SceneStage({ sections }: { sections: Scene[] }) {
  const scene = useScene();
  const isDesktop = scene?.isDesktop ?? false;

  if (!isDesktop) {
    return (
      <>
        {sections.map((s) => (
          <Fragment key={s.id}>{s.node}</Fragment>
        ))}
      </>
    );
  }

  return (
    <div className={styles.stage}>
      {sections.map((s, i) => (
        <div
          key={s.id}
          data-slide={s.id}
            className={`${styles.slide} ${scene?.activeIndex === i ? styles.activeSlide : styles.inactiveSlide}`}
            style={{ visibility: scene?.activeIndex === i ? "visible" : "hidden" }}
        >
          {s.node}
        </div>
      ))}
    </div>
  );
}
