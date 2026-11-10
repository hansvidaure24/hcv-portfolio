/**
 * What teammates say, shown under the Experience timeline. Edit the quotes
 * here; the section reads them as-is.
 */

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
