// "Choose your focus" on the Work section: what a recruiter is hiring for.
// Plain data with no Node imports, so the client-side grid can read it.

export type FocusId = "all" | "fullstack" | "dotnet" | "games";

export const FOCUSES: { id: FocusId; label: string; said: string }[] = [
  { id: "all", label: "All", said: "Showing every project." },
  { id: "fullstack", label: "Full-stack", said: "Full-stack picked! Web apps and tools first." },
  { id: "dotnet", label: "C# / .NET & security", said: "C# / .NET picked! C# work first." },
  { id: "games", label: "Game tools", said: "Game tools picked! Game AI and games first." },
];

/** Stack chips that count as a match for each focus (highlighted on the cards). */
export const FOCUS_STACK: Record<Exclude<FocusId, "all">, string[]> = {
  fullstack: [
    "TypeScript",
    "JavaScript",
    "JavaScript + JSDoc",
    "React 19",
    "Next.js 16",
    "PWA / Workbox",
    "Playwright",
    "GitHub Actions",
    "Cloudflare Workers",
    "WebRTC (PeerJS)",
    "SCSS Modules",
    "EmailJS",
    "Tauri (Rust)",
    "ONNX Runtime OCR",
  ],
  dotnet: ["C#", ".NET", "ASP.NET", "SQL", "NuGet", "Unity / C#"],
  games: ["Unity 6", "Unity / C#", "C#", "Netcode for GameObjects", "URP", "HTML5 Canvas", "Canvas 2D", "WebRTC (PeerJS)"],
};

export const FOCUS_STORAGE_KEY = "project-focus";
