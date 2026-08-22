// Shared origin used by metadata, sitemap, robots, and JSON-LD.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hans-portfolio-one.vercel.app").replace(/\/+$/, "");

export const SITE_NAME = "HCV Portfolio";
export const SITE_DESCRIPTION =
  "Portfolio website built with Next.js, TypeScript, and Tailwind CSS. Showcases projects, skills, and contact information along with a clean design, fast performance, and mobile-friendly experience.";
