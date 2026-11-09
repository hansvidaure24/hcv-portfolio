/**
 * "Why hire me" content for the About section: two strengths styled as moves,
 * plus what teammates say. Edit the text here; About reads it as-is.
 */

export type Move = {
  name: string;
  /** Short type label on the chip, like a move's type. */
  type: "SECURITY" | "OWNERSHIP";
  /** The evidence, already public elsewhere on the site. */
  proof: string;
};

export const MOVES: Move[] = [
  {
    name: "Secure by default",
    type: "SECURITY",
    // Public proof only: statements about an employer's security work need its approval.
    proof:
      "SliceOfPie keeps every receipt on the device under a strict Content-Security-Policy. This site's contact form verifies bots on the server and only ever emails me, so it can't be used to send someone else's text.",
  },
  // Ownership inside a team, not "solo": the proof leads with work that went
  // through other people's review and testing to production.
  {
    name: "Owns it end to end",
    type: "OWNERSHIP",
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
