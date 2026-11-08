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
    // Public proof only: statements about an employer's security work need its approval.
    proof:
      "SliceOfPie keeps every receipt on the device under a strict Content-Security-Policy. This site's contact form verifies bots on the server and only ever emails me, so it can't be used to send someone else's text.",
  },
  {
    name: "Full-stack range",
    type: "RANGE",
    effect: "I can take a feature from the database to the button without handing it off.",
    proof: "C#/ASP.NET APIs, SQL and React UI in production online banking at Fiserv.",
  },
  // Ownership inside a team, not "solo": the proof leads with work that went
  // through other people's review and testing to production.
  {
    name: "Owns it end to end",
    type: "OWNERSHIP",
    effect: "I take work from scope through production, and I stay with it after it ships.",
    proof:
      "Shipped features through peer review and regression testing at Fiserv, and supported them in production. SliceOfPie, the Behavior Tree Editor and Pocket Quest run their tests on every push.",
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
