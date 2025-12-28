"use client";
import React, { useState, useEffect } from "react";

import styles from "../app/scss/Hero.module.scss";

export default function Hero() {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [tvVisible, setTvVisible] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = "/backgrounds/bg-hero.jpg";
    img.onload = () => setBgLoaded(true);

    setTimeout(() => setTvVisible(true), 100);

    setTimeout(() => {
      setTitleVisible(true);
      setSubtitleVisible(true);
    }, 1100);
  }, []);

  return (
    <section
      id="hero"
      className={styles.hero + (bgLoaded ? " " + styles.bgLoaded : "")}
    >
      <div className={styles.trailer}>
      <h1 className={styles.title + (titleVisible ? ' ' + styles.titleVisible : '')}>HANS</h1>
      <div className={styles.tvContainer + (tvVisible ? ' ' + styles.tvContainerVisible : '')}>
        <div className={styles.tvFrame}>
          <video
            className={styles.tvVideo}
            src="/videos/hero-video.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className={styles.tvGlass} />
        </div>
      </div>
      <p className={styles.subtitle + (subtitleVisible ? ' ' + styles.subtitleVisible : '')}>Crafting seamless digital experiences with code and creativity.</p>
      </div>
    </section>
  );
}