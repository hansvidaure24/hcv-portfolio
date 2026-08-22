"use client";
import dynamic from "next/dynamic";
import type { Project } from "../../../data/projects-data";

const ProjectSelectScene = dynamic(() => import("./ProjectSelectScene"), { ssr: false });

export default function ProjectSelectSceneClient({ projects }: { projects: Project[] }) {
  return <ProjectSelectScene projects={projects} />;
}
