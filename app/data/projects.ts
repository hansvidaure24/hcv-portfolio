import fs from "fs";
import path from "path";

export type ProjectLink = {
  label: "Live demo" | "Live site" | "Code" | "Write-up" | "Release";
  href: string;
};

export type Project = {
  slug: string;
  title: string;
  kind: "Side project" | "Work" | "Client" | "Game";
  /** One-line outcome shown on the card and under the case-study title. */
  tagline: string;
  role?: string;
  /** At most five: the stack chips on the card. */
  stack: string[];
  /** At most three proof points on the card. */
  metrics: string[];
  cover?: { src: string; alt: string; width: number; height: number };
  /** Plays in place of the cover. Small clips autoplay in view; large ones wait for a click. */
  video?: { src: string; autoplay?: boolean };
  links: ProjectLink[];
  featured?: boolean;
  /** Drafts are hidden from the grid and their case-study page returns 404. */
  published: boolean;
};

// Display order: the featured project first, then the rest in this order.
const PROJECTS: Project[] = [
  {
    slug: "sliceofpie",
    title: "SliceOfPie",
    kind: "Side project",
    tagline: "Split a restaurant bill from a photo of the receipt, fully offline in the browser.",
    role: "Solo: design, build and test",
    stack: ["TypeScript", "PWA / Workbox", "ONNX Runtime OCR", "Playwright", "GitHub Actions"],
    metrics: ["99 Lighthouse mobile performance", "245 tests on every push", "16/16 test receipts read correctly"],
    cover: {
      src: "/projects/sliceofpie/cover.jpg",
      alt: "Two SliceOfPie screens: assigning receipt items to people, and the bill total with a pie chart of each share",
      width: 1200,
      height: 1200,
    },
    video: { src: "/projects/sliceofpie/demo.mp4", autoplay: true },
    links: [
      { label: "Live demo", href: "https://slice-of-pie-xi.vercel.app" },
      { label: "Code", href: "https://github.com/hansvidaure24/SliceOfPie" },
      {
        label: "Write-up",
        href: "https://github.com/hansvidaure24/SliceOfPie/blob/main/docs/ios-pwa-launch-bug.md",
      },
    ],
    featured: true,
    published: true,
  },
  {
    slug: "fiserv-concurrency",
    title: "Concurrency fixes across five banking cores",
    kind: "Work",
    tagline:
      "Found and removed shared-state defects in a multi-account download feature on Fiserv's online banking platform.",
    role: "Software Development Engineer, Fiserv",
    stack: ["C#", "ASP.NET", "SQL"],
    metrics: ["5 banking cores, one shared code path", "Thread-safety and cache-isolation defects eliminated"],
    links: [],
    // Publish once the write-up is cleared against Fiserv's disclosure policy.
    published: false,
  },
  {
    slug: "rjn-visuals",
    title: "RJN Visuals",
    kind: "Client",
    tagline: "A video-heavy portfolio and booking site for a photography and videography studio.",
    role: "Solo: design and build for the studio",
    stack: ["Next.js 16", "React 19", "TypeScript", "SCSS Modules", "EmailJS"],
    metrics: ["Live client site", "Case studies with YouTube and Instagram embeds"],
    cover: {
      src: "/projects/rjn-visuals/cover.jpg",
      alt: "RJN Visuals home page: a camera operator filming an interview in a classroom",
      width: 800,
      height: 506,
    },
    links: [
      { label: "Live site", href: "https://rjn-portfolio.vercel.app" },
      { label: "Code", href: "https://github.com/hansvidaure24/rjn-portfolio" },
    ],
    published: true,
  },
  {
    slug: "nebula",
    title: "Wakebound",
    kind: "Game",
    tagline: "A souls-like action RPG with online co-op, built solo in Unity 6 and C#.",
    role: "Solo: design and programming",
    stack: ["Unity 6", "C#", "Netcode for GameObjects", "URP"],
    metrics: ["~58k lines of C# across 329 scripts", "Host/client online co-op", "17 data-driven AI states"],
    cover: {
      src: "/projects/nebula/cover.jpg",
      alt: "Wakebound gameplay: an armored skeleton with a sword and shield in a foggy dungeon",
      width: 1280,
      height: 720,
    },
    video: { src: "/projects/nebula/demo.mp4" },
    links: [{ label: "Code", href: "https://github.com/hansvidaure24/Nebula" }],
    published: true,
  },
];

export function getPublishedProjects(): Project[] {
  const published = PROJECTS.filter((p) => p.published);
  return [...published.filter((p) => p.featured), ...published.filter((p) => !p.featured)];
}

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug && p.published);
}

/** The long-form case study, kept in content/projects so it isn't served raw from public/. */
export function getProjectBody(slug: string): string {
  const file = path.join(process.cwd(), "content", "projects", `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
}
