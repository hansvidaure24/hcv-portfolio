import Link from "next/link";
import { getDraftProjects, getPublishedProjects } from "../../../data/projects";
import { getCiStatus, repoFromUrl, type CiStatus } from "../../../lib/github";
import ProjectGrid from "./ProjectGrid";
import SectionHeading from "../../ui/SectionHeading";
import ParallaxSection from "../../scene/ParallaxSection";
import styles from "./Projects.module.scss";

/** Each project's latest passing CI run, keyed by slug (projects without one are left out). */
async function getCiBySlug(projects: ReturnType<typeof getPublishedProjects>) {
  const entries = await Promise.all(
    projects.map(async (p) => {
      const repo = repoFromUrl(p.links.find((l) => l.label === "Code")?.href);
      const ci = repo ? await getCiStatus(repo) : null;
      return ci ? ([p.slug, ci] as const) : null;
    })
  );
  return Object.fromEntries(entries.filter((e): e is readonly [string, CiStatus] => e !== null));
}

export default async function Projects() {
  const projects = getPublishedProjects();
  const drafts = getDraftProjects();
  const ci = await getCiBySlug(projects);

  return (
    <ParallaxSection id="projects" bgClassName={styles.projectsBg} contentClassName={styles.projectsContent}>
      <div className={styles.inner}>
        <SectionHeading>Selected work</SectionHeading>
        <ProjectGrid projects={projects} ci={ci} />
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
