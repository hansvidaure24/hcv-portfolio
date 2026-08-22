"use client";
import { useEffect } from "react";
import Image from "next/image";
import ParallaxSection from "../../scene/ParallaxSection";
import { useScene } from "../../scene/SceneProvider";
import { useContactDialog } from "../../providers/ContactDialogProvider";
import { playSound } from "../../../lib/sound";
import { getEffectiveReducedMotion } from "../../../lib/motionPreference";
import styles from "./Hero.module.scss";

const TILE_COLS = 10;
const TILE_ROWS = 6;

// Blocky pixel-cloud silhouette (20px grid cells) reused for the transition
// clouds below, matching the GBA pixel-block style already used for the
// distant/near cloud layers earlier in this SVG instead of smooth ellipses.
const PIXEL_CLOUD_CELLS: [number, number, number, number][] = [
  [80, 0, 100, 20],
  [40, 20, 180, 20],
  [0, 40, 260, 20],
  [0, 60, 260, 20],
  [20, 80, 220, 20],
  [60, 100, 140, 20],
];

function PixelCloud({ x, y, scale = 1, fill, opacity }: { x: number; y: number; scale?: number; fill: string; opacity: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill={fill} opacity={opacity} shapeRendering="crispEdges">
      {PIXEL_CLOUD_CELLS.map(([cx, cy, cw, ch], i) => (
        <rect key={i} x={cx} y={cy} width={cw} height={ch} />
      ))}
    </g>
  );
}

const introTiles = Array.from({ length: TILE_COLS * TILE_ROWS }, (_, i) => {
  const col = i % TILE_COLS;
  const row = Math.floor(i / TILE_COLS);
  const delay = (col + row) * 0.045;
  return { key: i, delay };
});

// Matches the last-scheduled reveal in Hero.module.scss (.footerReveal:
// 1.6s delay + 0.5s duration = 2.1s), plus a small buffer. Everything else
// (tile wipe, title/subtitle/pressStart) finishes sooner than this.
const HERO_REVEAL_DURATION_MS = 2150;

export default function Hero() {
  const scene = useScene();
  const { openDialog } = useContactDialog();

  // Tell SceneProvider when the hero reveal is complete.
  useEffect(() => {
    const reduceMotion = getEffectiveReducedMotion();

    function markRevealed() {
      document.documentElement.classList.add("hero-revealed");
    }

    function onBooted() {
      if (reduceMotion) {
        markRevealed();
      } else {
        setTimeout(markRevealed, HERO_REVEAL_DURATION_MS);
      }
    }

    if (document.documentElement.classList.contains("app-booted")) {
      onBooted();
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains("app-booted")) {
        observer.disconnect();
        onBooted();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <ParallaxSection
      id="hero"
      bgClassName={styles.heroBg}
      contentClassName={styles.heroContent}
      overlay={
        <>
        <div className={styles.animatedBackdrop} aria-hidden="true">
          <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" role="presentation">
            <defs>
              <linearGradient id="emeraldSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0a2e45" />
                <stop offset="0.45" stopColor="#0f4d5e" />
                <stop offset="0.75" stopColor="#146b6a" />
                <stop offset="1" stopColor="#1c8a72" />
              </linearGradient>
              <radialGradient id="emeraldGlow" cx="0.5" cy="0.28" r="0.55">
                <stop offset="0" stopColor="#fde68a" stopOpacity="0.55" />
                <stop offset="0.5" stopColor="#facc15" stopOpacity="0.14" />
                <stop offset="1" stopColor="#facc15" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="mountainFar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0e5a52" />
                <stop offset="1" stopColor="#0a3d3f" />
              </linearGradient>
              <linearGradient id="mountainNear" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0f3d2a" />
                <stop offset="1" stopColor="#08251a" />
              </linearGradient>
              <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#123f66" />
                <stop offset="1" stopColor="#04142b" />
              </linearGradient>
              <linearGradient id="waterGradientDeep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#0d3355" />
                <stop offset="1" stopColor="#020a1a" />
              </linearGradient>
              <filter id="softBlur" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="10" />
              </filter>
              <filter id="cloudBlur" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* Sky */}
            <g className={styles.layerSky}>
              <rect width="1600" height="1000" fill="url(#emeraldSky)" />
              <rect width="1600" height="1000" fill="url(#emeraldGlow)" />
            </g>

            {/* Distant clouds, GBA pixel-block style, kept off the vertical center */}
            <g className={styles.layerCloudsFar} filter="url(#cloudBlur)" opacity="0.5">
              <g className={styles.cloudDriftSlow} transform="translate(60,90)">
                <rect x="0" y="0" width="120" height="18" fill="#eaf6f2" />
                <rect x="24" y="-14" width="80" height="18" fill="#eaf6f2" />
                <rect x="46" y="14" width="60" height="14" fill="#eaf6f2" />
              </g>
              <g className={styles.cloudDriftSlowReverse} transform="translate(1300,60)">
                <rect x="0" y="0" width="140" height="20" fill="#eaf6f2" />
                <rect x="30" y="-16" width="90" height="18" fill="#eaf6f2" />
                <rect x="10" y="16" width="70" height="14" fill="#eaf6f2" />
              </g>
            </g>

            <g className={styles.layerCloudsNear} filter="url(#cloudBlur)" opacity="0.65">
              <g className={styles.cloudDriftMed} transform="translate(-40,180)">
                <rect x="0" y="0" width="100" height="16" fill="#f8fffb" />
                <rect x="20" y="-12" width="64" height="16" fill="#f8fffb" />
              </g>
              <g className={styles.cloudDriftMedReverse} transform="translate(1420,210)">
                <rect x="0" y="0" width="110" height="16" fill="#f8fffb" />
                <rect x="18" y="-12" width="70" height="16" fill="#f8fffb" />
              </g>
            </g>

            {/* Far jungle silhouette hugging the edges, leaving the center clear */}
            <g className={styles.layerMountainsFar} opacity="0.55">
              <path fill="url(#mountainFar)" d="M0 460 C60 400 150 430 220 470 C300 340 380 380 430 440 L430 1000 L0 1000 Z">
                <animate attributeName="d" dur="46s" repeatCount="indefinite" values="M0 460 C60 400 150 430 220 470 C300 340 380 380 430 440 L430 1000 L0 1000 Z;M0 470 C60 415 150 445 220 460 C300 355 380 395 430 450 L430 1000 L0 1000 Z;M0 460 C60 400 150 430 220 470 C300 340 380 380 430 440 L430 1000 L0 1000 Z" />
              </path>
              <path fill="url(#mountainFar)" d="M1600 470 C1540 400 1460 435 1400 480 C1320 350 1230 390 1175 450 L1175 1000 L1600 1000 Z">
                <animate attributeName="d" dur="52s" repeatCount="indefinite" values="M1600 470 C1540 400 1460 435 1400 480 C1320 350 1230 390 1175 450 L1175 1000 L1600 1000 Z;M1600 460 C1540 415 1460 450 1400 470 C1320 365 1230 405 1175 460 L1175 1000 L1600 1000 Z;M1600 470 C1540 400 1460 435 1400 480 C1320 350 1230 390 1175 450 L1175 1000 L1600 1000 Z" />
              </path>
            </g>

            {/* Nearer forest silhouette framing the sides */}
            <g className={styles.layerMountainsNear} opacity="0.85">
              <path fill="url(#mountainNear)" d="M0 620 C40 560 120 590 170 640 C230 560 300 580 345 630 L345 1000 L0 1000 Z">
                <animate attributeName="d" dur="38s" repeatCount="indefinite" values="M0 620 C40 560 120 590 170 640 C230 560 300 580 345 630 L345 1000 L0 1000 Z;M0 610 C40 575 120 605 170 625 C230 575 300 595 345 615 L345 1000 L0 1000 Z;M0 620 C40 560 120 590 170 640 C230 560 300 580 345 630 L345 1000 L0 1000 Z" />
              </path>
              <path fill="url(#mountainNear)" d="M1600 630 C1560 565 1480 600 1430 645 C1370 570 1300 590 1255 635 L1255 1000 L1600 1000 Z">
                <animate attributeName="d" dur="41s" repeatCount="indefinite" values="M1600 630 C1560 565 1480 600 1430 645 C1370 570 1300 590 1255 635 L1255 1000 L1600 1000 Z;M1600 615 C1560 585 1480 610 1430 630 C1370 585 1300 600 1255 620 L1255 1000 L1600 1000 Z;M1600 630 C1560 565 1480 600 1430 645 C1370 570 1300 590 1255 635 L1255 1000 L1600 1000 Z" />
              </path>
            </g>

            {/* Soft glow shapes drifting deep in the background, kept subtle behind text */}
            <g filter="url(#softBlur)" opacity="0.3">
              <ellipse fill="#2dd4bf" cx="230" cy="860" rx="200" ry="90" className={styles.floatSlow} />
              <ellipse fill="#facc15" cx="1370" cy="840" rx="170" ry="80" className={styles.floatSlowReverse} />
            </g>

            {/* Water band along the base — dark, moving ocean */}
            <g className={styles.layerWater}>
              <path fill="url(#waterGradientDeep)" d="M0 780 C240 740 460 810 700 770 C920 735 1100 800 1340 765 C1450 748 1540 775 1600 762 L1600 1000 L0 1000 Z">
                <animate attributeName="d" dur="22s" repeatCount="indefinite" values="M0 780 C240 740 460 810 700 770 C920 735 1100 800 1340 765 C1450 748 1540 775 1600 762 L1600 1000 L0 1000 Z;M0 770 C240 800 460 740 700 790 C920 815 1100 750 1340 785 C1450 800 1540 765 1600 780 L1600 1000 L0 1000 Z;M0 780 C240 740 460 810 700 770 C920 735 1100 800 1340 765 C1450 748 1540 775 1600 762 L1600 1000 L0 1000 Z" />
              </path>
              <path fill="url(#waterGradient)" d="M0 860 C220 820 420 900 640 850 C860 800 1000 900 1220 855 C1380 825 1500 870 1600 850 L1600 1000 L0 1000 Z">
                <animate attributeName="d" dur="18s" repeatCount="indefinite" values="M0 860 C220 820 420 900 640 850 C860 800 1000 900 1220 855 C1380 825 1500 870 1600 850 L1600 1000 L0 1000 Z;M0 850 C220 890 420 830 640 870 C860 900 1000 830 1220 870 C1380 890 1500 840 1600 865 L1600 1000 L0 1000 Z;M0 860 C220 820 420 900 640 850 C860 800 1000 900 1220 855 C1380 825 1500 870 1600 850 L1600 1000 L0 1000 Z" />
              </path>
              <path fill="#1b5c8c" opacity="0.55" d="M0 900 C260 875 460 930 700 905 C920 882 1120 930 1350 900 C1450 888 1550 905 1600 895 L1600 1000 L0 1000 Z">
                <animate attributeName="d" dur="14s" repeatCount="indefinite" values="M0 900 C260 875 460 930 700 905 C920 882 1120 930 1350 900 C1450 888 1550 905 1600 895 L1600 1000 L0 1000 Z;M0 895 C260 915 460 880 700 900 C920 918 1120 885 1350 905 C1450 912 1550 895 1600 900 L1600 1000 L0 1000 Z;M0 900 C260 875 460 930 700 905 C920 882 1120 930 1350 900 C1450 888 1550 905 1600 895 L1600 1000 L0 1000 Z" />
              </path>
              {/* Glinting wave crests that drift sideways for a "moving water" read */}
              <g className={styles.waveShimmerA} opacity="0.35">
                <rect x="0" y="812" width="46" height="3" fill="#7dd3fc" />
                <rect x="140" y="798" width="60" height="3" fill="#7dd3fc" />
                <rect x="360" y="820" width="40" height="3" fill="#7dd3fc" />
                <rect x="620" y="805" width="55" height="3" fill="#7dd3fc" />
                <rect x="900" y="815" width="45" height="3" fill="#7dd3fc" />
                <rect x="1180" y="800" width="60" height="3" fill="#7dd3fc" />
                <rect x="1420" y="818" width="40" height="3" fill="#7dd3fc" />
              </g>
              <g className={styles.waveShimmerB} opacity="0.28">
                <rect x="80" y="870" width="50" height="3" fill="#bae6fd" />
                <rect x="340" y="885" width="38" height="3" fill="#bae6fd" />
                <rect x="600" y="865" width="55" height="3" fill="#bae6fd" />
                <rect x="880" y="880" width="42" height="3" fill="#bae6fd" />
                <rect x="1160" y="868" width="58" height="3" fill="#bae6fd" />
                <rect x="1440" y="882" width="40" height="3" fill="#bae6fd" />
              </g>
            </g>

            {/* Sparse pixel particles */}
            <g className={styles.layerParticles} fill="#fef3c7">
              <rect x="180" y="300" width="4" height="4" className={styles.pixelPulseA} />
              <rect x="1420" y="360" width="4" height="4" className={styles.pixelPulseB} />
              <rect x="90" y="560" width="3" height="3" className={styles.pixelPulseC} />
              <rect x="1500" y="620" width="3" height="3" className={styles.pixelPulseA} />
              <rect x="260" y="200" width="3" height="3" className={styles.pixelPulseB} />
              <rect x="1340" y="150" width="3" height="3" className={styles.pixelPulseC} />
            </g>
          </svg>
        </div>
        <div className={styles.introTiles} aria-hidden="true">
          {introTiles.map(({ key, delay }) => (
            <span key={key} className={styles.tile} style={{ animationDelay: `${delay}s` }} />
          ))}
        </div>

        {/* Floating clouds that pop up during tile transition */}
        <svg className={styles.transitionClouds} viewBox="0 0 1600 1000" preserveAspectRatio="none" aria-hidden="true">
          {/* Left side clouds */}
          <g className={styles.cloudPopLeft}>
            <PixelCloud x={-10} y={150} scale={0.9} fill="#f0fdf4" opacity={0.75} />
          </g>
          <g className={styles.cloudPopLeft} style={{ animationDelay: "0.15s" }}>
            <PixelCloud x={20} y={600} scale={0.85} fill="#f8fffb" opacity={0.8} />
          </g>

          {/* Right side clouds */}
          <g className={styles.cloudPopRight}>
            <PixelCloud x={1330} y={230} scale={0.95} fill="#f0fdf4" opacity={0.75} />
          </g>
          <g className={styles.cloudPopRight} style={{ animationDelay: "0.15s" }}>
            <PixelCloud x={1300} y={670} scale={0.85} fill="#f8fffb" opacity={0.8} />
          </g>
        </svg>
        </>
      }
    >
      <h1 className={`${styles.title} ${styles.titleReveal}`}>HANS VIDAURE</h1>
      <p className={`${styles.subtitle} ${styles.subtitleReveal}`}>
        Building the future, one bug fix at a time.
      </p>
      <div className={styles.pokedexContainer}>
        <svg viewBox="0 0 380 480" className={styles.pokedexSvg} preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="pokedexTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e74c3c" />
              <stop offset="1" stopColor="#c0392b" />
            </linearGradient>
            <linearGradient id="pokedexBottom" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2c3e50" />
              <stop offset="1" stopColor="#34495e" />
            </linearGradient>
            <filter id="pokedexScan">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
            </filter>
          </defs>

          {/* Top red section */}
          <path fill="url(#pokedexTop)" d="M 30 20 L 350 20 Q 360 20 360 30 L 360 120 Q 360 130 350 130 L 30 130 Q 20 130 20 120 L 20 30 Q 20 20 30 20 Z" />

          {/* Center bezel (white screen area) */}
          <rect x="20" y="130" width="340" height="260" rx="8" fill="#f5f5f5" />

          {/* Screen content area (where image goes) */}
          <rect x="28" y="138" width="324" height="244" rx="4" fill="#fff" />

          {/* Bottom dark section */}
          <path fill="url(#pokedexBottom)" d="M 30 390 L 350 390 Q 360 390 360 400 L 360 450 Q 360 460 350 460 L 30 460 Q 20 460 20 450 L 20 400 Q 20 390 30 390 Z" />

          {/* Pokédex details - top buttons */}
          <circle cx="100" cy="60" r="8" fill="#fff" opacity="0.8" />
          <circle cx="140" cy="50" r="6" fill="#fff" opacity="0.6" />
          <circle cx="175" cy="65" r="7" fill="#fff" opacity="0.7" />

          {/* Bottom indicators */}
          <rect x="60" y="410" width="14" height="14" rx="2" fill="#2ecc71" opacity="0.8" />
          <rect x="90" y="415" width="10" height="10" rx="1" fill="#f39c12" opacity="0.7" />
          <rect x="115" y="410" width="12" height="12" rx="2" fill="#3498db" opacity="0.8" />

          {/* Animated scan line */}
          <g className={styles.scanLineGroup}>
            <line x1="28" y1="138" x2="352" y2="138" stroke="#0ff" strokeWidth="2" opacity="0.6" filter="url(#pokedexScan)" />
          </g>
        </svg>
        <div className={styles.pokedexImageFrame}>
          <Image
            src="/graphics/hero-avatar.jpg"
            alt="Hans Vidaure"
            fill
            sizes="(max-width: 640px) 60vw, 425px"
            style={{ objectFit: "cover" }}
            className={styles.pokedexImage}
            priority
          />
        </div>
      </div>
      <a
        href="#projects"
        className={`${styles.pressStart} ${styles.pressStartReveal}`}
        onClick={(e) => {
          e.preventDefault();
          // Play the sound only when navigation actually starts.
          scene?.goTo("projects", () => playSound("/sounds/press-start.mp3"));
        }}
      >
        PRESS START
      </a>
      <button
        type="button"
        className={`${styles.secondaryCta} ${styles.secondaryCtaReveal}`}
        onClick={() => {
          playSound("/sounds/button.mp3");
          openDialog();
        }}
      >
        or send a message
      </button>
      <footer className={`${styles.footerLine} ${styles.footerReveal}`}>© 2000 Queens, NY</footer>
    </ParallaxSection>
  );
}
