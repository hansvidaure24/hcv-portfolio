import fs from "fs";
import path from "path";
import type { FocusId } from "./focus";

export type ProjectLink = {
  label: "Live demo" | "Live site" | "Code" | "Write-up" | "Release";
  href: string;
};

export type Project = {
  slug: string;
  title: string;
  kind: "Side project" | "Work" | "Client" | "Game" | "Dev tool";
  /** One-line outcome shown on the card and under the case-study title. */
  tagline: string;
  role?: string;
  /** At most five: the stack chips on the card. */
  stack: string[];
  /** At most three proof points on the card. */
  metrics: string[];
  cover?: { src: string; alt: string; width: number; height: number };
  /** Demo clip. Desktop plays it muted while on screen; phones and reduced motion get a Play button. */
  video?: { src: string };
  links: ProjectLink[];
  featured?: boolean;
  /** How relevant this project is to each "Choose your focus" option (higher first; missing = not a match). */
  focus?: Partial<Record<Exclude<FocusId, "all">, number>>;
  /** Base-stat bars on the case study, only for numbers with a real maximum. */
  stats?: { label: string; value: number; max: number }[];
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
    video: { src: "/projects/sliceofpie/demo.mp4" },
    links: [
      { label: "Live demo", href: "https://slice-of-pie-xi.vercel.app" },
      { label: "Code", href: "https://github.com/hansvidaure24/SliceOfPie" },
      {
        label: "Write-up",
        href: "https://github.com/hansvidaure24/SliceOfPie/blob/main/docs/ios-pwa-launch-bug.md",
      },
    ],
    featured: true,
    focus: { fullstack: 3, dotnet: 1 },
    stats: [
      { label: "Lighthouse performance", value: 99, max: 100 },
      { label: "Lighthouse accessibility", value: 100, max: 100 },
      { label: "Receipts read right: PaddleOCR", value: 16, max: 16 },
      { label: "Receipts read right: Tesseract.js", value: 4, max: 16 },
    ],
    published: true,
  },
  {
    slug: "behavior-tree-editor",
    title: "Behavior Tree Editor",
    kind: "Dev tool",
    tagline:
      "A visual editor, replay debugger and Unity runtime for game AI. It runs the enemy AI in Hold Steadfast, my co-op horde-defense game.",
    role: "Solo: design, build and test",
    stack: ["JavaScript + JSDoc", "Canvas 2D", "Tauri (Rust)", "Unity / C#", "GitHub Actions"],
    metrics: [
      "14 enemy trees proven to match the game's runtime",
      "Saved edits reach a running game within a second",
      "2.5 MB desktop installer, same code in the browser",
    ],
    cover: {
      src: "/projects/behavior-tree-editor/cover.jpg",
      alt: "Top: the Gravewarden's behavior tree in the editor, its Halberd Swing branch lit up during a replay. Bottom: the Gravewarden fighting players in Hold Steadfast.",
      width: 1280,
      height: 800,
    },
    video: { src: "/projects/behavior-tree-editor/demo.mp4" },
    links: [
      { label: "Live demo", href: "https://hansvidaure24.github.io/Behavior-Tree-Editor/editor/" },
      { label: "Code", href: "https://github.com/hansvidaure24/Behavior-Tree-Editor" },
    ],
    focus: { games: 3, dotnet: 2, fullstack: 1 },
    stats: [{ label: "Enemy trees matching the game runtime", value: 14, max: 14 }],
    published: true,
  },
  {
    slug: "pocket-quest",
    title: "Pocket Quest",
    kind: "Game",
    tagline:
      "A co-op tactics RPG for 2–4 players: one screen hosts, everyone else scans a QR code and plays on their phone.",
    role: "Solo: design, build and test",
    stack: ["JavaScript", "HTML5 Canvas", "WebRTC (PeerJS)", "Cloudflare Workers", "Playwright"],
    metrics: [
      "No installs or accounts: scan and play",
      "3 network transports; dropped phones rejoin",
      "Bots play a full campaign in CI on every push",
    ],
    cover: {
      src: "/projects/pocket-quest/cover.jpg",
      alt: "Pocket Quest combat: four heroes fighting skeletons and slimes on a hex board, with a Double Kill callout",
      width: 1280,
      height: 800,
    },
    video: { src: "/projects/pocket-quest/demo.mp4" },
    links: [
      { label: "Live demo", href: "https://hansvidaure24.github.io/Pocket-Quest/" },
      { label: "Code", href: "https://github.com/hansvidaure24/Pocket-Quest" },
    ],
    focus: { fullstack: 2, games: 2 },
    published: true,
  },
  {
    slug: "fiserv-draft-a",
    title: "Fiserv draft A",
    kind: "Work",
    tagline:
      "Unpublished draft.",
    role: "Software Development Engineer, Fiserv",
    stack: ["C#", "ASP.NET", "SQL"],
    metrics: [],
    links: [],
    // Publish once the write-up is cleared against Fiserv's disclosure policy.
    focus: { dotnet: 4, fullstack: 2 },
    published: false,
  },
  {
    slug: "fiserv-draft-b",
    title: "Fiserv draft B",
    kind: "Work",
    tagline:
      "Unpublished draft.",
    role: "Software Development Engineer, Fiserv",
    stack: ["C#", ".NET", "NuGet"],
    metrics: [],
    links: [],
    // Publish once the write-up is cleared against Fiserv's disclosure policy.
    focus: { dotnet: 4 },
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
    focus: { fullstack: 2 },
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
    // The repo (hansvidaure24/Nebula) is private, so a Code link 404s for visitors.
    // Add { label: "Code", href: "https://github.com/hansvidaure24/Nebula" } back if it goes public.
    links: [],
    focus: { games: 3, dotnet: 3 },
    published: true,
  },
];

export function getPublishedProjects(): Project[] {
  const published = PROJECTS.filter((p) => p.published);
  return [...published.filter((p) => p.featured), ...published.filter((p) => !p.featured)];
}

/** In `next dev` only, drafts get a case-study page too, so they can be reviewed before publishing. */
export const SHOW_DRAFTS = process.env.NODE_ENV === "development";

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug && (p.published || SHOW_DRAFTS));
}

/** Drafts, for the dev-only preview list. Always empty in production builds. */
export function getDraftProjects(): Project[] {
  return SHOW_DRAFTS ? PROJECTS.filter((p) => !p.published) : [];
}

/** The long-form case study, kept in content/projects so it isn't served raw from public/. */
export function getProjectBody(slug: string): string {
  const file = path.join(process.cwd(), "content", "projects", `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
}
