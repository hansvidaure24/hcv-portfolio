"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ParallaxSection from "../../scene/ParallaxSection";
import { useScene } from "../../scene/SceneProvider";
import { getFirstGesturePromise, isSoundEnabled, playSound } from "../../../lib/sound";
import { getEffectiveReducedMotion } from "../../../lib/motionPreference";
import { useContactDialog } from "../../providers/ContactDialogProvider";
import styles from "./Contact.module.scss";

export const Socials = {
  links: [
    {
      name: 'GitHub',
      url: 'https://github.com/hansvidaure24',
      icon: '/icons/icon-github.png',
      description: 'GitHub: View my GitHub profile and projects',
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/hans-chandler-vidaure-0a1797190',
      icon: '/icons/icon-linkedin.png',
      description: 'LinkedIn: Connect with me professionally',
    },
  ],
}

function getIconSrc(icon: string, active: boolean, hasHoverVariant: boolean) {
  if (!hasHoverVariant || !active) return icon;
  return icon.replace('.png', '-hover.png');
}

type MenuItem = {
  key: string;
  label: string;
  href?: string;
  icon: string;
  hasHoverVariant: boolean;
  external: boolean;
  description?: string;
};

type Skill = {
  name: string;
  icon: string;
};

const TYPING_MESSAGE = "Got an idea worth debugging?...";
const TYPING_INTERVAL_MS = 68;

const SKILLS: Skill[] = [
  { name: 'Full-Stack Development', icon: '/icons/icon-fullstack.svg' },
  { name: 'UI/UX', icon: '/icons/icon-uiux.svg' },
  { name: 'Web Design', icon: '/icons/icon-webdesign.svg' },
  { name: 'Application Security', icon: '/icons/icon-appsecurity.svg' },
];

export default function Contact() {
  const [hovered, setHovered] = useState<string | null>(null);
  const { openDialog } = useContactDialog();
  const currentYear = new Date().getFullYear();
  const scene = useScene();
  const [typingActive, setTypingActive] = useState(false);
  const [typedLength, setTypedLength] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const typingRef = useRef<HTMLDivElement>(null);
  // Decode the typing sound once so playback starts with the text.
  const audioCtxRef = useRef<AudioContext | null>(null);
  const typeBufferRef = useRef<AudioBuffer | null>(null);
  // Keep the active decode promise so late callers can wait for it.
  const typeBufferPromiseRef = useRef<Promise<AudioBuffer> | null>(null);
  // Store the cleanup function for whichever playback path is active.
  const stopTypeSoundRef = useRef<(() => void) | null>(null);
  const [torchicBubbleVisible, setTorchicBubbleVisible] = useState(false);
  const torchicAudioRef = useRef<HTMLAudioElement>(null);
  // Use a ref to block rapid clicks before state updates are applied.
  const torchicPlayingRef = useRef(false);

  // Start decoding on mount so the sound is ready when typing begins.
  useEffect(() => {
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

    return () => {
      ctx.close().catch(() => {});
    };
  }, []);

  // Wait until the audio context and buffer are ready without starting playback.
  async function ensureAudioReady(): Promise<{ ctx: AudioContext; buffer: AudioBuffer } | null> {
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

  function handleTorchicClick() {
    if (torchicPlayingRef.current) return;
    setTorchicBubbleVisible(true);

    // Keep the bubble interactive when sound is disabled.
    if (!isSoundEnabled()) return;

    torchicPlayingRef.current = true;
    const audio = torchicAudioRef.current;
    if (!audio) {
      torchicPlayingRef.current = false;
      return;
    }
    audio.currentTime = 0;
    audio.play().catch(() => {
      torchicPlayingRef.current = false;
    });
  }

  // Start typing when Contact becomes the active scene.
  async function activateTyping() {
    setTypingActive(true);

    const reduceMotion = getEffectiveReducedMotion();
    if (reduceMotion) {
      setTypedLength(TYPING_MESSAGE.length);
      setTypingDone(true);
      return;
    }

    // Start the visual effect independently of audio permissions.
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTypedLength(i);

      if (i >= TYPING_MESSAGE.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, TYPING_INTERVAL_MS);

    // The typewriter still runs when sound is disabled.
    if (!isSoundEnabled()) return;

    // Start audio when the browser allows it without blocking the text effect.
    const ready = await ensureAudioReady();

    // Do not start audio if the user left Contact while it was loading.
    if (scene?.isDesktop && scene.activeId !== "contact") return;

    if (ready) {
      beginTypeSoundPlayback(ready.ctx, ready.buffer);
    } else {
      // Fall back to HTML audio if Web Audio is unavailable.
      const audio = new Audio("/sounds/type.mp3");
      audio.play().catch(() => {});
      stopTypeSoundRef.current = () => audio.pause();
    }
  }

  // Stop the clip when the user leaves Contact.
  useEffect(() => {
    if (scene && scene.activeId !== "contact") {
      stopTypeSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.activeId]);

  useEffect(() => {
    if (typingActive) return;

    if (scene?.isDesktop) {
      if (scene.activeId === "contact") activateTyping();
      return;
    }

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
  }, [scene?.isDesktop, scene?.activeId, typingActive]);

  const messageItem: MenuItem = {
    key: 'message',
    label: 'Send me a message',
    icon: '/icons/message.png',
    hasHoverVariant: false,
    external: false,
  };

  const menuItems: MenuItem[] = [
    messageItem,
    ...Socials.links.map((link) => ({
      key: link.name,
      label: link.name,
      href: link.url,
      icon: link.icon,
      hasHoverVariant: true,
      external: true,
      description: link.description,
    })),
  ];

  return (
    <ParallaxSection
      id="contact"
      bgClassName={styles.contactBg}
      contentClassName={styles.contactContent}
      overlay={
        <div className={styles.torchicWrap}>
          {torchicBubbleVisible && <div className={styles.speechBubble}>have a good day!</div>}
          <button
            type="button"
            className={styles.torchicButton}
            onClick={handleTorchicClick}
            aria-label="Torchic"
          >
            <Image
              src="/graphics/torchic.gif"
              alt=""
              width={498}
              height={498}
              unoptimized
              className={styles.torchicGif}
            />
          </button>
          <audio
            ref={torchicAudioRef}
            src="/sounds/torchic.mp3"
            preload="none"
            onEnded={() => {
              torchicPlayingRef.current = false;
            }}
          />
        </div>
      }
    >
      <div ref={typingRef} className={styles.typingWrap}>
        <span className={`${styles.typingText}${typingDone ? ' ' + styles.typingBlink : ''}`}>
          {TYPING_MESSAGE.slice(0, typedLength)}
        </span>
      </div>

      <div className={styles.contactScene}>
        <div className={styles.trainerCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardHeaderBadge}>TRAINER CARD</h2>
            <span className={styles.cardId}>ID No. {currentYear}</span>
          </div>

          <div className={styles.cardBody}>
            <div className={styles.cardInfo}>
              <p className={styles.cardName}>NAME: Hans</p>

              <div className={styles.cardStatRow}>
                <span className={styles.cardStatLabel}>STATUS</span>
                <span className={styles.cardStatValue}>Actively Open to Work + Freelance</span>
              </div>

              <div className={styles.badgeSection}>
                <span className={styles.badgesLabel}>SKILLSET</span>
                <div className={styles.badgeRow}>
                  {SKILLS.map((skill) => (
                    <div key={skill.name} className={styles.skillBadge}>
                      <span className={styles.skillIcon} aria-hidden="true">
                        <img src={skill.icon} alt="" />
                      </span>
                      <span className={styles.skillName}>{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.badgeSection}>
                <span className={styles.badgesLabel}>LINKS</span>
                <div className={styles.badgeRow}>
                  {menuItems.map((item) => {
                    const active = hovered === item.key;
                    const iconEl = (
                      <Image
                        src={getIconSrc(item.icon, active, item.hasHoverVariant)}
                        alt=""
                        width={22}
                        height={22}
                        className={styles.linkBadgeIcon}
                      />
                    );

                    if (item.key === 'message') {
                      return (
                        <button
                          key={item.key}
                          type="button"
                          className={styles.linkBadge}
                          aria-label={item.description ?? item.label}
                          title={item.description ?? item.label}
                          onMouseEnter={() => setHovered(item.key)}
                          onMouseLeave={() => setHovered((h) => (h === item.key ? null : h))}
                          onFocus={() => setHovered(item.key)}
                          onBlur={() => setHovered((h) => (h === item.key ? null : h))}
                          onClick={() => {
                            playSound("/sounds/button.mp3");
                            openDialog();
                          }}
                        >
                          {iconEl}
                        </button>
                      );
                    }

                    return (
                      <a
                        key={item.key}
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        className={styles.linkBadge}
                        aria-label={item.description ?? item.label}
                        title={item.description ?? item.label}
                        onMouseEnter={() => setHovered(item.key)}
                        onMouseLeave={() => setHovered((h) => (h === item.key ? null : h))}
                        onFocus={() => setHovered(item.key)}
                        onBlur={() => setHovered((h) => (h === item.key ? null : h))}
                        onClick={() => playSound("/sounds/button.mp3")}
                      >
                        {iconEl}
                      </a>
                    );
                  })}
                  <a
                    href="/resume/hcv-resume.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.linkBadge}
                    aria-label="Download resume (PDF)"
                    title="Download resume (PDF)"
                    onClick={() => playSound("/sounds/button.mp3")}
                  >
                    <img
                      src="/icons/icon-resume.svg"
                      alt=""
                      className={styles.linkBadgeIcon}
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </div>
            </div>

            <div className={styles.cardPortrait}>
              <Image
                src="/graphics/hans.png"
                alt="Hans Chandler Vidaure trading card"
                width={600}
                height={840}
                className={styles.portraitImage}
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </ParallaxSection>
  )
}
