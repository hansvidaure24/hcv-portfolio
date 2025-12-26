"use client";
import dynamic from "next/dynamic";
import type { Project } from "../app/projects-data";

const ProjectsSlideshow = dynamic(() => import("./ProjectsSlideshow"), { ssr: false });

export default function ProjectsSlideshowClient({ projects }: { projects: Project[] }) {
  return <ProjectsSlideshow projects={projects} />;
}