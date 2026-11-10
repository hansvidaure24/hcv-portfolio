// "Choose your focus" on the Work section: what a recruiter is hiring for.
// Plain data with no Node imports, so the client-side grid can read it.

import { DEX } from "./dex";

export type FocusId = "all" | "fullstack" | "dotnet" | "games";

export const FOCUSES: { id: FocusId; label: string; said: string }[] = [
  { id: "all", label: "All", said: "Showing every project." },
  { id: "fullstack", label: "Full-stack", said: "Full-stack picked! Web apps and tools first." },
  { id: "dotnet", label: "C# / .NET & security", said: "C# / .NET picked! C# work first." },
  { id: "games", label: "Game dev", said: "Game dev picked! Games and game AI first." },
];

/**
 * Stack chips that count as a match for each focus (highlighted on the cards):
 * every name and alias of the Skill Dex entries tagged with that focus.
 * Change a skill's focus in app/data/dex.ts, not here.
 */
function chipsFor(focus: Exclude<FocusId, "all">): string[] {
  return DEX.filter((entry) => entry.focus.includes(focus)).flatMap((entry) => [entry.name, ...entry.aliases]);
}

export const FOCUS_STACK: Record<Exclude<FocusId, "all">, string[]> = {
  fullstack: chipsFor("fullstack"),
  dotnet: chipsFor("dotnet"),
  games: chipsFor("games"),
};

export const FOCUS_STORAGE_KEY = "project-focus";
