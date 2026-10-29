/**
 * Content for the "Add Hans to your party?" section: why hire me, in three
 * moves, plus what teammates say. Edit the text here; the section reads it as-is.
 */

export type Move = {
  name: string;
  /** Short type label on the chip, like a move's type. */
  type: "SECURITY" | "RANGE" | "AUTONOMY";
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
    proof: "Fixed 1,150+ Fortify findings during feature work, and removed cache-isolation defects in banking code.",
  },
  {
    name: "Full-stack range",
    type: "RANGE",
    effect: "I can take a feature from the database to the button without handing it off.",
    proof: "C#/ASP.NET APIs, React UI and SQL at Fiserv; TypeScript, Next.js and Unity on my own projects.",
  },
  {
    name: "Ships solo",
    type: "AUTONOMY",
    effect: "Give me a problem, not a ticket list, and I'll scope it, build it and test it.",
    proof: "Built SliceOfPie and Wakebound solo, from design to tests: 245 tests on every push, ~58k lines of C#.",
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
