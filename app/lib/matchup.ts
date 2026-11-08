/**
 * Type Matchup: reads a job post and matches each skill it asks for against
 * the Skill Dex. Plain TypeScript, no AI, no network: it runs in the
 * visitor's browser (and in the MCP endpoint's match_job tool).
 *
 * - Super effective: used at Fiserv (the entry has resume evidence).
 * - Effective: shipped in a project, or seen in training / in development.
 * - Closest experience: a skill from app/data/nearby.ts that isn't in the
 *   dex, shown with the nearest entries instead of a claimed match.
 * Anything it doesn't recognize is left out; the panel says so.
 */
import { DEX, type DexEntry } from "../data/dex";
import { NEARBY, type NearbySkill } from "../data/nearby";
import { CAREER_START } from "../data/now";

export type Section = "required" | "nice";
export type Effect = "super" | "effective" | "closest";

export type MatchRow =
  | { kind: "dex"; id: string; term: string; section: Section; effect: "super" | "effective"; entry: DexEntry }
  | { kind: "nearby"; id: string; term: string; section: Section; effect: "closest"; skill: NearbySkill; closest: DexEntry[] };

export type YearsAsk = { asked: number; has: number; section: Section };

export type Matchup = {
  rows: MatchRow[];
  years: YearsAsk | null;
};

type Target = { kind: "dex"; entry: DexEntry } | { kind: "nearby"; skill: NearbySkill };

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Short all-caps acronyms ("JS", "CI", "AWS") and names that are also English
// words ("React", "Unity", "Swift") only match as written, so "react quickly"
// or "unity of purpose" don't count.
const ENGLISH_WORDS = new Set(["react", "unity", "swift", "rust", "canvas", "ruby", "rails", "angular", "unreal", "bash", "razor"]);
const isCaseSensitive = (alias: string) => /^[A-Z0-9][A-Z0-9+#.]{0,4}$/.test(alias) || ENGLISH_WORDS.has(alias.toLowerCase());

type Pattern = { re: RegExp; target: Target; length: number };

const PATTERNS: Pattern[] = (() => {
  const list: Pattern[] = [];
  const add = (alias: string, target: Target) => {
    // Not glued to a letter, digit or symbol on either side; a trailing "." or
    // "," (end of a sentence) is fine.
    const re = new RegExp(`(?<![\\w+#.])${escape(alias)}(?![\\w+#])`, isCaseSensitive(alias) ? "g" : "gi");
    list.push({ re, target, length: alias.length });
  };
  for (const entry of DEX) for (const alias of [entry.name, ...entry.aliases]) add(alias, { kind: "dex", entry });
  for (const skill of NEARBY) for (const alias of [skill.name, ...skill.aliases]) add(alias, { kind: "nearby", skill });
  // Longest first, so "React Native" claims its words before "React" can.
  return list.sort((a, b) => b.length - a.length);
})();

const DEX_BY_ID = new Map(DEX.map((e) => [e.id, e]));
const NEARBY_BY_ID = new Map(NEARBY.map((s) => [s.id, s]));

const NICE = /nice[- ]to[- ]have|preferred|bonus|\bpluses\b|\ba plus\b|desir(ed|able)|good to have|extra credit|would be great|\bhelpful\b|not required/i;
const REQUIRED = /requirement|required|qualifications?|must[- ]haves?|what you('ll)? (bring|need)|looking for|tech stack|you have|you bring|minimum|basic|skills|experience|about you|who you are|responsibilities|what you('ll)? do|the role/i;
// Sections about the company or the offer: tech named there isn't asked of the candidate.
const IGNORE = /about (us|the company|the team)|who we are|benefits|perks|what we offer|compensation|salary|equal opportunity|our values/i;

/**
 * A short line that names a section ("Requirements:", "## Nice to have",
 * "ABOUT US"), not a requirement itself ("Experience with React").
 */
function headingKind(line: string): "required" | "nice" | "ignore" | null {
  if (/^([-*•]|\d+[.)])\s/.test(line)) return null;
  const hashed = /^#+\s/.test(line);
  const text = line.replace(/^#+\s*/, "").replace(/[*_]/g, "").trim();
  if (!text || text.split(/\s+/).length > 6 || /[.!?]$/.test(text)) return null;
  const looksLikeHeading =
    hashed || text.endsWith(":") || text === text.toUpperCase() || !/\b(with|in|of|using|and|or)\b/i.test(text);
  if (!looksLikeHeading) return null;
  if (IGNORE.test(text)) return "ignore";
  if (NICE.test(text)) return "nice";
  if (REQUIRED.test(text)) return "required";
  return null;
}

/** Whole years of full-time work since the first full-time role. */
export function yearsOfExperience(now = new Date()): number {
  const start = new Date(CAREER_START);
  const months = (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + (now.getUTCMonth() - start.getUTCMonth());
  return Math.floor(months / 12);
}

// "3+ years", "5-7 years", "4 yrs", on a line about experience.
const YEARS = /(\d{1,2})\s*(?:\+|(?:-|–|to)\s*\d{1,2})?\s*\+?\s*(?:years?|yrs?)\b/i;
const YEARS_CONTEXT = /experience|professional|industry|engineering|development/i;

/** Super effective when there's Fiserv evidence; effective otherwise. */
export function effectFor(entry: DexEntry): "super" | "effective" {
  return entry.evidence.some((e) => e.href.startsWith("/resume")) ? "super" : "effective";
}

const EFFECT_ORDER: Record<Effect, number> = { super: 0, effective: 1, closest: 2 };

function sortRows(rows: MatchRow[]): MatchRow[] {
  return rows
    .map((row, index) => ({ row, index }))
    .sort(
      (a, b) =>
        (a.row.section === b.row.section ? 0 : a.row.section === "required" ? -1 : 1) ||
        EFFECT_ORDER[a.row.effect] - EFFECT_ORDER[b.row.effect] ||
        a.index - b.index
    )
    .map((x) => x.row);
}

function rowFor(target: Target, term: string, section: Section): MatchRow {
  if (target.kind === "dex") {
    return { kind: "dex", id: target.entry.id, term, section, effect: effectFor(target.entry), entry: target.entry };
  }
  const closest = target.skill.closest.map((id) => DEX_BY_ID.get(id)).filter((e): e is DexEntry => !!e);
  return { kind: "nearby", id: target.skill.id, term, section, effect: "closest", skill: target.skill, closest };
}

/** Reads a job post. Each skill appears once, as required if any mention is. */
export function matchPost(text: string, now = new Date()): Matchup {
  const found = new Map<string, MatchRow>();
  let section: Section | "ignore" = "required";
  let years: YearsAsk | null = null;

  for (const rawLine of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const heading = headingKind(line);
    if (heading) {
      section = heading;
      continue;
    }
    if (section === "ignore") continue;
    // "Experience with Docker is a plus" is nice to have wherever it sits.
    const lineSection: Section = section === "nice" || NICE.test(line) ? "nice" : "required";

    const yearsMatch = YEARS_CONTEXT.test(line) ? line.match(YEARS) : null;
    if (yearsMatch && (!years || (years.section === "nice" && lineSection === "required"))) {
      years = { asked: Number(yearsMatch[1]), has: yearsOfExperience(now), section: lineSection };
    }

    // Longest aliases claim their characters first.
    const claimed: [number, number][] = [];
    const hits: { start: number; target: Target; term: string }[] = [];
    for (const { re, target } of PATTERNS) {
      re.lastIndex = 0;
      for (const m of line.matchAll(re)) {
        const start = m.index ?? 0;
        const end = start + m[0].length;
        if (claimed.some(([s, e]) => start < e && end > s)) continue;
        claimed.push([start, end]);
        hits.push({ start, target, term: m[0] });
      }
    }
    hits.sort((a, b) => a.start - b.start);

    for (const hit of hits) {
      const id = hit.target.kind === "dex" ? `dex:${hit.target.entry.id}` : `near:${hit.target.skill.id}`;
      const existing = found.get(id);
      if (!existing) found.set(id, rowFor(hit.target, hit.term, lineSection));
      else if (existing.section === "nice" && lineSection === "required") found.set(id, { ...existing, section: "required" });
    }
  }

  return { rows: sortRows([...found.values()]), years };
}

export type MatchSummary = {
  required: number;
  requiredSuper: number;
  requiredMatched: number;
  nice: number;
  niceMatched: number;
};

export function summarize(m: Matchup): MatchSummary {
  const req = m.rows.filter((r) => r.section === "required");
  const nice = m.rows.filter((r) => r.section === "nice");
  return {
    required: req.length,
    requiredSuper: req.filter((r) => r.effect === "super").length,
    requiredMatched: req.filter((r) => r.effect !== "closest").length,
    nice: nice.length,
    niceMatched: nice.filter((r) => r.effect !== "closest").length,
  };
}

/** One line for the dialogue box and screen readers. */
export function summaryLine(m: Matchup): string {
  const s = summarize(m);
  if (s.required + s.nice === 0) return "No skills I know turned up in that post.";
  if (s.required === 0) return `${s.niceMatched} of ${s.nice} nice-to-have skills matched.`;
  if (s.requiredSuper > 0 && s.requiredSuper === s.requiredMatched) {
    return `${s.requiredSuper} of ${s.required} required skills: super effective!`;
  }
  return `${s.requiredMatched} of ${s.required} required skills matched, ${s.requiredSuper} used at Fiserv.`;
}

/**
 * The shareable form: skill ids only, never the post. "~" marks nice to have,
 * "y3" a "3+ years" ask. Example: "csharp,aspnet,~react,docker,y3".
 */
export function encodeMatchup(m: Matchup): string {
  const parts = m.rows.map((r) => (r.section === "nice" ? "~" : "") + r.id);
  if (m.years) parts.push(`y${m.years.asked}`);
  return parts.join(",");
}

export function decodeMatchup(value: string, now = new Date()): Matchup | null {
  const rows: MatchRow[] = [];
  let years: YearsAsk | null = null;
  for (const token of value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 80)) {
    const yearsToken = token.match(/^y(\d{1,2})$/);
    if (yearsToken) {
      years = { asked: Number(yearsToken[1]), has: yearsOfExperience(now), section: "required" };
      continue;
    }
    const section: Section = token.startsWith("~") ? "nice" : "required";
    const id = token.replace(/^~/, "");
    const entry = DEX_BY_ID.get(id);
    const skill = NEARBY_BY_ID.get(id);
    if (entry) rows.push(rowFor({ kind: "dex", entry }, entry.name, section));
    else if (skill) rows.push(rowFor({ kind: "nearby", skill }, skill.name, section));
  }
  return rows.length || years ? { rows: sortRows(rows), years } : null;
}

/**
 * How relevant a project is to a matchup: its stack chips and case study
 * count for each matched skill, required ones double.
 */
export function projectScore(
  project: { slug: string; stack: string[] },
  m: Matchup,
  entryForChip: (chip: string) => DexEntry | undefined
): number {
  const chipIds = new Set(project.stack.map((chip) => entryForChip(chip)?.id).filter(Boolean));
  let score = 0;
  for (const row of m.rows) {
    if (row.kind !== "dex") continue;
    const weight = row.section === "required" ? 2 : 1;
    if (chipIds.has(row.id)) score += 2 * weight;
    if (row.entry.evidence.some((e) => e.href === `/projects/${project.slug}`)) score += weight;
  }
  return score;
}

/** Every name a matched skill goes by, for highlighting stack chips. */
export function matchedChipNames(m: Matchup): string[] {
  return m.rows.flatMap((r) => (r.kind === "dex" ? [r.entry.name, ...r.entry.aliases] : []));
}
