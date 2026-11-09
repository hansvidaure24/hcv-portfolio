What this site runs on, what I measured, and the trade-offs I made. The code is public: [hcv-portfolio on GitHub](https://github.com/hansvidaure24/hcv-portfolio).

## The stack

- Next.js 15 (App Router) and React 19, in TypeScript
- Sass modules for the components, all reading one set of design tokens, plus a few Tailwind utilities
- Framer Motion for scene changes, Resend for the contact form, Vercel for hosting
- No paid services: everything runs on free tiers

## One design system

Colors, type sizes, borders, shadows and motion durations are tokens in one stylesheet. There is one panel, one button, one chip and one section heading, shared through Sass mixins. The sky follows your local time of day, and each of its four palettes keeps the hero text at 4.5:1 contrast or better.

## Performance, measured

Mobile Lighthouse on the live site, three runs on Nov 8, 2026: **100 for performance every time**, 26 to 52 ms of blocking time, about 1.05 seconds to the largest paint and no layout shift. Accessibility, best practices and SEO score 100 as well.

What it took:

- The contact form, the Options screen, Type Matchup and the sound effects load when the page is idle or when you first open them.
- The hero's looping animations pause once it scrolls off screen, so the rest of the page does no animation work.
- Trade-offs get measured, not kept on faith. Splitting hydration into separate tasks once cut startup blocking from about 420 ms to 30 ms, but it hid everything below the hero from browsers without JavaScript. After the idle loading above, I measured both versions again: without the split it still scored 100. So the split is gone, and the whole page is in the HTML.

## Accessible by default

- Lighthouse accessibility is 100, and axe finds no WCAG issues on the home page or the case studies.
- An Options screen sets animations (reduced or full, overriding the system setting in either direction) and text speed, applied before the first paint.
- Keyboard focus is visible on every surface, dialogs trap and return focus, and every page starts with a skip link.

## Secure by default

- A Content-Security-Policy that allows only this site, Google Analytics and Cloudflare Turnstile, plus `nosniff`, a frame ban, a referrer policy and a permissions policy.
- The contact form checks for bots with Cloudflare Turnstile, a hidden honeypot field and a minimum fill time, and rate-limits each IP address. It escapes everything it puts into an email and only ever emails me, so nobody can use the form to send their own text to someone else's inbox.

## Tested

85 Vitest tests cover the parts with logic: Type Matchup against 10 synthetic job posts (every skill it should find, and nothing it shouldn't), the data rules (every project's stack chip maps to a skill with proof), the files for AI tools (they never include my phone number), and the contact form's checks, including Turnstile verification against a stand-in for Cloudflare.

## Built for how candidates get screened

- **Type Matchup:** paste a job post and see each requirement matched to proof. It runs in your browser; the post isn't sent anywhere.
- **For AI tools:** [/llms.txt](/llms.txt), [/resume.json](/resume.json) in the JSON Resume format, and a small read-only MCP endpoint, all generated from the same data files as the pages.
- **Live proof:** the CI badges on the project cards and the GitHub activity on the profile card come from GitHub's API, refreshed daily. A badge only shows when the latest run passed.
