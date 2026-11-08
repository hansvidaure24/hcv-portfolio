import type { MetadataRoute } from "next";
import { getNotes } from "./data/notes";
import { getPublishedProjects } from "./data/projects";
import { SITE_URL } from "./lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/resume`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...getPublishedProjects().map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${SITE_URL}/notes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...getNotes()
      .filter((note) => note.published)
      .map((note) => ({
        url: `${SITE_URL}/notes/${note.slug}`,
        lastModified: new Date(note.date),
        changeFrequency: "yearly" as const,
        priority: 0.6,
      })),
  ];
}
