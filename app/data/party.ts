/**
 * "Why hire me" content for the About section: three strengths styled as
 * moves, plus what teammates say. Edit the text here; About reads it as-is.
 */

export type Move = {
  name: string;
  /** Short type label on the chip, like a move's type. */
  type: "SECURITY" | "RANGE" | "OWNERSHIP";
  /** What this strength means for a team, in one sentence. */
  effect: string;
  /** The evidence, already public elsewhere on the site. */
  proof: string;
};

export const MOVES: Move[] = [
  {
    name: "Secure by default",
    type: "SECURITY",
    effect: "I treat security as part of the feature, not a review step at the end.",
    proof:
      "Fixed thread-safety and cache-isolation defects in banking code, and cleared Fortify findings as part of feature work instead of a separate pass.",
  },
  {
    name: "Full-stack range",
    type: "RANGE",
    effect: "I can take a feature from the database to the button without handing it off.",
    proof:
      "C#/ASP.NET APIs, React UI and SQL at Fiserv; TypeScript, WebRTC, a Tauri desktop app and Unity on my own projects.",
  },
  // Ownership inside a team, not "solo": the proof leads with work that went
  // through other people's review and testing to production.
  {
    name: "Owns it end to end",
    type: "OWNERSHIP",
    effect: "Hand me a problem and I'll scope it, build it, test it and see it through to production.",
    proof:
      "Took Fiserv's multi-account transaction download to another core banking system: core-specific mapping, CSV export and cross-core regression testing, through to production. On my own projects, SliceOfPie, the behavior tree editor and Pocket Quest run their tests on every push.",
  },
];

export type Testimonial = {
  /** Their words, ideally 1–3 sentences. Get permission before publishing. */
  quote: string;
  name: string;
  /** e.g. "Senior Software Engineer, Fiserv" */
  role: string;
  /** Optional link to where the quote lives, such as a LinkedIn recommendation. */
  href?: string;
};

/**
 * Empty until real quotes come in: with no entries, the testimonials panel is
 * hidden in production (dev shows a placeholder). Example entry:
 *
 * {
 *   quote: "Hans picked up our hardest concurrency bug and closed it in a week.",
 *   name: "Jane Doe",
 *   role: "Engineering Manager, Fiserv",
 *   href: "https://www.linkedin.com/in/...",
 * },
 */
export const TESTIMONIALS: Testimonial[] = [];
