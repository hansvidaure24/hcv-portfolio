

import { getProjects } from "../app/projects-data";
import ProjectsSlideshowClient from "./ProjectsSlideshowClient";
import styles from "../app/scss/Projects.module.scss";

const sampleProjects = getProjects();

function FilmStripBackground({ position = 'top', rotation = 0 }) {
  let posClass = position === 'top'
    ? `${styles.filmStrip} ${styles.filmStripTop}`
    : `${styles.filmStrip} ${styles.filmStripBottom}`;
  return (
    <div
      className={posClass}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className={styles.filmStripInner} />
    </div>
  );
}

export default function Projects() {
  const projects = getProjects();
  return (
    <section id="projects" className={styles.projectsSection}>
      <FilmStripBackground position="top" rotation={8} />
      <h1 className={styles.googleLogo}>
        <span style={{ color: '#4285F4' }}>P</span>
        <span style={{ color: '#EA4335' }}>r</span>
        <span style={{ color: '#FBBC05' }}>o</span>
        <span style={{ color: '#34A853' }}>j</span>
        <span style={{ color: '#4285F4' }}>e</span>
        <span style={{ color: '#EA4335' }}>c</span>
        <span style={{ color: '#FBBC05' }}>t</span>
        <span style={{ color: '#34A853' }}>s</span>
      </h1>
      <div className={styles.googleBanner}>
        <h2 className={styles.projectsTitle}>
          <span className={styles.googleBannerIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="#5f6368" strokeWidth="2" />
              <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className={styles.googleBannerQuery}>These are results for</span>
          <a href="#projects" className={styles.googleBannerLink}>
            my cool stuff
          </a>
        </h2>
      </div>
      <ProjectsSlideshowClient projects={projects} />
      <FilmStripBackground position="bottom" rotation={-2} />
    </section>
  );
}