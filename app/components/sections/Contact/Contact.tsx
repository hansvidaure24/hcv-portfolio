"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ParallaxSection from "../../scene/ParallaxSection";
import { useScene } from "../../scene/SceneProvider";
import { getFirstGesturePromise, isSoundEnabled, playSound } from "../../../lib/sound";
import { getEffectiveReducedMotion } from "../../../lib/motionPreference";
import { getTextSpeed } from "../../../lib/preferences";
import { useContactDialog } from "../../providers/ContactDialogProvider";
import { CONTACT_EMAIL, RESUME_URL } from "../../../lib/site";
import PixelPanel from "../../ui/PixelPanel";
import SectionHeading from "../../ui/SectionHeading";
import styles from "./Contact.module.scss";

export const Socials = {
  links: [
    {
      name: 'GitHub',
      url: 'https://github.com/hansvidaure24',
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/hans-chandler-vidaure/',
    },
  ],
}

type Skill = {
  name: string;
  icon: string;
};

const TYPING_MESSAGE = "Hiring for a full-stack role? Let's talk.";
// 41 characters in about 1.3s; a click finishes the line at once.
const TYPING_INTERVAL_MS = 32;

const SKILLS: Skill[] = [
  { name: 'Full-Stack Development', icon: '/icons/icon-fullstack.svg' },
  { name: '.NET APIs', icon: '/icons/icon-api.svg' },
  { name: 'React UI', icon: '/icons/icon-ui.svg' },
  { name: 'Application Security', icon: '/icons/icon-appsecurity.svg' },
];

export default function Contact() {
  const { openDialog } = useContactDialog();
  const currentYear = new Date().getFullYear();
  const scene = useScene();
  const [typingActive, setTypingActive] = useState(false);
  const [typedLength, setTypedLength] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const typingRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const typingDoneRef = useRef(false);
  // Decode the typing sound once so playback starts with the text.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const typeBufferRef = useRef<AudioBuffer | null>(null);
  // Keep the active decode promise so late callers can wait for it.
  const typeBufferPromiseRef = useRef<Promise<AudioBuffer> | null>(null);
  // Store the cleanup function for whichever playback path is active.
  const stopTypeSoundRef = useRef<(() => void) | null>(null);

  // Create the audio context and decode the clip once, the first time sound is wanted.
  function prepareTypeSound() {
    if (audioCtxRef.current) return;
    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;

    const ctx = new AudioContextCtor();
    audioCtxRef.current = ctx;

    const decodePromise = fetch("/sounds/type.mp3")
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer));
    typeBufferPromiseRef.current = decodePromise;
    decodePromise
      .then((buffer) => {
        typeBufferRef.current = buffer;
      })
      .catch(() => {});
  }

  // With sound on, decode early so the clip is ready when typing begins. With
  // sound off (the default) nothing downloads until the visitor turns it on.
  useEffect(() => {
    if (isSoundEnabled()) prepareTypeSound();
    return () => {
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
      typeBufferRef.current = null;
      typeBufferPromiseRef.current = null;
    };
  }, []);

  // Wait until the audio context and buffer are ready without starting playback.
  async function ensureAudioReady(): Promise<{ ctx: AudioContext; buffer: AudioBuffer } | null> {
    prepareTypeSound();
    const ctx = audioCtxRef.current;
    if (!ctx) return null;

    // Browsers only allow AudioContext.resume() after a user gesture.
    if (ctx.state === "suspended") {
      await getFirstGesturePromise();
      try {
        await ctx.resume();
      } catch {
        return null;
      }
    }

    // Wait for an in-flight decode when the buffer is not ready yet.
    let buffer = typeBufferRef.current;
    if (!buffer && typeBufferPromiseRef.current) {
      try {
        buffer = await typeBufferPromiseRef.current;
      } catch {
        buffer = null;
      }
    }
    if (!buffer) return null;

    return { ctx, buffer };
  }

  function beginTypeSoundPlayback(ctx: AudioContext, buffer: AudioBuffer) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    // Once the clip finishes on its own, drop the stale stop-handle so a
    // later stopTypeSound() call (e.g. leaving the section) doesn't try to
    // stop an already-finished source.
    source.onended = () => {
      if (stopTypeSoundRef.current === stopThisSource) stopTypeSoundRef.current = null;
    };
    function stopThisSource() {
      try {
        source.stop();
      } catch {
        // The source may already have ended.
      }
    }
    stopTypeSoundRef.current = stopThisSource;
  }

  function stopTypeSound() {
    stopTypeSoundRef.current?.();
    stopTypeSoundRef.current = null;
  }

  // Start typing when Contact becomes the active scene.
  async function activateTyping() {
    setTypingActive(true);

    // Reduced motion and text speed "Fast" both show the whole line at once.
    if (getEffectiveReducedMotion() || getTextSpeed() === "fast") {
      typingDoneRef.current = true;
      setTypedLength(TYPING_MESSAGE.length);
      setTypingDone(true);
      return;
    }

    // Start the visual effect independently of audio permissions.
    let i = 0;
    typingIntervalRef.current = setInterval(() => {
      i += 1;
      setTypedLength(i);
      if (i >= TYPING_MESSAGE.length) finishTyping();
    }, TYPING_INTERVAL_MS);

    // The typewriter still runs when sound is disabled.
    if (!isSoundEnabled()) return;

    // Start audio when the browser allows it without blocking the text effect.
    const ready = await ensureAudioReady();
    // The line may already be done by the time audio is allowed to start.
    if (typingDoneRef.current) return;

    if (ready) {
      beginTypeSoundPlayback(ready.ctx, ready.buffer);
    } else {
      // Fall back to HTML audio if Web Audio is unavailable.
      const audio = new Audio("/sounds/type.mp3");
      audio.play().catch(() => {});
      stopTypeSoundRef.current = () => audio.pause();
    }
  }

  // End the typewriter now: full line, caret blinking, and the clack sound stops with it.
  function finishTyping() {
    if (typingDoneRef.current) return;
    typingDoneRef.current = true;
    clearInterval(typingIntervalRef.current);
    setTypedLength(TYPING_MESSAGE.length);
    setTypingDone(true);
    stopTypeSound();
  }

  useEffect(() => () => clearInterval(typingIntervalRef.current), []);

  // Stop the clip when the user leaves Contact.
  useEffect(() => {
    if (scene && scene.activeId !== "contact") {
      stopTypeSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.activeId]);

  useEffect(() => {
    if (typingActive) return;

    const el = typingRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          activateTyping();
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typingActive]);

  return (
    <ParallaxSection
      id="contact"
      bgClassName={styles.contactBg}
      contentClassName={styles.contactContent}
    >
      <div className={styles.contactScene}>
        <SectionHeading>Contact</SectionHeading>

        <div ref={typingRef} className={styles.typingWrap} onClick={finishTyping}>
          {/* The full line reserves its space so the card doesn't jump while it types. */}
          <span className={styles.typingGhost} aria-hidden="true">{TYPING_MESSAGE}</span>
          <span className={`${styles.typingText}${typingDone ? ' ' + styles.typingBlink : ''}`}>
            {TYPING_MESSAGE.slice(0, typedLength)}
          </span>
        </div>

        <PixelPanel
          title="Contact card"
          titleAside={`ID No. ${currentYear}`}
          className={styles.trainerCard}
          bodyClassName={styles.cardBody}
        >
          <div className={styles.cardInfo}>
            <p className={styles.cardName}>NAME: Hans Vidaure</p>

            <div className={styles.cardStatRow}>
              <span className={styles.cardStatLabel}>STATUS</span>
              <span className={styles.cardStatValue}>Open to full-stack roles · NYC / remote</span>
            </div>

            <div className={styles.cardStatRow}>
              <span className={styles.cardStatLabel}>EMAIL</span>
              <a href={`mailto:${CONTACT_EMAIL}`} className={`${styles.cardStatValue} ${styles.cardEmail}`}>
                {CONTACT_EMAIL}
              </a>
            </div>

            {/* For hiring managers judging the engineering, not just the projects. */}
            <div className={styles.cardStatRow}>
              <span className={styles.cardStatLabel}>THIS SITE</span>
              <span className={styles.cardStatValue}>
                <Link href="/notes/how-this-site-is-built" className={styles.cardEmail}>
                  How it&apos;s built
                </Link>{" "}
                (Lighthouse 100, tests, security) ·{" "}
                <a
                  href="https://github.com/hansvidaure24/hcv-portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.cardEmail}
                >
                  source on GitHub
                </a>
              </span>
            </div>

            <div className={styles.badgeSection}>
              <span className={styles.badgesLabel}>SKILLSET</span>
              <ul className={styles.badgeRow}>
                {SKILLS.map((skill) => (
                  <li key={skill.name} className={styles.skillBadge}>
                    <span className={styles.skillIcon} aria-hidden="true">
                      <img src={skill.icon} alt="" />
                    </span>
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primaryAction}
                data-track="message_open"
                onClick={() => {
                  playSound("/sounds/button.mp3");
                  openDialog();
                }}
              >
                Send a message <span aria-hidden="true">▶</span>
              </button>
              {Socials.links.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.action}
                  onClick={() => playSound("/sounds/button.mp3")}
                >
                  {link.name} <span aria-hidden="true">↗</span>
                </a>
              ))}
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.action}
                onClick={() => playSound("/sounds/button.mp3")}
              >
                Resume (PDF) <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </PixelPanel>
      </div>
    </ParallaxSection>
  )
}
