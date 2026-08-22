"use client";

import { useRef } from "react";
import { useMotionSettings } from "../../providers/MotionPreferenceProvider";
import styles from "./BioDashboard.module.scss";

const BIRTHDATE = new Date(2000, 7, 24);

function getAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

const STATS = [
  "JAVASCRIPT",
  "REACT",
  "C#",
  ".NET",
  "JAVA",
  "PYTHON",
  "SCSS / TAILWIND",
  "SQL",
  "ASP.NET",
  "UNITY",
];

const ORIGIN_PARAGRAPHS = [
  "I grew up in the Philippines and later moved to the US, where video games first sparked my passion for programming. Today I build and secure the software that moves people's money as a Software Development Engineer at Fiserv. I work full-stack on a secure enterprise online banking platform used by retail and business customers.",
  "Alongside that, my love for games never left. I've been self-studying Unity and C# game programming, tackling RPG combat systems and 3D game development. I'm chasing a long-term goal of growing into game dev the same way I grew into banking software.",
];

const LOOKING_FOR = "Growing into a senior full-stack role with more ownership & technical leadership.";

const QUEST_LOG = [
  "Building and securing an enterprise online banking platform at Fiserv",
  "Working full-stack across C#, ASP.NET, React, and SQL",
  "Treating security as part of the design, not an afterthought by validating inputs, guarding auth flows, keeping data safe by default",
  "Self-studying Unity & C# game programming: RPG combat systems, 3D game dev",
  "Organizing modular, reusable components as codebases grow",
];

function TickerGroup({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <span className={styles.tickerGroup} aria-hidden={ariaHidden}>
      {STATS.map((stat) => (
        <span key={stat} className={styles.tickerItem}>
          {stat} <span className={styles.tickerSep}>◆</span>
        </span>
      ))}
    </span>
  );
}

export default function BioDashboard() {
  const { reduced: reduceMotion } = useMotionSettings();
  const tickerRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startScrollLeft: 0,
  });
  const draggingClass = ((styles as Record<string, string>).dragging ?? "dragging") as string;
  const reducedTickerClass = ((styles as Record<string, string>).tickerWrapReduced ?? "tickerWrapReduced") as string;

  function onTickerPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!reduceMotion || !tickerRef.current) return;

    dragState.current = {
      dragging: true,
      startX: event.clientX,
      startScrollLeft: tickerRef.current.scrollLeft,
    };

    tickerRef.current.setPointerCapture(event.pointerId);
    tickerRef.current.classList.add(draggingClass);
  }

  function onTickerPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!reduceMotion || !dragState.current.dragging || !tickerRef.current) return;

    const dx = event.clientX - dragState.current.startX;
    tickerRef.current.scrollLeft = dragState.current.startScrollLeft - dx;
  }

  function endTickerDrag(event?: React.PointerEvent<HTMLDivElement>) {
    if (!tickerRef.current) return;

    dragState.current.dragging = false;
    tickerRef.current.classList.remove(draggingClass);
    if (event) tickerRef.current.releasePointerCapture(event.pointerId);
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.headerTitle}>TRAINER PROFILE</h2>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.panel} ${styles.trainerPanel}`}>
          <div className={styles.panelBody}>
            <div className={styles.idRow}>
              <span>NO. 001</span>
              <span>TRAINER</span>
            </div>
            <div className={styles.portrait}>
              <video
                src="/videos/video1.mp4"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
              />
            </div>
            <div className={styles.nameplate}>
              <div className={styles.name}>HANS VIDAURE</div>
            </div>
            <p className={styles.tagline}>{LOOKING_FOR}</p>
            <div className={styles.miniRow}>
              <div className={styles.miniCell}>
                <div className={styles.miniLabel}>INTERESTS</div>
                <div className={styles.interestTags}>
                  <span className={`${styles.interestTag} ${styles.tagCode}`}>Software Engineering</span>
                  <span className={`${styles.interestTag} ${styles.tagGame}`}>Game Development/Design</span>
                  <span className={`${styles.interestTag} ${styles.tagSecurity}`}>Code Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.panel} ${styles.storyPanel}`}>
          <h3 className={styles.panelHeader}>HOW I GOT HERE</h3>
          <div className={styles.panelBody}>
            {ORIGIN_PARAGRAPHS.map((p, i) => (
              <p key={i} className={styles.storyText}>{p}</p>
            ))}
          </div>
        </div>

        <div className={`${styles.panel} ${styles.questPanel}`}>
          <h3 className={styles.panelHeader}>WHAT I&apos;VE BEEN DOING</h3>
          <div className={styles.panelBody}>
            <div className={styles.questLog}>
              {QUEST_LOG.map((item) => (
                <div key={item} className={styles.questItem}>
                  <span className={styles.questBullet}>{">"}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${styles.panel} ${styles.statsPanel}`}>
          <h3 className={styles.panelHeader}>STATS</h3>
          <div className={styles.panelBody}>
            <div className={styles.questClip}>
              <video
                src="/videos/video2.mp4"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
              />
            </div>
            <div
              ref={tickerRef}
              className={`${styles.tickerWrap} ${reduceMotion ? reducedTickerClass : ""}`}
              onPointerDown={onTickerPointerDown}
              onPointerMove={onTickerPointerMove}
              onPointerUp={endTickerDrag}
              onPointerLeave={endTickerDrag}
              onPointerCancel={endTickerDrag}
              aria-label="Skill ticker. Drag to scroll horizontally."
            >
              <div className={styles.tickerTrack}>
                <TickerGroup />
                <TickerGroup ariaHidden />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
