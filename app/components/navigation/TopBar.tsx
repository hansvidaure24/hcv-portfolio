"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useScene } from "../scene/SceneProvider";
import { useOptions } from "../providers/OptionsProvider";
import { playSound } from "../../lib/sound";
import styles from "./TopBar.module.scss";

const LINKS = [
  { label: "Work", id: "projects" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];

// Three pixel sliders: the OPTIONS screen (text speed, animations, sound, time of day).
function OptionsIcon() {
  return (
    <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" shapeRendering="crispEdges" fill="currentColor">
      <rect x="1" y="3" width="14" height="1" />
      <rect x="4" y="1" width="3" height="5" />
      <rect x="1" y="8" width="14" height="1" />
      <rect x="9" y="6" width="3" height="5" />
      <rect x="1" y="13" width="14" height="1" />
      <rect x="5" y="11" width="3" height="5" />
    </svg>
  );
}

export default function TopBar() {
  const scene = useScene();
  const { openOptions } = useOptions();
  const pathname = usePathname();
  // On the home page the links jump between sections; elsewhere (case
  // studies, 404) they go back to the home page's sections.
  const base = scene ? "" : "/";

  function go(e: React.MouseEvent, id: string) {
    if (!scene) return;
    e.preventDefault();
    scene.goTo(id, () => playSound("/sounds/button.mp3"));
  }

  return (
    <>
    {/* The first tab stop on every page (each one renders TopBar first): skips
        the bar's links. Visible only while focused. */}
    <a href="#content" className={styles.skip}>
      Skip to content
    </a>
    <header className={styles.bar}>
      <a href={scene ? "#hero" : "/"} className={styles.brand} onClick={(e) => go(e, "hero")}>
        HANS VIDAURE
      </a>
      <nav className={styles.nav} aria-label="Sections">
        {LINKS.map((link) => (
          <a
            key={link.id}
            href={`${base}#${link.id}`}
            className={styles.link}
            aria-current={scene?.activeId === link.id ? "true" : undefined}
            onClick={(e) => go(e, link.id)}
          >
            {link.label}
          </a>
        ))}
        {/* The Quick view page; the PDF is one click away from there. */}
        <Link href="/resume" className={styles.resume} aria-current={pathname === "/resume" ? "page" : undefined}>
          Resume
        </Link>
        <button
          type="button"
          className={styles.iconButton}
          aria-label="Options"
          aria-haspopup="dialog"
          title="Options: text speed, animations, sound, time of day"
          onClick={() => {
            playSound("/sounds/button.mp3");
            openOptions();
          }}
        >
          <OptionsIcon />
        </button>
      </nav>
    </header>
    {/* Where "Skip to content" lands: focusable, so the next Tab goes to the
        page's first link. Not a section id, so the home page's hash handling
        ignores it. */}
    <div id="content" tabIndex={-1} className={styles.skipTarget} />
    </>
  );
}
