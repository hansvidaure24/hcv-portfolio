import { dexEntryFor } from "../../../data/dex";
import type { Project } from "../../../data/projects";
import { decodeMatchup, encodeMatchup, matchedChipNames, projectScore, summaryLine, type Matchup } from "../../../lib/matchup";

/** A matchup turned into what the project grid needs; plain data, so the grid doesn't load the matcher. */
export type AppliedMatchup = {
  matchup: Matchup;
  /** Project slugs, most relevant first; ties keep the original order. */
  order: string[];
  /** Stack chip names to highlight. */
  chips: string[];
  summary: string;
  /** The ?match= value: skill ids only. */
  link: string;
};

export function applyMatchup(matchup: Matchup, projects: Project[]): AppliedMatchup {
  const order = projects
    .map((project, index) => ({ slug: project.slug, index, score: projectScore(project, matchup, dexEntryFor) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((p) => p.slug);
  return { matchup, order, chips: matchedChipNames(matchup), summary: summaryLine(matchup), link: encodeMatchup(matchup) };
}

/** From a shared link's ?match= value; null if it holds nothing usable. */
export function applyFromLink(value: string, projects: Project[]): AppliedMatchup | null {
  const matchup = decodeMatchup(value);
  return matchup ? applyMatchup(matchup, projects) : null;
}
