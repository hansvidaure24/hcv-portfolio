"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import ParallaxSection from "../../scene/ParallaxSection";
import { useScene } from "../../scene/sceneContext";
import { playSound } from "../../../lib/sound";
import { CONTACT_EMAIL, RESUME_URL } from "../../../lib/site";
import { useDialogue } from "../../providers/DialogueProvider";
import PixelIcon from "../../ui/PixelIcon";
import styles from "./Hero.module.scss";

// Browser-only and loaded after the page, so the hero's text paints first.
// Until it's ready (or without JavaScript) the field's plain grass shows
// instead: the same color, edges and tint, so loading only adds the life.
const HeroField = dynamic(() => import("./field/HeroField"), { ssr: false });

const TILE_COLS = 10;
const TILE_ROWS = 6;

const introTiles = Array.from({ length: TILE_COLS * TILE_ROWS }, (_, i) => {
  const col = i % TILE_COLS;
  const row = Math.floor(i / TILE_COLS);
  const delay = (col + row) * 0.018; // same diagonal timing as the section-jump wipe
  return { key: i, delay };
});
// The intro tiles are gone by about 0.4s; they leave the page after this,
// whatever happened to their animation.
const INTRO_MS = 1000;

export default function Hero() {
  const scene = useScene();
  const { say } = useDialogue();
  const emailRef = useRef<HTMLAnchorElement>(null);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), INTRO_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // The hero's looping CSS animations (the scan line, the blinking cursor)
  // pause while it's off screen, so the rest of the page costs no animation
  // work (globals.scss, #hero[data-offscreen]). The field pauses itself.
  useEffect(() => {
    const section = document.getElementById("hero");
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      section.toggleAttribute("data-offscreen", !entry?.isIntersecting);
    });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  async function copyEmail() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      ok = true;
    } catch {
      // The async clipboard API can be blocked (permissions, embedded browsers).
      // Fall back to selecting the address, which also leaves it ready for Ctrl+C.
      const el = emailRef.current;
      const selection = window.getSelection();
      if (el && selection) {
        const range = document.createRange();
        range.selectNodeContents(el);
        selection.removeAllRanges();
        selection.addRange(range);
        ok = document.execCommand("copy");
      }
    }
    if (!ok) {
      // The fallback still left the address selected, so say how to finish.
      say("Your browser blocked copying. The email is selected: press Ctrl+C (or ⌘C) to copy it.");
      return;
    }
    playSound("/sounds/button.mp3");
    say("Hans's email was copied to your clipboard!");
  }

  return (
    <ParallaxSection
      id="hero"
      reveal={false}
      bgClassName={styles.heroBg}
      contentClassName={styles.heroContent}
      overlay={
        <>
        <div className={styles.fieldFallback} aria-hidden="true" />
        <HeroField />
        {!introDone && (
          // data-intro: one-shot, so never paused off screen (globals.scss).
          <div className={styles.introTiles} data-intro="tiles" aria-hidden="true">
            {introTiles.map(({ key, delay }) => (
              <span key={key} className={styles.tile} style={{ animationDelay: `${delay}s` }} />
            ))}
          </div>
        )}

        </>
      }
    >
      <div className={styles.heroGrid}>
        <div className={styles.heroText} data-field-avoid="">
          <p className={`${styles.statusChip} ${styles.reveal1}`} data-intro="">
            <span className={styles.statusDot} aria-hidden="true" />
            {/* Where it wraps (phones), it breaks after the dot: the place stays whole. */}
            <span>
              Open to full-stack roles&nbsp;· <span className={styles.nowrap}>NYC / remote</span>
            </span>
          </p>
          <div className={styles.nameRow}>
            {/* Phones only: a small framed portrait beside the name, in place of
                the photo frame, so the pitch and the buttons fit the first screen. */}
            <span className={styles.avatar}>
              <Image src="/graphics/hero-photo.jpg" alt="Photo of Hans Vidaure" fill sizes="64px" className={styles.avatarImage} />
            </span>
            <h1 className={styles.title}>HANS VIDAURE</h1>
          </div>
          <p className={styles.role}>
            Full-Stack Software Engineer
            <span className={styles.roleStack}>C# / .NET · React · SQL · Unity</span>
          </p>
          {/* Who he is now, then what he does on the side: two sentences, no list
              (the projects have their own section just below). Facts from the
              resume (app/data/resume.ts); Fiserv's are general responsibilities. */}
          <div className={styles.summary}>
            <p>3 years at Fiserv shipping online banking features from API to UI, through review, testing and production support.</p>
            <p>
              On the side I build games and the tools behind them:{" "}
              <Link href="/projects/pocket-quest">Pocket Quest</Link>, a co-op RPG you play with your phone, and a{" "}
              <Link href="/projects/behavior-tree-editor">visual game-AI editor</Link> that runs inside a Unity game.
            </p>
          </div>
          <div className={`${styles.ctaRow} ${styles.reveal3}`} data-intro="">
            <a
              href="#experience"
              className={styles.primaryCta}
              onClick={(e) => {
                if (!scene) return;
                e.preventDefault();
                // Play the sound only when navigation actually starts.
                scene.goTo("experience", () => playSound("/sounds/press-start.mp3"));
              }}
            >
              See my work <span className={styles.ctaCursor} aria-hidden="true">▶</span>
            </a>
            <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className={styles.secondaryCta}>
              Resume (PDF)
            </a>
          </div>
          <div className={`${styles.emailRow} ${styles.reveal3}`} data-intro="">
            <a ref={emailRef} href={`mailto:${CONTACT_EMAIL}`} className={styles.email}>
              {CONTACT_EMAIL}
            </a>
            <button
              type="button"
              className={styles.copyBtn}
              data-track="email_copy"
              aria-label="Copy email"
              title="Copy email"
              onClick={copyEmail}
            >
              <PixelIcon name="copy" size={16} />
            </button>
          </div>
        </div>

        <div className={`${styles.heroPhoto} ${styles.reveal2}`} data-field-avoid="" data-intro="">
          {/* The photo in a frame built like the site's own panels: cream with
              an ink border and a gold title bar, the photo on a screen with a
              scan line passing over it. Original, in place of the borrowed
              Pokédex shape it replaced. */}
          <div className={styles.photoFrame}>
            <div className={styles.photoBar} aria-hidden="true">
              PLAYER 1
              <span className={styles.photoLights}>
                <span />
                <span />
                <span />
              </span>
            </div>
            <div className={styles.photoScreen}>
              <Image
                src="/graphics/hero-photo.jpg"
                alt="Photo of Hans Vidaure"
                fill
                sizes="(max-width: 900px) 55vw, 340px"
                style={{ objectFit: "cover" }}
                priority
              />
              <span className={styles.scanLine} aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </ParallaxSection>
  );
}
