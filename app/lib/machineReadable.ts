/**
 * The site's facts for AI assistants and other tools: /llms.txt,
 * /resume.json and the read-only MCP endpoint (/api/mcp) are all built here
 * from the same data files as the pages (resume, projects, dex, notes), so
 * they can't drift apart. Server only (projects.ts reads the file system).
 */
import { DEX, dexEntryFor, type DexEntry } from "../data/dex";
import { NEARBY } from "../data/nearby";
import { getNotes } from "../data/notes";
import { NOW } from "../data/now";
import { getPublishedProjects } from "../data/projects";
import { RESUME, type ResumeEntry } from "../data/resume";
import { CONTACT_EMAIL, RESUME_URL, SITE_URL } from "./site";

export const abs = (href: string) => (href.startsWith("/") ? `${SITE_URL}${href}` : href);

export const LOOKING_FOR = "Open to full-stack roles, in NYC or remote.";

export function profile() {
  return {
    name: RESUME.name,
    headline: RESUME.headline,
    location: RESUME.location,
    summary: RESUME.summary,
    lookingFor: LOOKING_FOR,
    now: { text: NOW.text, asOf: NOW.updated },
    email: CONTACT_EMAIL,
    links: {
      site: SITE_URL,
      resume: abs("/resume"),
      resumePdf: abs(RESUME_URL),
      resumeJson: abs("/resume.json"),
      llms: abs("/llms.txt"),
      github: "https://github.com/hansvidaure24",
      linkedin: "https://www.linkedin.com/in/hans-chandler-vidaure/",
    },
  };
}

export function projects() {
  return getPublishedProjects().map((p) => ({
    title: p.title,
    kind: p.kind,
    summary: p.tagline,
    role: p.role,
    stack: p.stack,
    proof: p.metrics,
    caseStudy: abs(`/projects/${p.slug}`),
    links: p.links.map((l) => ({ label: l.label, url: abs(l.href) })),
  }));
}

function evidenceOf(entry: DexEntry) {
  return entry.evidence.map((e) => ({ source: e.source, text: e.text, url: abs(e.href) }));
}

export function skill(entry: DexEntry) {
  return {
    name: entry.name,
    status:
      entry.status === "caught"
        ? "caught: used at Fiserv or in a live or public project"
        : "seen: only in training, or in a game still in development",
    usedAtWork: entry.evidence.some((e) => e.href.startsWith("/resume")),
    alsoCalled: entry.aliases,
    evidence: evidenceOf(entry),
  };
}

/** A skill by any of its names; for one that isn't in the dex, the nearest ones that are. */
export function skillEvidence(name: string) {
  const entry = dexEntryFor(name);
  if (entry) return { found: true as const, skill: skill(entry) };
  const near = NEARBY.find((s) => [s.name, ...s.aliases].some((n) => n.toLowerCase() === name.trim().toLowerCase()));
  const closest = (near?.closest ?? []).map((id) => DEX.find((e) => e.id === id)).filter((e): e is DexEntry => !!e);
  return {
    found: false as const,
    note: near
      ? `${near.name} isn't in the Skill Dex (no proof on the site). Closest experience follows.`
      : `No skill called "${name}" in the Skill Dex.`,
    closest: closest.map(skill),
  };
}

/** "Jan 2024 – Present" → { startDate: "2024-01" }; "Sep 2023 – Jan 2024" → both. */
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
export function parseRange(when: string | undefined): { startDate?: string; endDate?: string } {
  const dates = [...(when ?? "").matchAll(/([A-Za-z]{3})[a-z]*\s+(\d{4})/g)].map((m) => {
    const month = MONTHS.indexOf(m[1]!.toLowerCase()) + 1;
    return month ? `${m[2]}-${String(month).padStart(2, "0")}` : undefined;
  });
  return { startDate: dates[0], endDate: /present/i.test(when ?? "") ? undefined : dates[1] };
}

const TYPE_LABELS: Record<string, string> = {
  LANGUAGE: "Languages",
  WEB: "Web",
  BACKEND: "Backend",
  DATA: "Data",
  TESTING: "Testing",
  DEVOPS: "DevOps",
  GAMES: "Games",
  PRACTICE: "Practices",
};

/**
 * "English, Tagalog (native) · French (intermediate; minor) · Spanish (basic)":
 * groups split on "·", and a group's level applies to every language in it.
 */
export function spokenLanguages(text: string) {
  return text.split("·").flatMap((group) => {
    const m = group.trim().match(/^(.+?)\s*(?:\(([^)]+)\))?$/);
    if (!m) return [];
    const level = m[2]?.split(";")[0]?.trim();
    const fluency = level ? level.charAt(0).toUpperCase() + level.slice(1) : undefined;
    return m[1]!.split(",").map((language) => ({ language: language.trim(), fluency }));
  });
}

const liveUrl = (e: ResumeEntry) => e.links?.find((l) => l.label === "Live")?.href ?? (e.caseStudy ? abs(`/projects/${e.caseStudy}`) : undefined);

/** The resume in the JSON Resume schema (jsonresume.org). No phone number. */
export function jsonResume() {
  const p = profile();
  const byType = new Map<string, string[]>();
  for (const entry of DEX.filter((e) => e.status === "caught")) {
    byType.set(entry.type, [...(byType.get(entry.type) ?? []), entry.name]);
  }
  const spoken = RESUME.skills.find((s) => s.label === "Spoken")?.text ?? "";
  return {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: p.name,
      label: p.headline,
      email: p.email,
      url: p.links.site,
      summary: `${p.summary} ${p.lookingFor}`,
      location: { city: "Flushing", region: "NY", countryCode: "US" },
      profiles: [
        { network: "GitHub", username: "hansvidaure24", url: p.links.github },
        { network: "LinkedIn", username: "hans-chandler-vidaure", url: p.links.linkedin },
      ],
    },
    work: RESUME.experience.map((e) => ({
      name: e.name,
      position: e.detail?.split(",")[0],
      location: e.detail?.split(",").slice(1).join(",").trim() || undefined,
      ...parseRange(e.when),
      highlights: e.points,
    })),
    projects: RESUME.projects.map((e) => ({
      name: e.name,
      description: e.detail,
      url: liveUrl(e),
      keywords: e.stack?.split(",").map((s) => s.trim()),
      highlights: e.points,
    })),
    education: RESUME.education.map((e) => ({
      institution: e.name,
      area: "Computer Science",
      studyType: "B.A.",
      ...parseRange(e.when),
      courses: [],
      score: undefined,
    })),
    volunteer: RESUME.leadership.map((e) => ({
      organization: e.name,
      position: e.detail,
      ...parseRange(e.when),
      highlights: e.points,
    })),
    skills: [...byType].map(([type, names]) => ({ name: TYPE_LABELS[type] ?? type, keywords: names })),
    languages: spokenLanguages(spoken),
    meta: { canonical: p.links.resumeJson, version: "v1.0.0", lastModified: NOW.updated },
  };
}

/** /llms.txt, in the llmstxt.org format: a title, a summary, then linked sections. */
export function llmsTxt(): string {
  const p = profile();
  const lines: string[] = [
    `# ${p.name}: ${p.headline}`,
    "",
    `> ${p.summary} ${p.lookingFor} Contact: ${p.email}.`,
    "",
    "Everything below is also on the site, with links to the proof. Skills come from the site's Skill Dex: \"caught\" means used at Fiserv or in a live or public project; \"seen\" means training, or a game still in development, only. Nothing here is generated by AI.",
    "",
    `Now (${NOW.updated}): ${NOW.text}`,
    "",
    "## Start here",
    "",
    `- [Resume](${p.links.resume}): one-page web resume`,
    `- [Resume as JSON](${p.links.resumeJson}): the same, in the JSON Resume schema`,
    `- [Resume PDF](${p.links.resumePdf})`,
    `- [GitHub](${p.links.github})`,
    `- [LinkedIn](${p.links.linkedin})`,
    `- [MCP endpoint](${abs("/api/mcp")}): read-only Model Context Protocol tools (get_profile, list_projects, get_skill_evidence, match_job), Streamable HTTP, no auth`,
    "",
    "## Experience",
    "",
  ];
  for (const e of RESUME.experience) {
    lines.push(`- ${e.name}, ${e.detail} (${e.when})`);
    for (const point of e.points) lines.push(`  - ${point}`);
  }
  lines.push("", "## Projects", "");
  for (const proj of projects()) {
    lines.push(`- [${proj.title}](${proj.caseStudy}): ${proj.summary} Stack: ${proj.stack.join(", ")}. Proof: ${proj.proof.join("; ")}.`);
  }
  lines.push("", "## Skills", "");
  for (const entry of DEX) {
    const s = skill(entry);
    const proof = entry.evidence.map((e) => `${e.source}: ${e.text}`).join("; ");
    lines.push(`- ${entry.name} (${entry.status}${s.usedAtWork ? ", used at Fiserv" : ""}): ${proof}`);
  }
  const notes = getNotes().filter((n) => n.published);
  if (notes.length) {
    lines.push("", "## Field notes", "");
    for (const n of notes) lines.push(`- [${n.title}](${abs(`/notes/${n.slug}`)}): ${n.summary}`);
  }
  lines.push("", "## Optional", "", `- [Home page](${p.links.site}): the full portfolio, styled as a GBA-era RPG`);
  return lines.join("\n") + "\n";
}
