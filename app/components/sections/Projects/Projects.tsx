import Link from "next/link";
import { getDraftProjects, getPublishedProjects } from "../../../data/projects";
import ProjectCard from "./ProjectCard";
import ProjectsSign from "./ProjectsSign";
import ParallaxSection from "../../scene/ParallaxSection";
import styles from "./Projects.module.scss";

export default function Projects() {
  const projects = getPublishedProjects();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const drafts = getDraftProjects();

  return (
    <ParallaxSection id="projects" bgClassName={styles.projectsBg} contentClassName={styles.projectsContent}>
      <div className={styles.inner}>
        <ProjectsSign />
        {featured.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
        {rest.length > 0 && (
          <div className={styles.grid}>
            {rest.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
        {drafts.length > 0 && (
          <aside className={styles.drafts} aria-label="Draft case studies">
            <p className={styles.draftsTitle}>DRAFTS (dev only, hidden in production)</p>
            <ul>
              {drafts.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`}>{p.title}</Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </ParallaxSection>
  );
}
