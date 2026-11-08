# Hans Chandler Vidaure — Portfolio

A Pokémon Emerald–themed personal portfolio site: a scrollable "scene" flow
(Hero → Work → About → Contact) styled after the GBA Pokédex/menu UI, with a
working contact form that emails through Resend. The design system (tokens,
mixins, motion rules) and the plan behind it are in
[`docs/DESIGN-ROADMAP.md`](docs/DESIGN-ROADMAP.md).

**Live:** [hansvidaure.dev](https://hansvidaure.dev)

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + [React 19](https://react.dev) + TypeScript
- [Sass](https://sass-lang.com) (CSS Modules) for component styles, [Tailwind](https://tailwindcss.com) for utilities
- [Framer Motion](https://www.framer.com/motion/) for scene/menu animation
- [Resend](https://resend.com) for the contact form's email delivery
- Deployed on [Vercel](https://vercel.com)

## Getting started

```bash
npm install
npm run dev
```

Tests (Type Matchup, the Skill Dex and the machine-readable files):

```bash
npm test
```

Don't run `npm run build` while `npm run dev` is running: they share
`.next/`, and the build comes out broken.

## Editing content

| What | Where |
| --- | --- |
| Project cards, case-study metadata, "Choose your focus" scores (`focus`) and stat bars (`stats`) | [`app/data/projects.ts`](app/data/projects.ts) |
| Focus options (the chips each one highlights come from the dex's `focus` tags) | [`app/data/focus.ts`](app/data/focus.ts) |
| Skill Dex (About), stack-chip links and focus highlights: every skill with its proof | [`app/data/dex.ts`](app/data/dex.ts). Each entry needs evidence a visitor can follow, and every project stack chip must match an entry's name or alias. |
| Type Matchup: skills job posts ask for that have no proof on the site, with the nearest ones that do | [`app/data/nearby.ts`](app/data/nearby.ts). The matcher is [`app/lib/matchup.ts`](app/lib/matchup.ts); when it reads a real post wrong, add the post to `tests/fixtures/jobPosts.ts`. |
| `/llms.txt`, `/resume.json` and the read-only MCP endpoint (`/api/mcp`) | Generated from the files above by [`app/lib/machineReadable.ts`](app/lib/machineReadable.ts); nothing to edit by hand. |
| Case-study write-ups | `content/projects/<slug>.md` (`## ` headings, `- ` lists, `**bold**`, `[links](https://…)`). Headings are sorted into the Overview / Decisions / Results tabs by `TAB_FOR_HEADING` in [`app/projects/[slug]/page.tsx`](app/projects/[slug]/page.tsx). |
| Career timeline (About → Evolution) | [`app/components/sections/Bio/Evolution.tsx`](app/components/sections/Bio/Evolution.tsx); keep it in sync with the resume |
| "Why hire me" moves and testimonials (About) | [`app/data/party.ts`](app/data/party.ts) |
| Quick view resume (`/resume`) | [`app/data/resume.ts`](app/data/resume.ts); the PDF is still printed from `resume/hcv-resume.html`, so change both together |
| Trainer card "Now" line and play-time start date | [`app/data/now.ts`](app/data/now.ts) |
| Field notes (`/notes`) | [`app/data/notes.ts`](app/data/notes.ts) for title, date and summary; the text in `content/notes/<slug>.md` (case-study Markdown plus ``` code blocks and `inline code`) |

A project with `published: false` is a draft: it's left out of the grid,
sitemap and production build, but `npm run dev` gives it a page with a DRAFT
banner and lists it at the bottom of the Work section. The testimonials panel
works the same way: hidden in production until `TESTIMONIALS` has an entry.

## Environment variables

Copy the example file and fill in real values:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `RESEND_API_KEY` | Yes | API key from the [Resend dashboard](https://resend.com/api-keys). Server-side only. |
| `CONTACT_EMAIL` | Yes | Inbox that receives new contact form submissions. |
| `EMAIL_FROM` | Yes | The "from" address for both the notification and the visitor's receipt, e.g. `Name <contact@yourdomain.dev>`. Must be on a domain verified in Resend (see below). |
| `NEXT_PUBLIC_SITE_URL` | Yes | Production URL (no trailing slash) — used for canonical URLs, the sitemap, `robots.txt`, JSON-LD, and the OG/social share image. |
| `NEXT_PUBLIC_GA_ID` | No | GA4 Measurement ID. Leave blank to disable analytics entirely. |
| `GITHUB_TOKEN` | No | Raises GitHub's rate limit for the trainer card and CI chips (public data, refreshed daily). A free fine-grained token with read-only public access is enough; without it they usually still load, and hide if GitHub refuses. |

`.env.local` is already git-ignored — never commit real API keys.

## Contact form (Resend) setup

The contact form (mail icon in the Contact section) posts to
[`app/api/contact/route.ts`](app/api/contact/route.ts).

1. **Verify a sending domain** in the [Resend dashboard → Domains](https://resend.com/domains):
   add your domain, add the DNS records Resend gives you (SPF/DKIM/MX) at
   your DNS provider, and wait for it to show "Verified".
2. Set `EMAIL_FROM` to a mailbox on that verified domain (e.g.
   `contact@yourdomain.dev`). Until the domain is verified, Resend's shared
   sender (`onboarding@resend.dev`) works for local testing only — it can't
   reliably deliver to arbitrary visitor addresses, so **don't deploy to
   production with an unverified domain**.
3. Test locally with `npm run dev`, submit the form, and check your
   terminal for `console.error` output if something fails (the API route
   never leaks Resend's raw error details to the browser).

Spam protection, all free: a hidden honeypot field, a check that rejects
forms sent less than 3 seconds after opening (`MIN_FILL_MS` in
[`app/lib/validateContact.ts`](app/lib/validateContact.ts)), and a visitor
receipt that never repeats what they typed, so the form can't relay
someone's text to another inbox. The route also has a basic in-memory rate
limiter (5 submissions per IP per 10 minutes) that's process-local — it
resets on every deploy and doesn't share state across serverless instances. See the comment at the top of
[`app/api/contact/route.ts`](app/api/contact/route.ts) if this ever needs to
hold up under real abuse.

**Deploying:** set the same environment variables in your hosting
provider's dashboard (never in committed files), and confirm the
`EMAIL_FROM` domain shows "Verified" in Resend before going live.

## Accessibility

- Options (sliders button in the top bar, or OPTIONS in the phone menu):
  ANIMATIONS: REDUCED overrides the OS `prefers-reduced-motion` setting in
  either direction, and TEXT SPEED: FAST skips typing effects and intros.
  Both persist in `localStorage` and apply before first paint. See
  [`app/lib/motionPreference.ts`](app/lib/motionPreference.ts) and
  [`app/lib/preferences.ts`](app/lib/preferences.ts).
- The contact and Options dialogs are keyboard-accessible: they trap focus
  while open, restore focus on close, and close on <kbd>Escape</kbd>.
- Feedback (email copied, message sent) goes through one dialogue box that
  announces its full text to screen readers.
