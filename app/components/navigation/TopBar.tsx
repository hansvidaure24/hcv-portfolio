"use client";
import { useScene } from "../scene/SceneProvider";
import { playSound } from "../../lib/sound";
import { useSoundSetting } from "../../lib/useSoundSetting";
import { RESUME_URL } from "../../lib/site";
import styles from "./TopBar.module.scss";

const LINKS = [
  { label: "Work", id: "projects" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="6" width="3" height="4" />
      <rect x="4" y="5" width="1" height="6" />
      <rect x="5" y="4" width="1" height="8" />
      <rect x="6" y="3" width="1" height="10" />
      <rect x="7" y="2" width="1" height="12" />
      {on ? (
        <>
          <rect x="10" y="6" width="1" height="4" />
          <rect x="12" y="4" width="1" height="8" />
          <rect x="14" y="2" width="1" height="12" />
        </>
      ) : (
        <>
          <rect x="10" y="5" width="1" height="1" />
          <rect x="11" y="6" width="1" height="1" />
          <rect x="12" y="7" width="2" height="2" />
          <rect x="14" y="9" width="1" height="1" />
          <rect x="15" y="10" width="1" height="1" />
          <rect x="14" y="6" width="1" height="1" />
          <rect x="15" y="5" width="1" height="1" />
          <rect x="11" y="9" width="1" height="1" />
          <rect x="10" y="10" width="1" height="1" />
        </>
      )}
    </svg>
  );
}

export default function TopBar() {
  const scene = useScene();
  const sound = useSoundSetting();

  function go(e: React.MouseEvent, id: string) {
    if (!scene) return;
    e.preventDefault();
    scene.goTo(id, () => playSound("/sounds/button.mp3"));
  }

  return (
    <header className={styles.bar}>
      <a href="#hero" className={styles.brand} onClick={(e) => go(e, "hero")}>
        HANS VIDAURE
      </a>
      <nav className={styles.nav} aria-label="Sections">
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            className={styles.link}
            aria-current={scene?.activeId === link.id ? "true" : undefined}
            onClick={(e) => go(e, link.id)}
          >
            {link.label}
          </a>
        ))}
        <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" className={styles.resume}>
          Resume <span aria-hidden="true">↗</span>
        </a>
        <button
          type="button"
          className={styles.sound}
          aria-pressed={sound.enabled}
          aria-label="Sound"
          title={sound.enabled ? "Turn sound off" : "Turn sound on"}
          onClick={() => {
            sound.toggle();
            playSound("/sounds/button.mp3");
          }}
        >
          <SpeakerIcon on={sound.enabled} />
        </button>
      </nav>
    </header>
  );
}
