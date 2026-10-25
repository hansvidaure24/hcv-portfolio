import { getPublishedProjects } from "../../../data/projects";
import ProjectCard from "./ProjectCard";
import ProjectsSign from "./ProjectsSign";
import ParallaxSection from "../../scene/ParallaxSection";
import styles from "./Projects.module.scss";

export default function Projects() {
  const projects = getPublishedProjects();
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

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
      </div>
    </ParallaxSection>
  );
}
