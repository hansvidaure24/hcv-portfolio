import PixelPanel from "../../ui/PixelPanel";
import ProjectMedia from "./ProjectMedia";
import CaseStudyLink from "./CaseStudyLink";
import { morphNames } from "../../../lib/morphNavigation";
import type { Project } from "../../../data/projects";
import styles from "./ProjectCard.module.scss";

export function ProjectLinks({ project, showCaseStudy = true }: { project: Project; showCaseStudy?: boolean }) {
  return (
    <div className={styles.links}>
      {showCaseStudy && (
        <CaseStudyLink href={`/projects/${project.slug}`} className={styles.primaryLink}>
          Case study <span aria-hidden="true">→</span>
        </CaseStudyLink>
      )}
      {project.links.map((link) => (
        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
          {link.label} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

type ProjectCardProps = {
  project: Project;
  /** The wide layout for the first card; defaults to the project's own `featured` flag. */
  featured?: boolean;
  /** Stack chips to highlight for the visitor's chosen focus. */
  highlight?: string[];
};

export default function ProjectCard({ project, featured = Boolean(project.featured), highlight = [] }: ProjectCardProps) {
  return (
    <PixelPanel as="article" className={`${styles.card} ${featured ? styles.featured : ""}`}>
      <div className={styles.layout}>
        {project.cover && (
          <ProjectMedia
            title={project.title}
            cover={project.cover}
            video={project.video}
            sizes={featured ? "(max-width: 1024px) 90vw, 480px" : "(max-width: 768px) 90vw, 520px"}
            transitionName={morphNames.media(project.slug)}
          />
        )}

        <div className={styles.body}>
          <p className={styles.kind}>
            <span className={styles.kindBall} aria-hidden="true" />
            {project.kind}
          </p>
          <h3 className={styles.title} style={{ viewTransitionName: morphNames.title(project.slug) }}>
            {project.title}
          </h3>
          <p className={styles.tagline}>{project.tagline}</p>

          {project.metrics.length > 0 && (
            <ul className={styles.metrics}>
              {project.metrics.map((metric) => (
                <li key={metric}>{metric}</li>
              ))}
            </ul>
          )}

          <ul className={styles.stack} aria-label="Built with">
            {project.stack.map((tech) => {
              const match = highlight.includes(tech);
              return (
                <li key={tech} className={match ? styles.chipMatch : undefined}>
                  {tech}
                  {match && <span className={styles.srOnly}> (matches your focus)</span>}
                </li>
              );
            })}
          </ul>

          <ProjectLinks project={project} />
        </div>
      </div>
    </PixelPanel>
  );
}
