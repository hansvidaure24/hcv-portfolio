"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { playSound } from "../../lib/sound";
import styles from "./PokeBall.module.scss";

type PokeBallProps = {
  label: string;
  onSelect: () => void;
  selected?: boolean;
  style?: React.CSSProperties;
  variant?: "image" | "svg";
  size?: "sm" | "lg";
  /** Idle effect used by the ball. */
  idleEffect?: "wobble" | "glow";
  /** Preview image shown above the ball or near the pointer. */
  previewImage?: string;
  /** Whether this ball is showing its touch preview. */
  armed?: boolean;
  /** Arms the ball on the first touch tap. */
  onArm?: () => void;
};

function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

const SETTLE_DURATION = 220;

export default function PokeBall({
  label,
  onSelect,
  selected = false,
  style,
  variant = "image",
  size = "sm",
  idleEffect = "wobble",
  previewImage,
  armed = false,
  onArm,
}: PokeBallProps) {
  const [engaged, setEngaged] = useState(false);
  const [settling, setSettling] = useState(false);
  const [followPos, setFollowPos] = useState<{ x: number; y: number } | null>(null);
  const settleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Coalesce pointer updates to one state change per animation frame.
  const rafRef = useRef<number | null>(null);
  const pendingPosRef = useRef<{ x: number; y: number } | null>(null);

  function engage() {
    if (settleTimeout.current) clearTimeout(settleTimeout.current);
    setSettling(false);
    setEngaged(true);
  }

  function disengage() {
    setEngaged(false);
    setSettling(true);
    setFollowPos(null);
    pendingPosRef.current = null;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (settleTimeout.current) clearTimeout(settleTimeout.current);
    settleTimeout.current = setTimeout(() => setSettling(false), SETTLE_DURATION);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    if (!previewImage) return;
    // Ignore compatibility mouse events from touch devices.
    if (isCoarsePointer()) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pendingPosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      setFollowPos(pendingPosRef.current);
    });
  }

  useEffect(() => {
    return () => {
      if (settleTimeout.current) clearTimeout(settleTimeout.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    // On touch devices, the first tap previews and the second tap selects.
    if (previewImage && onArm && !armed && isCoarsePointer()) {
      playSound("/sounds/button.mp3");
      onArm();
      return;
    }
    disengage();
    e.currentTarget.blur();
    playSound("/sounds/button.mp3");
    onSelect();
  }

  const engagementClass = engaged ? styles.ballEngaged : settling ? styles.ballSettling : "";

  return (
    <button
      type="button"
      draggable={false}
      data-pokeball="true"
      className={`${styles.ball} ${size === "lg" ? styles.ballLarge : ""} ${selected ? styles.ballSelected : ""} ${engagementClass} ${idleEffect === "glow" ? styles.ballGlow : ""} ${armed ? styles.ballArmed : ""}`}
      onDragStart={(e) => e.preventDefault()}
      onClick={handleClick}
      onMouseEnter={engage}
      onMouseLeave={disengage}
      onMouseMove={handleMouseMove}
      onFocus={engage}
      onBlur={disengage}
      aria-label={label}
      style={style}
    >
      {variant === "svg" ? (
        <img
          src="/icons/icon-pokeball.svg"
          alt=""
          className={styles.ballSvg}
          aria-hidden="true"
        />
      ) : (
        <Image
          src="/graphics/pokeball.png"
          alt=""
          fill
          sizes="112px"
          draggable={false}
          className={styles.ballSvg}
          aria-hidden="true"
        />
      )}
      {previewImage ? (
        <>
          <span
            className={`${styles.preview} ${followPos ? styles.previewFollow : ""}`}
            style={followPos ? { left: followPos.x, top: followPos.y } : undefined}
            aria-hidden="true"
          >
            <Image src={previewImage} alt="" fill sizes="360px" className={styles.previewImg} />
          </span>
          <span className={styles.nameBanner} aria-hidden="true">{label}</span>
        </>
      ) : (
        <span className={styles.ballLabel}>{label}</span>
      )}
    </button>
  );
}
