This site is my portfolio, so it's also a project: the place where I can show how I build when nobody sets the requirements. Here's what it runs on, what I measured, and the trade-offs I made. The code is public: [hcv-portfolio on GitHub](https://github.com/hansvidaure24/hcv-portfolio).

## The stack

- Next.js 15 (App Router) and React 19, in TypeScript
- Sass modules for the components, all reading one set of design tokens, plus a few Tailwind utilities
- Framer Motion for scene changes, Resend for the contact form, Vercel for hosting
- No paid services: everything runs on free tiers

## One design system

Every color, type size, border, shadow, motion duration, focus ring and page layer is a token in one stylesheet, and components use the tokens instead of raw values. There is one panel, one button, one chip and one section heading, shared through Sass mixins, and five named breakpoints. Interface pieces move in whole-pixel steps; only the scenery and scene changes ease. The sky follows your local time of day, and each of its four palettes keeps the hero text at 4.5:1 contrast or better.

## Performance, measured

Mobile Lighthouse on the live site, three runs on Nov 8, 2026: **100 for performance every time**, 26 to 52 ms of blocking time, about 1.05 seconds to the largest paint and no layout shift. Accessibility, best practices and SEO score 100 as well.

What it took:

- The contact form, the Options screen, Type Matchup and the sound effects load when the page is idle or when you first open them.
- Images are sized for how they're shown, and covers below the first screen load lazily.
- The hero's looping animations pause once it scrolls off screen, so the rest of the page does no animation work.
- Trade-offs get measured, not kept on faith. Splitting hydration into separate tasks once cut startup blocking from about 420 ms to 30 ms, but it hid everything below the hero from browsers without JavaScript. After the idle loading above, I measured both versions again: without the split it still scored 100. So the split is gone, and the whole page is in the HTML.

## Accessible by default

- Lighthouse accessibility is 100, and axe finds no WCAG issues on the home page or the case studies.
- An Options screen sets animations (reduced or full, overriding the system setting in either direction) and text speed, applied before the first paint.
- Keyboard focus is visible on every surface: gold on the dark scenery, ink on the cream panels, and a solid ring on form fields.
- Dialogs keep focus inside and hand it back when they close, the phone menu works with the arrow keys and Escape, and every page starts with a skip link.
- In Chrome and Edge, find in page (Ctrl+F) also searches the case-study tabs that aren't open, and switches to the one with the match.

## Secure by default

- A Content-Security-Policy that allows only this site, Google Analytics and Cloudflare Turnstile, plus `nosniff`, a frame ban, a referrer policy and a permissions policy.
- The contact form checks for bots with Cloudflare Turnstile, a hidden honeypot field and a minimum fill time, and rate-limits each IP address. It escapes everything it puts into an email and only ever emails me, so nobody can use the form to send their own text to someone else's inbox.
- Secrets live only on the server.

## Tested

85 Vitest tests cover the parts with logic: Type Matchup against 10 synthetic job posts (every skill it should find, and nothing it shouldn't), the data rules (every project's stack chip maps to a skill with proof), the files for AI tools (they never include my phone number), and the contact form's checks, including Turnstile verification against a stand-in for Cloudflare.

## Built for how candidates get screened

- **Type Matchup:** paste a job post and see each requirement matched to proof. It runs in your browser; the post isn't sent anywhere.
- **For AI tools:** [/llms.txt](/llms.txt), [/resume.json](/resume.json) in the JSON Resume format, and a small read-only MCP endpoint, all generated from the same data files as the pages.
- **Live proof:** the CI badges on the project cards and the GitHub activity on the profile card come from GitHub's API, refreshed daily. A badge only shows when the latest run passed.

## How I work on it

The plan lives in the repo as a roadmap. Each phase says what changed and why, with before-and-after Lighthouse numbers where speed is involved, and ends with a check on a desktop and on a phone before the next one starts.
