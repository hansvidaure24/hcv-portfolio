# Hans Chandler Vidaure — Portfolio

A Pokémon Emerald–themed personal portfolio site: a scrollable "scene" flow
(Hero → Bio → Projects → Contact) styled after the GBA Pokédex/menu UI, with
a working contact form that emails through Resend.

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

The route also has a basic in-memory rate limiter (5 submissions per IP per
10 minutes) that's process-local — it resets on every deploy and doesn't
share state across serverless instances. See the comment at the top of
[`app/api/contact/route.ts`](app/api/contact/route.ts) if this ever needs to
hold up under real abuse.

**Deploying:** set the same environment variables in your hosting
provider's dashboard (never in committed files), and confirm the
`EMAIL_FROM` domain shows "Verified" in Resend before going live.

## Accessibility

- Reduced motion: the "Reduce motion" toggle in the site menu (bottom-right)
  overrides the OS `prefers-reduced-motion` setting in either direction and
  persists the choice in `localStorage`. See
  [`app/lib/motionPreference.ts`](app/lib/motionPreference.ts).
- The contact terminal dialog is keyboard-accessible: it traps focus while
  open, restores focus to the mail icon on close, and closes on <kbd>Escape</kbd>.
