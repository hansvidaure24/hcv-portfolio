import Link from "next/link";
import PixelPanel from "../../ui/PixelPanel";
import ProjectMedia from "./ProjectMedia";
import type { Project } from "../../../data/projects";
import styles from "./ProjectCard.module.scss";

export function ProjectLinks({ project, showCaseStudy = true }: { project: Project; showCaseStudy?: boolean }) {
  return (
    <div className={styles.links}>
      {showCaseStudy && (
        <Link href={`/projects/${project.slug}`} className={styles.primaryLink}>
          Case study <span aria-hidden="true">→</span>
        </Link>
      )}
      {project.links.map((link) => (
        <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
          {link.label} <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

export default function ProjectCard({ project }: { project: Project }) {
  const featured = Boolean(project.featured);

  return (
    <PixelPanel as="article" className={`${styles.card} ${featured ? styles.featured : ""}`}>
      <div className={styles.layout}>
        {project.cover && (
          <ProjectMedia
            title={project.title}
            cover={project.cover}
            video={project.video}
            sizes={featured ? "(max-width: 1024px) 90vw, 480px" : "(max-width: 768px) 90vw, 520px"}
          />
        )}

        <div className={styles.body}>
          <p className={styles.kind}>
            <span className={styles.kindBall} aria-hidden="true" />
            {project.kind}
          </p>
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.tagline}>{project.tagline}</p>

          {project.metrics.length > 0 && (
            <ul className={styles.metrics}>
              {project.metrics.map((metric) => (
                <li key={metric}>{metric}</li>
              ))}
            </ul>
          )}

          <ul className={styles.stack} aria-label="Built with">
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>

          <ProjectLinks project={project} />
        </div>
      </div>
    </PixelPanel>
  );
}
