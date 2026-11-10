/**
 * The Skill Dex: every skill on the site, described once, with its proof.
 *
 * It feeds the SKILL DEX panel under Work, the links on project stack chips and
 * case-study stack lines, and the "Choose your focus" highlights (focus.ts).
 * Type Matchup (Phase 10) will match job posts against `aliases`.
 *
 * Rules:
 * - Every entry needs at least one piece of evidence that a visitor can
 *   follow: a case study, the resume's Fiserv section, a repo or a live app.
 *   A skill with no evidence isn't listed.
 * - CAUGHT: used at Fiserv or in a live or public project. SEEN: only used in
 *   training, or in a project still in development with a private repo.
 * - `aliases` are the other names a job post or a stack chip uses. Every
 *   project stack chip must match one entry's name or alias exactly.
 * - Plain data only (no Node imports): client components read it.
 */

import type { FocusId } from "./focus";

export type DexStatus = "caught" | "seen";

export type DexType = "LANGUAGE" | "WEB" | "BACKEND" | "DATA" | "TESTING" | "DEVOPS" | "GAMES" | "PRACTICE";

export type DexEvidence = {
  /** Where it happened: "Fiserv", a project's title, "This site". */
  source: string;
  text: string;
  href: string;
};

export type DexEntry = {
  id: string;
  name: string;
  type: DexType;
  status: DexStatus;
  aliases: string[];
  /** Which "Choose your focus" picks highlight this skill's chips. */
  focus: Exclude<FocusId, "all">[];
  evidence: DexEvidence[];
};

const WORK = "/resume#resume-experience";
const FISERV = "Fiserv";
const TRAINEE = "Fiserv trainee";
const SITE = { source: "This site", href: "https://github.com/hansvidaure24/hcv-portfolio" };
const P = {
  sliceofpie: { source: "SliceOfPie", href: "/projects/sliceofpie" },
  bte: { source: "Behavior Tree Editor", href: "/projects/behavior-tree-editor" },
  pocketQuest: { source: "Pocket Quest", href: "/projects/pocket-quest" },
  rjn: { source: "RJN Visuals", href: "/projects/rjn-visuals" },
  wakebound: { source: "Wakebound", href: "/projects/wakebound" },
};

/**
 * What a full-stack C# / .NET hiring manager looks for first, plus Unity and
 * game AI for game studios: shown by default in the skills panel under Work,
 * with the rest one click away ("Show all"). Every entry stays in DEX, so
 * Type Matchup, chip links and llms.txt keep them all.
 */
export const CORE_DEX_IDS = [
  "csharp",
  "dotnet",
  "aspnet",
  "sql",
  "react",
  "rest",
  "appsec",
  "concurrency",
  "typescript",
  "playwright",
  "unittest",
  "ci",
  "unity",
  "gameai",
];

/** How the site says each status (the data keeps "caught" / "seen"). */
export const STATUS_LABEL: Record<DexStatus, string> = { caught: "USED", seen: "LEARNED" };
export const STATUS_MEANING: Record<DexStatus, string> = {
  caught: "used at Fiserv or in a live or public project",
  seen: "only in training, or in a game still in development",
};

// Ordered like a dex: what he does at work first, then the rest.
export const DEX: DexEntry[] = [
  {
    id: "csharp",
    name: "C#",
    type: "LANGUAGE",
    status: "caught",
    aliases: ["C Sharp", "CSharp", "Unity / C#"],
    focus: ["dotnet", "games"],
    evidence: [
      { source: FISERV, text: "Online banking features and REST APIs in C#", href: WORK },
      { ...P.bte, text: "The Unity runtime in C#, with 31 EditMode tests" },
      { ...P.wakebound, text: "About 58,000 lines of C# across 329 scripts" },
    ],
  },
  {
    id: "dotnet",
    name: ".NET",
    type: "BACKEND",
    status: "caught",
    aliases: ["dotnet", ".NET Core", ".NET Framework", "NuGet"],
    focus: ["dotnet"],
    evidence: [
      { source: FISERV, text: "Online banking features in C# and .NET", href: WORK },
    ],
  },
  {
    id: "aspnet",
    name: "ASP.NET",
    type: "BACKEND",
    status: "caught",
    aliases: ["ASP.NET Core", "ASP.NET MVC", "ASP.NET Web API"],
    focus: ["dotnet", "fullstack"],
    evidence: [
      { source: FISERV, text: "Online banking features for retail and business customers in ASP.NET", href: WORK },
    ],
  },
  {
    id: "sql",
    name: "SQL",
    type: "DATA",
    status: "caught",
    aliases: ["T-SQL", "SQL Server", "MySQL", "relational databases"],
    focus: ["dotnet", "fullstack"],
    evidence: [
      { source: FISERV, text: "SQL for online banking features", href: WORK },
      { source: TRAINEE, text: "MySQL behind a Spring Boot REST API in the capstone", href: WORK },
    ],
  },
  {
    id: "react",
    name: "React",
    type: "WEB",
    status: "caught",
    aliases: ["React 19", "React.js", "ReactJS"],
    focus: ["fullstack"],
    evidence: [
      { source: FISERV, text: "React UI for online banking features", href: WORK },
      { ...P.rjn, text: "React 19 on a live client site" },
      { ...SITE, text: "React 19 with Next.js" },
    ],
  },
  {
    id: "rest",
    name: "REST APIs",
    type: "BACKEND",
    status: "caught",
    aliases: ["REST", "REST API", "RESTful APIs", "REST API design", "Web APIs"],
    focus: ["dotnet", "fullstack"],
    evidence: [
      { source: FISERV, text: "REST APIs in C# and ASP.NET", href: WORK },
      { source: TRAINEE, text: "A Spring Boot REST API for the five-month capstone", href: WORK },
    ],
  },
  {
    id: "appsec",
    name: "Application security",
    type: "PRACTICE",
    status: "caught",
    aliases: ["AppSec", "secure coding", "secure code review"],
    focus: ["dotnet"],
    // Public projects only: statements about an employer's security work need its approval.
    evidence: [
      { ...P.sliceofpie, text: "Ships with a strict Content-Security-Policy and keeps every receipt on the device" },
      { ...SITE, text: "A contact form that verifies bots on the server and only ever emails its owner" },
    ],
  },
  {
    id: "concurrency",
    name: "Concurrency",
    type: "PRACTICE",
    status: "caught",
    aliases: ["race conditions"],
    focus: ["dotnet"],
    evidence: [
      { ...P.pocketQuest, text: "Host-authoritative multiplayer: simultaneous inputs resolve together, and dropped phones keep their slot" },
      { ...P.bte, text: "Hot reload that writes to a temp file and renames it, so a running game never reads half a file" },
    ],
  },
  {
    id: "incidents",
    name: "Incident response",
    type: "PRACTICE",
    status: "caught",
    aliases: ["production support", "root-cause analysis", "runbooks", "JIRA", "Confluence"],
    focus: ["dotnet"],
    evidence: [
      { source: FISERV, text: "Production support from triage to resolution", href: WORK },
      { source: FISERV, text: "Runbooks for the team", href: WORK },
    ],
  },
  {
    id: "git",
    name: "Git",
    type: "DEVOPS",
    status: "caught",
    aliases: ["GitHub", "version control", "pull requests", "code review"],
    focus: [],
    evidence: [
      { source: FISERV, text: "Peer-reviewed feature work on a shared codebase", href: WORK },
      { source: "GitHub", text: "Public repos with CI on every push", href: "https://github.com/hansvidaure24" },
    ],
  },
  {
    id: "typescript",
    name: "TypeScript",
    type: "LANGUAGE",
    status: "caught",
    aliases: ["TS"],
    focus: ["fullstack"],
    evidence: [
      { ...P.sliceofpie, text: "A TypeScript PWA with 200+ tests on every push" },
      { ...P.rjn, text: "TypeScript on a live Next.js client site" },
      { ...SITE, text: "Next.js and TypeScript, Lighthouse 100" },
    ],
  },
  {
    id: "javascript",
    name: "JavaScript",
    type: "LANGUAGE",
    status: "caught",
    aliases: ["JS", "JavaScript + JSDoc", "ES modules", "ECMAScript", "JSDoc"],
    focus: ["fullstack"],
    evidence: [
      { ...P.bte, text: "About 10,000 lines of JavaScript, type-checked by tsc through JSDoc, with no framework" },
      { ...P.pocketQuest, text: "A co-op tactics RPG in plain JavaScript (ES modules)" },
    ],
  },
  {
    id: "nextjs",
    name: "Next.js",
    type: "WEB",
    status: "caught",
    aliases: ["Next.js 16", "NextJS", "App Router"],
    focus: ["fullstack"],
    evidence: [
      { ...P.rjn, text: "Next.js 16 App Router on a live client site" },
      { ...SITE, text: "Next.js 16 App Router, with live GitHub data refreshed daily" },
    ],
  },
  {
    id: "css",
    name: "HTML & CSS",
    type: "WEB",
    status: "caught",
    aliases: ["HTML", "HTML5", "CSS", "CSS3", "Sass", "SCSS", "SCSS Modules", "CSS Modules", "Tailwind", "Tailwind CSS", "responsive design"],
    focus: ["fullstack"],
    evidence: [
      { ...SITE, text: "One design system of tokens and Sass mixins behind every panel, from 375px phones up" },
      { ...P.rjn, text: "SCSS Modules on a video-heavy client site" },
    ],
  },
  {
    id: "perf",
    name: "Web performance",
    type: "PRACTICE",
    status: "caught",
    aliases: ["performance optimization", "Lighthouse", "Core Web Vitals", "pagination", "Web Workers"],
    focus: ["fullstack"],
    evidence: [
      { ...P.sliceofpie, text: "99 Lighthouse mobile performance with ~25 KB of startup JavaScript" },
      { ...SITE, text: "100 mobile Lighthouse performance on the home page, five runs in a row" },
    ],
  },
  {
    id: "a11y",
    name: "Accessibility",
    type: "PRACTICE",
    status: "caught",
    aliases: ["a11y", "axe-core", "screen readers", "keyboard navigation"],
    focus: ["fullstack"],
    evidence: [
      { ...P.sliceofpie, text: "100 Lighthouse accessibility; axe finds no issues on any screen, light or dark" },
      { ...SITE, text: "100 Lighthouse accessibility, full keyboard use and a reduced-motion setting" },
    ],
  },
  {
    id: "pwa",
    name: "PWAs & offline",
    type: "WEB",
    status: "caught",
    aliases: ["PWA / Workbox", "PWA", "PWAs", "progressive web apps", "Workbox", "service workers", "IndexedDB", "offline-first"],
    focus: ["fullstack"],
    evidence: [
      { ...P.sliceofpie, text: "Installs like an app and scans receipts offline (Workbox service worker, IndexedDB)" },
      { source: "Field note", text: "Debugging an iPhone PWA bug I couldn't reproduce", href: "/notes/ios-pwa-launch-bug" },
    ],
  },
  {
    id: "playwright",
    name: "Playwright",
    type: "TESTING",
    status: "caught",
    aliases: ["end-to-end testing", "E2E testing", "browser testing"],
    focus: ["fullstack"],
    evidence: [
      { ...P.sliceofpie, text: "Playwright and axe-core end-to-end tests on every push" },
      { ...P.pocketQuest, text: "Bots play a full campaign in headless Chromium on every push" },
    ],
  },
  {
    id: "unittest",
    name: "Unit testing",
    type: "TESTING",
    status: "caught",
    aliases: ["Vitest", "unit tests", "automated testing", "Unity Test Framework", "EditMode tests", "NUnit", "test automation", "automated tests"],
    focus: ["fullstack", "dotnet"],
    evidence: [
      { ...P.sliceofpie, text: "200+ Vitest and Playwright tests on every push" },
      { ...P.bte, text: "31 EditMode tests, and shared scenarios run through both the C# and JavaScript runtimes" },
      { ...P.pocketQuest, text: "Combat and data tests on Node's built-in test runner" },
    ],
  },
  {
    id: "ci",
    name: "GitHub Actions",
    type: "DEVOPS",
    status: "caught",
    aliases: ["CI/CD", "CI", "continuous integration", "Lighthouse CI"],
    focus: ["fullstack"],
    evidence: [
      { ...P.sliceofpie, text: "Tests and Lighthouse CI on every push" },
      { ...P.bte, text: "CI on every push, and the web version deployed to GitHub Pages" },
      { ...P.pocketQuest, text: "The bot self-play campaign runs in CI" },
    ],
  },
  {
    id: "deploy",
    name: "Deployment",
    type: "DEVOPS",
    status: "caught",
    aliases: ["Vercel", "GitHub Pages", "static hosting"],
    focus: ["fullstack"],
    evidence: [
      { ...SITE, text: "Deployed on Vercel from a preview build, then main" },
      { source: "SliceOfPie", text: "Live on Vercel", href: "https://slice-of-pie-xi.vercel.app" },
      { source: "Behavior Tree Editor", text: "Live on GitHub Pages", href: "https://hansvidaure24.github.io/Behavior-Tree-Editor/editor/" },
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare Workers",
    type: "BACKEND",
    status: "caught",
    aliases: ["Cloudflare", "Durable Objects", "serverless", "edge functions"],
    focus: ["fullstack"],
    evidence: [{ ...P.pocketQuest, text: "A WebSocket relay on a Cloudflare Worker with Durable Objects, on the free tier" }],
  },
  {
    id: "realtime",
    name: "WebRTC & WebSockets",
    type: "WEB",
    status: "caught",
    aliases: ["WebRTC (PeerJS)", "WebRTC", "PeerJS", "WebSockets", "peer-to-peer", "real-time", "multiplayer"],
    focus: ["fullstack", "games"],
    evidence: [
      { ...P.pocketQuest, text: "Host-authoritative multiplayer over three fallback transports; dropped phones rejoin" },
      { ...P.pocketQuest, text: "Players join by scanning a QR code, with no install or account" },
    ],
  },
  {
    id: "canvas",
    name: "Canvas",
    type: "WEB",
    status: "caught",
    aliases: ["Canvas 2D", "HTML5 Canvas", "2D graphics"],
    focus: ["games"],
    evidence: [
      { ...P.bte, text: "One Canvas 2D node graph that skips anything off screen" },
      { ...P.pocketQuest, text: "Hex-board battles drawn on HTML5 Canvas" },
    ],
  },
  {
    id: "tauri",
    name: "Tauri",
    type: "WEB",
    status: "caught",
    aliases: ["Tauri (Rust)", "desktop apps", "WebView2"],
    focus: ["fullstack"],
    evidence: [{ ...P.bte, text: "A 2.5 MB desktop installer with Tauri v2, from the same code as the web version" }],
  },
  {
    id: "onnx",
    name: "ONNX Runtime",
    type: "WEB",
    status: "caught",
    aliases: ["ONNX Runtime OCR", "ONNX Runtime Web", "ONNX", "PaddleOCR", "OCR", "in-browser ML"],
    focus: ["fullstack"],
    evidence: [
      { ...P.sliceofpie, text: "PaddleOCR on ONNX Runtime Web in a Web Worker: 16 of 16 test receipts, vs 4 of 16 for Tesseract.js" },
    ],
  },
  {
    id: "email",
    name: "Email delivery",
    type: "BACKEND",
    status: "caught",
    aliases: ["EmailJS", "Resend", "transactional email", "contact forms"],
    focus: ["fullstack"],
    evidence: [
      { ...P.rjn, text: "The client site's contact form, through EmailJS" },
      { ...SITE, text: "Contact form through Resend, with validation and rate limiting" },
    ],
  },
  {
    id: "python",
    name: "Python",
    type: "LANGUAGE",
    status: "caught",
    aliases: [],
    focus: [],
    evidence: [{ ...P.bte, text: "A Python validator CLI for tree files, plus a small tested Python server" }],
  },
  {
    id: "unity",
    name: "Unity",
    type: "GAMES",
    status: "caught",
    aliases: ["Unity 6", "Unity3D", "ScriptableObjects"],
    focus: ["games"],
    evidence: [
      { ...P.bte, text: "A C# runtime that runs behavior trees in Unity, with sub-second hot reload from the editor" },
      { ...P.wakebound, text: "A souls-like action RPG, built solo in Unity 6" },
    ],
  },
  {
    id: "gameai",
    name: "Game AI",
    type: "GAMES",
    status: "caught",
    aliases: ["behavior trees", "behaviour trees", "state machines", "finite state machines", "FSM"],
    focus: ["games"],
    evidence: [
      { ...P.bte, text: "A visual editor, replay debugger and runtime for game AI; 13 of 14 enemy trees run through both runtimes, every command compared" },
      { ...P.wakebound, text: "17 data-driven AI states, built as ScriptableObject assets" },
    ],
  },
  {
    id: "netcode",
    name: "Netcode for GameObjects",
    type: "GAMES",
    status: "seen",
    aliases: ["NGO", "Unity Netcode"],
    focus: ["games"],
    evidence: [
      {
        ...P.wakebound,
        text: "Drop-in host/client co-op: each client owns its character, the host runs every enemy (in development, private repo)",
      },
    ],
  },
  {
    id: "urp",
    name: "URP",
    type: "GAMES",
    status: "seen",
    aliases: ["Universal Render Pipeline"],
    focus: ["games"],
    evidence: [{ ...P.wakebound, text: "Rendered with URP (in development, private repo)" }],
  },
  {
    id: "java",
    name: "Java & Spring Boot",
    type: "BACKEND",
    status: "seen",
    aliases: ["Java", "Spring Boot", "Spring Framework"],
    focus: [],
    evidence: [{ source: TRAINEE, text: "A full-stack capstone with a Spring Boot REST API, built in five months", href: WORK }],
  },
];

const BY_NAME = new Map<string, DexEntry>();
for (const entry of DEX) {
  for (const name of [entry.name, ...entry.aliases]) BY_NAME.set(name.toLowerCase(), entry);
}

/** The dex entry for a skill name as written on the site (a stack chip, say). */
export function dexEntryFor(name: string): DexEntry | undefined {
  return BY_NAME.get(name.trim().toLowerCase());
}

/** The URL fragment that opens an entry in the dex (under Work). */
export const dexHash = (entry: DexEntry) => `#dex-${entry.id}`;
