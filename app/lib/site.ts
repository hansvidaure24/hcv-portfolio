// Shared origin used by metadata, sitemap, robots, and JSON-LD.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hans-portfolio-one.vercel.app").replace(/\/+$/, "");

export const SITE_NAME = "Hans Vidaure — Full-Stack Software Engineer";
export const SITE_DESCRIPTION =
  "Full-stack engineer at Fiserv building online banking features in C#/.NET, React and SQL. Projects, case studies and resume.";

export const CONTACT_EMAIL = "contact@hansvidaure.dev";
export const RESUME_URL = "/resume/hcv-resume.pdf";

/** What the site's link-preview card says, for its alt text. */
export const SITE_CARD_ALT = "Hans Chandler Vidaure — Full-Stack Software Engineer";
