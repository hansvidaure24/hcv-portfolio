# Hans Chandler Vidaure — Portfolio

Next.js 15 / TypeScript portfolio site.

## Getting started

```bash
npm install
npm run dev
```

## Contact form (Resend) setup

The contact form (opened from the mail icon in the Contact section) posts to
[`app/api/contact/route.ts`](app/api/contact/route.ts), which sends email via
[Resend](https://resend.com).

### 1. Install dependencies

Already included in `package.json` — `npm install` pulls in the `resend`
package. If it's ever missing:

```bash
npm install resend
```

### 2. Environment variables

Copy the example file and fill in real values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
| --- | --- |
| `RESEND_API_KEY` | API key from the [Resend dashboard](https://resend.com/api-keys). Server-side only — never exposed to the browser. |
| `CONTACT_EMAIL` | Inbox that receives new contact form submissions (`hansvidaure24@gmail.com`). |
| `EMAIL_FROM` | The "from" address used for both the notification and the visitor's confirmation email. Must be on a domain verified in Resend (see below). |

`.env.local` is already git-ignored — never commit real API keys.

### 3. Verify a sending domain

Resend requires the `from` address's domain to be verified before it will
send to arbitrary recipients (like a visitor's own email address for the
confirmation receipt). In the [Resend dashboard → Domains](https://resend.com/domains):

1. Add your domain (e.g. `hansvidaure.dev`).
2. Add the DNS records Resend gives you (SPF/DKIM) at your DNS provider.
3. Wait for the domain to show as "Verified".
4. Set `EMAIL_FROM` to an address on that domain, e.g. `contact@hansvidaure.dev`.

**Before a domain is verified**, Resend's shared sender
(`onboarding@resend.dev`) can be used for local testing only — it can send,
but only to the email address on your own Resend account, so the visitor
receipt won't reliably reach arbitrary visitors. **Do not deploy to
production with an unverified domain** — set a real verified `EMAIL_FROM`
before going live.

### 4. Local testing

```bash
npm run dev
```

Open the site, click the mail icon in the Contact section, and submit the
form. Check your terminal for `console.error` output if something fails —
the API route never returns Resend's raw error details to the browser.

### 5. Rate limiting

The API route includes a basic in-memory rate limiter (5 submissions per IP
per 10 minutes). This is **process-local** — it resets on every restart/deploy
and does not share state across multiple server instances or serverless
invocations. If this ever needs to hold up under real abuse or a
multi-instance/serverless deployment, replace it with a shared store (e.g.
[Upstash Redis](https://upstash.com/) or Vercel KV) keyed the same way
(client IP) — see the comment at the top of
[`app/api/contact/route.ts`](app/api/contact/route.ts).

### 6. Production deployment

- Set `RESEND_API_KEY`, `CONTACT_EMAIL`, and `EMAIL_FROM` as environment
  variables in your hosting provider's dashboard (never in committed files).
- Confirm the `EMAIL_FROM` domain shows "Verified" in Resend before going
  live.
- Consider swapping the in-memory rate limiter for a shared store if
  deploying to a multi-instance or serverless platform (see above).

## Accessibility

- Reduced motion: the "Reduce motion" toggle in the site menu (bottom-right)
  overrides the OS `prefers-reduced-motion` setting in either direction and
  persists the choice in `localStorage`. See
  [`app/lib/motionPreference.ts`](app/lib/motionPreference.ts).
- The contact terminal dialog is keyboard-accessible: it traps focus while
  open, restores focus to the mail icon on close, and closes on <kbd>Escape</kbd>.
