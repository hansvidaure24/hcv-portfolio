import fs from "fs";
import path from "path";

/**
 * Field notes: short write-ups from building things. The text lives in
 * content/notes/<slug>.md (same Markdown subset as the case studies, plus
 * ``` code blocks and `inline code`); this file holds the metadata.
 */
export type Note = {
  slug: string;
  title: string;
  /** One or two sentences for the list and link previews. */
  summary: string;
  /** ISO date it was written. */
  date: string;
  /** The project it comes from (a slug in app/data/projects.ts). */
  project?: string;
  /** Where it was first published, if somewhere else. */
  original?: { label: string; href: string };
  /** Drafts only show under `next dev`, like draft case studies. */
  published: boolean;
};

// Newest first.
const NOTES: Note[] = [
  {
    slug: "ios-pwa-launch-bug",
    title: "The tab bar that floated: debugging an iPhone PWA bug I couldn't reproduce",
    summary:
      "SliceOfPie's tab bar opened 60 points too high, only when installed on an iPhone. Three fixes failed; measuring on the device found the cause.",
    date: "2026-10-25",
    project: "sliceofpie",
    original: {
      label: "First published on GitHub",
      href: "https://github.com/hansvidaure24/SliceOfPie/blob/main/docs/ios-pwa-launch-bug.md",
    },
    published: true,
  },
];

const SHOW_DRAFTS = process.env.NODE_ENV === "development";

export function getNotes(): Note[] {
  return NOTES.filter((n) => n.published || SHOW_DRAFTS);
}

export function getNote(slug: string): Note | undefined {
  return getNotes().find((n) => n.slug === slug);
}

export function getNotesForProject(projectSlug: string): Note[] {
  return getNotes().filter((n) => n.project === projectSlug);
}

export function getNoteBody(slug: string): string {
  const file = path.join(process.cwd(), "content", "notes", `${slug}.md`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
}

export const formatNoteDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
