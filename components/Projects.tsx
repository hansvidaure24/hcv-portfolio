

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
      <h1 className={styles.projectsTitle}>
        <span className="text-gray">These are results for </span>
        <a href="#projects" className="text-blue italic hover:underline transition-colors">
          my cool stuff
        </a>
      </h1>
      <p className={styles.projectsDesc}>
        <span className="text-gray">Search instead for </span>
        <a href="#projects" className="text-blue hover:underline transition-colors">
          hans&apos; projects
        </a>
      </p>
      <ProjectsSlideshowClient projects={projects} />
      <FilmStripBackground position="bottom" rotation={-2} />
    </section>
  );
}