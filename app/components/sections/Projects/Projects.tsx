import Link from "next/link";
import { getDraftProjects, getGridProjects, getOffGridProjects } from "../../../data/projects";
import type { CiStatus } from "../../../lib/github";
import ProjectGrid from "./ProjectGrid";
import SectionHeading from "../../ui/SectionHeading";
import ParallaxSection from "../../scene/ParallaxSection";
import styles from "./Projects.module.scss";

/** CI status comes from the page (app/page.tsx), so this section never waits on the network. */
export default function Projects({ ci }: { ci: Record<string, CiStatus> }) {
  const projects = getGridProjects();
  const offGrid = getOffGridProjects();
  const drafts = getDraftProjects();

  return (
    <ParallaxSection id="projects" bgClassName={styles.projectsBg} contentClassName={styles.projectsContent}>
      <div className={styles.inner}>
        <SectionHeading>Selected work</SectionHeading>
        <ProjectGrid projects={projects} ci={ci} />
        {offGrid.length > 0 && (
          <aside className={styles.alsoBuilding} aria-label="Also building">
            <p className={styles.alsoTitle}>ALSO BUILDING</p>
            <ul>
              {offGrid.map((p) => (
                <li key={p.slug}>
                  <Link href={`/projects/${p.slug}`}>{p.title}</Link>: {p.tagline}
                </li>
              ))}
            </ul>
          </aside>
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
