import Link from "next/link";
import { getDraftProjects, getGridProjects, getOffGridProjects } from "../../../data/projects";
import type { CiStatus } from "../../../lib/github";
import ProjectGrid from "./ProjectGrid";
import SectionHeading from "../../ui/SectionHeading";
import PixelPanel from "../../ui/PixelPanel";
import SkillDex from "./SkillDex";
import ParallaxSection from "../../scene/ParallaxSection";
import LawnBackdrop from "./LawnBackdrop";
import Seam from "../../scene/Seam";
import styles from "./Projects.module.scss";

/**
 * The projects, then the skills they prove (each skill links to its
 * evidence, mostly these projects). CI status comes from the page
 * (app/page.tsx), so this section never waits on the network.
 */
export default function Projects({ ci }: { ci: Record<string, CiStatus> }) {
  const projects = getGridProjects();
  const offGrid = getOffGridProjects();
  const drafts = getDraftProjects();

  return (
    <ParallaxSection
      id="projects"
      bgClassName={styles.projectsBg}
      background={<LawnBackdrop />}
      overlay={<Seam kind="water-lawn" />}
      contentClassName={styles.projectsContent}
    >
      <div className={styles.inner}>
        <SectionHeading>Selected work</SectionHeading>
        <ProjectGrid projects={projects} ci={ci} />
        <aside className={styles.alsoBuilding} aria-label="Also building">
          <p className={styles.alsoTitle}>ALSO BUILDING</p>
          <ul>
            {/* No case study of its own: it's the game the Behavior Tree Editor's
              case study shows, so it links there. */}
            <li>
              <strong>Hold Steadfast</strong>: A co-op horde-defense game in Unity and C#. Its enemy AI runs on the{" "}
              <Link href="/projects/behavior-tree-editor">Behavior Tree Editor</Link>.
            </li>
            {offGrid.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`}>{p.title}</Link>: {p.tagline}
              </li>
            ))}
          </ul>
        </aside>
        <PixelPanel title="Skills, with proof">
          <SkillDex />
        </PixelPanel>
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
