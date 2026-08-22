import { getProjects } from "../../../data/projects-data";
import ProjectSelectSceneClient from "./ProjectSelectSceneClient";
import ProjectsSign from "./ProjectsSign";
import ParallaxSection from "../../scene/ParallaxSection";
import styles from "./Projects.module.scss";

export default function Projects() {
  const projects = getProjects();
  return (
    <ParallaxSection
      id="projects"
      bgClassName={styles.projectsBg}
      contentClassName={styles.projectsContent}
      overlay={<ProjectsSign />}
    >
      <div className={styles.sceneWrap}>
        <ProjectSelectSceneClient projects={projects} />
      </div>
    </ParallaxSection>
  );
}
