import Link from "next/link";
import { getDraftProjects, getPublishedProjects } from "../../../data/projects";
import ProjectGrid from "./ProjectGrid";
import SectionHeading from "../../ui/SectionHeading";
import ParallaxSection from "../../scene/ParallaxSection";
import styles from "./Projects.module.scss";

export default function Projects() {
  const projects = getPublishedProjects();
  const drafts = getDraftProjects();

  return (
    <ParallaxSection id="projects" bgClassName={styles.projectsBg} contentClassName={styles.projectsContent}>
      <div className={styles.inner}>
        <SectionHeading>Selected work</SectionHeading>
        <ProjectGrid projects={projects} />
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
