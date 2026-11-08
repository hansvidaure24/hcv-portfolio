# Design roadmap

Goal: make the portfolio look like **one** product (consistent colors, type,
panels, headings and motion), then add features that make it memorable for
recruiters without breaking that consistency.

**Rule for every change:** reuse the existing vocabulary — cream panel, 3px
ink border, hard drop shadow, PokePixel for display/labels, Inter for body,
stepped motion. No new visual languages.

Pace: back-to-back phases. Dates are targets, not promises; each phase ends
with a desktop + phone check in the browser before the next one starts.

| Phase | Target | Status |
| --- | --- | --- |
| 1–6. Foundation → QA (record at the bottom) | Nov 7–22, 2026 | Done, live Nov 7 |
| 7. Ship what's built, fix open issues | Nov 8–10 | Done Nov 7 (2 items wait on others) |
| 8. Table stakes from top portfolios | Nov 11–15 | Live Nov 8 (2 posts left for Hans) |
| 9. Evidence Dex | Nov 16–19 | Live Nov 8 |
| 10. Type Matchup (the new thing) | Nov 20–26 | Live Nov 8 |
| 11. Readable by AI tools | Nov 27–29 | Live Nov 8 |
| 12. Explore mode | December | Stretch |

---

## Phase 7 — Ship what's built, fix open issues

Carried over from the old "Later / parked" lists, plus what turned up on
Nov 7.

**Fixed (Nov 7)**

- [x] **Phases 1–6 are live.** They were uncommitted on `main` and
      hansvidaure.dev still served the old site. Now committed in six
      pieces by area plus a docs commit (only the last one is meant to
      build on its own; the files depend on each other), built as a Vercel
      preview, then fast-forwarded to `main` and deployed. Checked on
      production: Work / About / Contact, focus picker, Options, time of
      day, case-study tabs, the 404, no console errors.
- [x] **Startup blocking time ~420 ms → ~30 ms.** The cause was one long
      hydration task, not one library. Work, About and Contact are now in
      their own Suspense boundaries, so React hydrates them in separate
      short tasks after the hero. The Options and contact dialogs load
      when the page is idle and mount on first open. The Contact typing
      sound (72 KB) was downloaded and decoded on every visit; it now loads
      only when sound is on. Framer Motion didn't need trimming after this.
- [x] **Heavy source files:** `hans.png` 2980×4160 / 9.0 MB → 768×1072 /
      387 KB (still 4× its display size, transparency kept);
      `hero-avatar.jpg` 1479px / 623 KB → 1080px / 219 KB. `torchic.gif`
      already loads lazily near Contact, and `pokemon-bgmusic.mp3` only
      once sound is turned on.
- [x] **Behavior Tree Editor card** said 13 trees (and a 13/13 stat bar)
      after the write-up moved to all 14; both now say 14.

Mobile Lighthouse, same tool and machine before and after (median of 3):

| Page | Performance | Blocking time | LCP | CLS | A11y / BP / SEO |
| --- | --- | --- | --- | --- | --- |
| Home, local, before | 90 | 417 ms | 1.06 s | 0.017 | 100 |
| Home, local, after | 100 | 29 ms | 1.06 s | 0.017 | 100 |
| Home, **production** | 100 | 46 ms | 1.0 s | 0 | 100 / 100 / 100 |
| SliceOfPie case study, **production** | 99 | 30 ms | 2.0 s | 0 | — |

Phase 6's "72–73" came from an older Lighthouse setup, so compare within
this table only.

Gotcha found on the way: `next dev` and `next build` share `.next/`.
Building while a dev server runs leaves a broken production build (500s
with `Cannot find module './vendor-chunks/...'`). Stop the dev server
first, or build from a separate copy.

**Waiting on other people**

- [ ] **Fiserv case studies** (`fiserv-draft-a`, `fiserv-draft-b`):
      publish once cleared against Fiserv's disclosure policy. They already
      score highest for the C# / .NET focus.
- [ ] **Teammate quotes:** `TESTIMONIALS` in `app/data/party.ts` is empty,
      so the panel is hidden. Ask 2–3 teammates; a LinkedIn recommendation
      is the easiest to link.

**Watch, fix if it bites**

- [ ] **Work, About and Contact need JavaScript to appear.** The Suspense
      boundaries from this phase (the startup-speed fix) make Next stream
      those sections as hidden HTML that an inline script moves into place.
      Browsers with JavaScript, and Google, which runs it, see everything
      (checked in headless Edge: nothing left hidden). With JavaScript off,
      and for crawlers that don't run it, only the hero shows. Removing the
      boundaries brings back the ~400 ms startup block; the other fix leans
      on React's internal markup. Found Nov 8, during Phase 9.

- [ ] **Contact rate limit is per server instance** (in memory, resets on
      every deploy). The form already has a honeypot field; if spam still
      shows up, add another free check first (a minimum time-to-submit)
      before any hosted store.

**Kept by choice, with a deadline**

- [ ] **Borrowed Pokémon assets** (Torchic, music, the trading-card frame
      around `hans.png`, the Piplup drawn into `hero-avatar.jpg`, the
      Pokédex frame). Kept for now. Everything new in this plan uses original art
      only, and an original pixel mascot must replace these before
      Phase 12, which makes the site much more game-like.

**Housekeeping**

- [x] The two "Later / parked" lists are merged here. The Contact typing
      line marked "not yet watched live" in Phase 3 was watched in
      Phase 6 (~1.3s).

---

## Research: what top portfolios do (November 2026)

Looked at the [Web Design Awards portfolio category][wda] (top 12 by jury
score and the 24 recent winners, live sites opened where possible), the
developer portfolios that keep showing up in "best of" lists, and recruiter
surveys. Recruiter numbers are mostly from blogs and vendors, so treat them
as anecdotal.

| What they do | Seen at | This site today | Plan |
| --- | --- | --- | --- |
| Few projects, easy to scan, fast. A recruiter's first pass is roughly 90 seconds to 3 minutes. | [Brittany Chiang][bc] (the most-cited pick); lists recommend 3–6 projects | 5 projects with metrics; name, role and summary paint at once | Keep. Add a plain **Quick view** for the 90-second skim (Phase 8) |
| Proof over claims: live demos, code, numbers | Most developer sites; [Diego Sevilla][ds] (2025 winner) has a "The Days I Code" activity panel | Metrics, stat bars, live demos, code links | Link every skill to its proof (Phase 9); add live data (Phase 8) |
| Writing | [Josh W. Comeau][jc], [Lee Robinson][lr]: writing-led sites | One write-up, hosted on GitHub | **Field notes**, 2–3 posts on the site (Phase 8) |
| Explorable worlds | [Bruno Simon][bs] (drive through a 3D world), [Robby Leonardi][rl] (platformer résumé), [Erfan Mirasadi][em] (2025 winner: arrow keys between zones like Gym, Skills, Workshop, Contact, plus a day/night clock) | Themed, not playable | Stretch (Phase 12). It's a known pattern now, so on its own it isn't the new thing |
| Interface craft and sound | [Rauno Freiberg][rf] (a desktop-OS portfolio with a dock and interface sounds) | Sounds, stepped motion, one transition | Keep |
| Three.js / WebGL heroes, GSAP, loading screens | The two top scorers ([Casa di Solare][wda] 9.30, Pixel Matters 8.80) and about a quarter of the entries | Pixel-mosaic loading, no 3D | Skip: 3D doesn't fit a GBA world, and a loading screen eats the 90-second skim |
| Phone as controller, live cursors | [Emma Poliakova][ep] (scan a QR to control the site from your phone); [PartyKit cursor party][cp] | — | Not new anymore. Only inside Explore mode, where Pocket Quest's code already does it |
| Readable by AI tools (`llms.txt`, MCP servers) | Showing up in 2026 portfolio advice ([1][ai1], [2][ai2]); no study yet shows recruiters' AI tools use them | JSON-LD only | Cheap, so after the visible work (Phase 11) |
| Accessibility and performance count | The awards judge craft, experience, originality, content and technical quality; older scorecards rated accessibility and performance separately (about 7.4–9.1 among winners) | Lighthouse accessibility 100 | Keep it a release gate for every phase |

**Takeaway:** the top sites win on one strong concept done with craft, plus
fast access to proof. This site already has the concept (a GBA world) and
the craft. What it lacks is a *systematic* proof layer (every claim linked
to evidence) and one feature nobody else has. Not more spectacle.

---

## The new thing: Type Matchup

Approved by Hans on Nov 7, after comparing it with Bug Battles, Party link
and Save file for how likely each was to irritate a recruiter on a quick
first pass. **No AI, no server, no monthly cost.**

A recruiter pastes a job post. The site reads it **in their browser**
(nothing is sent or saved) and answers in battle text, requirement by
requirement:

```
Paste a job post ▶ [ ............................ ]

REQUIRED
C#            It's super effective!  ▶ Fiserv: 10+ features in C# / ASP.NET
React         It's effective.        ▶ RJN Visuals
Kubernetes    Closest experience:    ▶ <the nearest skill, with its proof>
3+ years      <his years>            ▶ Evolution timeline
NICE TO HAVE
...
5 of 6 required skills: super effective!
```

(Layout sketch: the real wording comes from the skill list.)

- **It's super effective!** Used at work, with the line that proves it.
- **It's effective.** Shipped in a project, and which one.
- **Closest experience:** a gap, worded as the nearest thing he has done
  rather than as a failure.

Then the Work cards reorder for that job (reusing Choose your focus), and
the recruiter can copy a **matchup link** to forward to the hiring manager.

Why this one:

- **Least likely to irritate a recruiter:** optional, one paste, an instant
  answer in their own terms ("does he fit my role?"). Nothing to sit
  through, and it never stands between them and the page.
- **Nobody does it.** Portfolios have AI chatbots and manual filters like
  the focus picker. None found matches itself against *your* job post,
  with proof, privately.
- **It does the recruiter's actual job** (matching a candidate to a role)
  instead of decorating it.
- **It's proof in itself:** careful parsing and privacy by design are the
  "Secure by default" and "Full-stack range" moves, shown instead of
  claimed.
- **It fits the world without copying a game:** type effectiveness is a
  genre mechanic, drawn with the existing panel, chips, ▶ lists and
  dialogue box.

How it works (Phases 9–10):

1. **Skill list** (`app/data/dex.ts`, edited by hand like `projects.ts`;
   Phase 9): about 30 skills. Each has the other names job posts use
   (`C#` / `C Sharp`; `.NET` / `dotnet` / `ASP.NET Core`), its strength
   (used at work, shipped in a project, learned) and proof links (project
   slug, Fiserv quest-log line, repo). Related skills point at each other
   (Kubernetes → Docker) for "closest experience".
2. **Matcher** (`app/lib/matchup.ts`, plain TypeScript, a pure function):
   - splits the post into lines and tags each one required or nice to have
     from headings like "Requirements", "Must have", "Preferred", "Bonus";
   - finds skills by exact words, with care for `C#`, `.NET`, `Node.js`,
     Java vs JavaScript, React vs React Native;
   - reads "3+ years" and compares it with his years of experience;
   - returns requirement → effectiveness → proof.
3. **Panel:** a gold "Paste a job post ▶" button beside the focus picker
   opens a `PixelPanel` dialog: a labeled textarea, "CHECK MATCHUP ▶", and
   results as ▶ lists grouped by effectiveness. The dialogue box says the
   summary, which also reaches screen readers. No single "% fit" number:
   counts per group, so it doesn't fake precision. Its code loads only
   when the panel opens, so the home page doesn't get slower.
4. **Privacy:** the panel says "Your job post stays in this browser." QA
   checks the network tab: no request carries the text, and analytics
   records only that a matchup ran.
5. **Matchup link:** `/?match=` carries only skill ids and their
   effectiveness, never the post's text. Opening it sets the card order and
   shows a "Matchup for a shared job post" note.
6. **Tests:** ~10 real job posts saved as fixtures (company names removed),
   run with Vitest (free, runs on his machine).
7. **Respects Options:** TEXT SPEED fast skips the typing; ANIMATIONS
   reduced skips the flash.

---

## Phase 8 — Table stakes from top portfolios

Built Nov 7–8. Everything runs at build time or in the browser: no paid
service, no new account.

- [x] **Quick view** (`/resume`): the resume as one plain page from
      `app/data/resume.ts`, in the cream panel, with a gold "Download PDF ▶"
      and print styles (Ctrl+P drops the top bar, panel frame and buttons).
      The top bar's "Resume" now opens it (same tab, marked current there),
      and the phone menu has a RESUME row; the hero, case-study footer and
      Contact still link the PDF directly. The phone number stays in the
      PDF only, not on the public page. The PDF is still printed from
      `resume/hcv-resume.html`; both say to change them together.
- [x] **Live trainer card** in About's TRAINER panel: PLAY TIME since the
      first full-time role (Sep 2023), PUBLIC REPOS, LAST PUSH, and a
      52-week strip of commits to public repos, from GitHub's free REST API
      (`app/lib/github.ts`) at build time and at most once a day after
      (ISR). No token needed; an optional free `GITHUB_TOKEN` raises the
      rate limit. If GitHub doesn't answer, only play time and Now show.
      The strip waits until 13 of 52 weeks have public commits: on Nov 8
      only 9 did (97 commits), because most public repos went up in Oct–Nov
      and the year's main work was private.
- [x] **Live proof chips:** "✓ CI passing · last run Nov 7, 2026" on
      SliceOfPie, Pocket Quest and Behavior Tree Editor, linking to the
      run. Shown only when the latest `CI` run on `main` passed; a red or
      missing run shows no chip rather than a false one.
- [x] **Now line** on the trainer card (`app/data/now.ts`): "Building Hold
      Steadfast, my co-op horde-defense game in Unity, and the Behavior
      Tree Editor that runs its enemy AI." Dated NOV 2026. Open-to-roles
      already shows in the hero and the TRAINER tagline, so it isn't
      repeated. Edit it when it stops being true.
- [x] **Field notes** (`/notes`, `/notes/<slug>`): a list page and a post
      page in the case-study style, in the sitemap. First post: the iOS PWA
      launch bug, copied word for word from the SliceOfPie repo, with links
      back to the case study and the GitHub original. SliceOfPie's
      "Write-up" button now opens it on the site. The case-study Markdown
      renderer gained ``` code blocks, `inline code` and ### subheadings
      (no existing case study used them, so those render as before).
- [ ] **Two more field notes, written by Hans:** PaddleOCR vs Tesseract on
      16 receipts, and replaying behavior trees. Not drafted for him: the
      posts should be in his own words. Add each to `app/data/notes.ts`
      with `published: false` to preview it in `npm run dev` first.

Found on the way:

- [x] **Wakebound's "Code" button 404'd for every visitor:** it linked to
      `hansvidaure24/Nebula`, which is private. The link is removed; put it
      back in `app/data/projects.ts` if the repo goes public. Every other
      GitHub link on the site was checked signed out and works.
- [x] The resume still said "13 trees" after the write-up moved to 14; the
      HTML, the PDF (regenerated, still one page) and the Quick view now
      say 14.

Deployed Nov 8 (Vercel preview first, then `main`). Checked on
hansvidaure.dev: Resume opens `/resume`, three CI chips, the trainer card
and Now line, Wakebound without the dead link, the note, the sitemap, and
no console errors on a fresh load.

Lighthouse (mobile, median of 3 on home):

| Page | Performance | Blocking time | A11y / BP / SEO |
| --- | --- | --- | --- |
| Home, local build | 100 | 47 ms | 100 / 100 / 100 |
| Home, **production** | 100 | 74 ms | 100 / 100 / 100 |
| `/resume`, production | 100 | 36 ms | 100 (local) |
| Field note, production | 100 | 82 ms | 100 (local) |

Phone width (375px): no sideways scroll; code blocks scroll on their own.
Print output wasn't checked by eye (no PDF renderer on this machine).

## Phase 9 — Evidence Dex

Every skill on the site, described once, with its proof.

Built Nov 8, shipped with Phases 10 and 11.

- [x] **`app/data/dex.ts`: 33 entries, 30 caught and 3 seen.** Each has a
      name, a type, aliases (the other names job posts and stack chips use),
      the focus picks it belongs to, related skills, and evidence that a
      visitor can follow: a case study, the resume's Fiserv section, a
      repo or a live app. Every evidence line is taken from the resume, the
      case studies, the project data or the repos; nothing new is claimed.
      *Caught* = used at Fiserv or in a live or public project; *seen* =
      only in training (Java & Spring Boot, the trainee capstone) or in a
      game still in development with a private repo (Netcode for
      GameObjects, URP, from Wakebound). Python is in, from the Behavior
      Tree Editor's validator CLI and tested Python server, though the old
      SKILLS panel had it with nothing to back it.
- [x] **About's SKILLS panel is now the SKILL DEX** ("CAUGHT 30 · SEEN 3"):
      a vertical tab list (↑ ↓ Home End, the menu sound) beside the selected
      entry on wide panels, above it on phones (a container query). Each
      entry shows its number, CAUGHT/SEEN, type, ▶ proof links, "Also
      called" and related skills. All 33 entries stay in the HTML; only the
      selected one shows. The clip above it stays.
- [x] **Every stack chip links to its entry:** the 24 chips on the project
      cards (`#dex-<id>`) and each case study's Stack line (`/#dex-<id>`).
      Opening one selects the entry, scrolls the dex just below the top bar,
      scrolls the list to the row and moves keyboard focus there. About
      appears in place, like the tile-wipe jumps, instead of fading in.
      The Quick view's skill rows stay plain text: it mirrors the PDF.
- [x] **`FOCUS_STACK` reads the dex** (each entry's `focus` tags). The
      highlights match the old hand-kept lists, plus ASP.NET and SQL under
      Full-stack (only on the unpublished Fiserv drafts).
- [x] A check script confirmed every stack chip matches an entry, names and
      aliases are unique, related ids and case-study links exist.

Found on the way:

- [x] **Dex links jumped 32px too far and kept re-firing.** About fades up
      32px when it first appears, so the scroll target was measured off by
      that transform; and the listener re-ran on every section change,
      which would have pulled a visitor back to the dex while scrolling
      away. Both fixed and re-checked with a scripted browser.
- [x] Site-wide focus brackets are drawn just inside the dex rows (the list
      scrolls, which clipped them) and hidden on code blocks, which keep a
      gold outline for the same reason.
- [x] The live GitHub data is now fetched once in `app/page.tsx` and passed
      down, so no section waits on the network and a GitHub failure can't
      break one.

Lighthouse (mobile, local production build, Nov 8): home 100 performance,
39 ms blocking time (median of 3; first-load JS 182 → 188 kB for the dex);
accessibility, best practices and SEO 100 on home, a case study and the
field note. Checked at 375px and 1280px in a scripted Edge: list above the
entry on phones, beside it on desktop, no sideways scroll.

## Phase 10 — Type Matchup

Built with Phase 11 on Nov 8 and shipped together with Phases 9 and 11.

- [x] **Matcher** (`app/lib/matchup.ts`, pure TypeScript, no AI, no
      network). Matches dex names and aliases on word boundaries, longest
      first ("React Native" isn't React, "JavaScript" isn't Java, "ASP.NET
      Core" isn't a bare ".NET"). Acronyms ("JS", "CI", "AWS") and names
      that are English words ("React", "Unity", "Swift") only match as
      written, so "react quickly" doesn't count; bare "Go" isn't matched at
      all, only "Golang". Short heading lines sort what follows into
      required, nice to have, or ignored (About us, Benefits); "is a plus"
      or "helpful" lines are nice to have wherever they sit. Reads "3+
      years" / "5-7 years" asks and compares them with full-time years
      since Sep 2023.
- [x] **Effectiveness:** *super effective* = the skill has Fiserv evidence;
      *effective* = shipped in a project (or seen, marked "seen, not
      shipped"); *closest experience* = a skill from `app/data/nearby.ts`
      (32 common asks with no proof on the site: Docker, Kubernetes, AWS,
      Azure, Node.js, PostgreSQL, GraphQL…) shown with its nearest dex
      entries instead of a claimed match. Skills it doesn't recognize are
      left out, and the panel says so.
- [x] **Tests** (`npm test`, Vitest, dev-only): 71, including 10 synthetic
      job posts written for this repo in real-post formats (markdown and
      plain headings, ALL-CAPS sections, "Preferred qualifications",
      About-us and benefits blurbs, a decoy post full of skill-like words).
      Each checks required, nice to have, *nothing else* (no false matches)
      and years. Also: share-link round trips, project ordering, and that
      every stack chip and alias stays matched and unique. Add real posts
      as they come in.
- [x] **Panel:** a gold "Paste a job post ▶" beside the focus picker opens
      the TYPE MATCHUP dialog (fetched when the page is idle, mounted on
      first open; home first-load JS 188 → 189 kB). Textarea, the privacy
      line, "Check matchup ▶" and "Try a sample post". Results: a summary
      strip, the years ask, REQUIRED and NICE TO HAVE groups in battle text,
      each with its first proof link; renamed terms ("SQL Server → SQL")
      link to the dex entry. The dialogue box says the summary.
- [x] **Card reorder and highlights:** "Show matching projects" orders the
      cards by matched chips and case-study evidence (required skills count
      double) and highlights matching chips; a note says what happened, with
      "View the matchup" and "Clear". Picking a focus replaces it.
- [x] **Matchup link:** `/?match=csharp,aspnet,react,~docker,y3#projects`:
      skill ids, "~" for nice to have, "y3" for the years ask; never the
      post. Opening one orders the cards under a "MATCHUP FOR A SHARED JOB
      POST" note; Clear removes it from the address.
- [x] **QA** (scripted Edge, Nov 8): checking a post made **zero network
      requests**; focus lands in the textarea, then on the summary; Escape
      closes; reopening after Clear starts empty; the dialog fits at 375px
      with no sideways scroll; axe finds no violations in either view.
      Analytics records only `matchup_run` with a skill count.

## Phase 11 — Readable by AI tools

Recruiters increasingly screen with AI assistants. Give them clean data from
the same source instead of a scraped page.

All built from the same data files as the pages
(`app/lib/machineReadable.ts`), so they can't drift. No phone number in any
of them.

- [x] **`/llms.txt`** (static, llmstxt.org shape): title, summary with what
      he's looking for and contact, the Now line, start-here links,
      experience, every published project with stack and proof, every dex
      skill with its status and evidence, field notes.
- [x] **`/resume.json`** (static) in the JSON Resume schema: basics,
      profiles, work, projects, education, leadership as volunteer, skills
      grouped by dex type (caught only), languages. The site's JSON-LD
      `Person` gains `knowsAbout` from the caught dex entries.
- [x] **`/api/mcp`**: a read-only Model Context Protocol server (Streamable
      HTTP, stateless, no auth, no new dependency). Tools: `get_profile`,
      `list_projects`, `get_skill_evidence` (any alias; closest skills for
      ones not in the dex) and `match_job` (the same matcher). Rate-limited
      per instance like the contact form, 60 requests per 10 minutes;
      nothing sent is stored. Checked: initialize, the initialized
      notification (202), tools/list, both lookups, unknown methods
      (-32601), GET (405). Runs on the free tier.
- [x] **LINK CABLE row** on the Contact trainer card: "Screening with an AI
      assistant? Point it at hansvidaure.dev/llms.txt or resume.json." The
      MCP endpoint is listed in llms.txt rather than on the card, to keep
      jargon off the page.

Lighthouse (mobile, local production build, Nov 8): home 100 performance,
25 ms blocking time; accessibility, best practices and SEO 100 on home, a
shared-matchup link and `/resume`.

Phases 9–11 deployed Nov 8 (Vercel preview, then `main`). On
hansvidaure.dev: home 100 performance, 34 ms blocking time, CLS 0,
accessibility / best practices / SEO 100; no console errors; the scripted
Type Matchup run (sample post, apply, shared link, clear) behaves as it did
locally with zero requests carrying the post; `llms.txt`, `resume.json` and
the MCP tools answer with hansvidaure.dev links.

## Phase 12 — Explore mode (stretch)

Only after the original mascot exists (Phase 7, kept by choice).

- [ ] An optional small town map in the hero, with an original tileset and
      trainer sprite. Buildings are sections (Lab = Work, House = About,
      Post office = Contact); entering one runs the existing tile wipe to
      that section. The scrolling page stays the default; Explore is
      opt-in and remembered.
- [ ] NPCs each say one proof through the dialogue box ("He builds online banking
      features!").
- [ ] Arrow keys / WASD, a touch d-pad, and gamepads (Gamepad API).
- [ ] **Link cable:** scan a QR and your phone becomes the controller,
      reusing Pocket Quest's WebRTC (PeerJS) and Cloudflare Worker code, on
      the same free tiers Pocket Quest uses.
- [ ] Reduced motion: no walking animation; tap a building to go there.

## Considered and parked

- **Not doing: an AI chat NPC ("Ask Hans").** Hans's call (Nov 7).
- **Bug Battles** (the hardest bug from a project replayed as a turn-based
  battle, one real debugging step per turn, wrong guesses included): the
  most memorable option, but it asks for the most attention, so it suits
  engineers in later rounds, not a recruiter's first pass. A later extra:
  short (6 turns at most), skippable, readable as plain text, and written
  only from real stories. No portfolio found does it; the nearest thing is
  [Beglitched][bg], a game whose designer found debugging-as-a-puzzle
  tedious, so visitors would watch, never solve.
- **Party link** (recruiters "catch" the projects that matter and copy a
  link to a trimmed page): low friction, but only useful when they forward
  the site.
- **Save file** (a "welcome back, here's what's new" note): least
  intrusive, but most recruiters visit once.
- **Screening FAQ as a battle menu** (FIGHT: tech questions, BAG:
  logistics, RUN: resume): maybe after Phase 10, if recruiters keep asking
  the same questions.
- **Visitor presence** (other visitors as tiny trainers): costs a realtime
  server and gives a recruiter nothing.
- **3D / WebGL and loading screens**: rejected (see Research).

## Design rules for new work

Everything from Phases 1–6 still applies. For the new features:

- **Free only.** No paid services, subscriptions or new accounts with a
  bill. Features run in the visitor's browser or at build time on the
  hosting already in use; anything that needs a server uses a free tier
  that stops rather than charges.
- **Never in the way.** A recruiter on a 90-second first pass must never
  have to go through a feature to reach the content; every feature is
  optional and skippable in one click.
- Panels are `PixelPanel`, headings are `SectionHeading`, lists use the
  `arrow-list` and `chip` mixins.
- Feedback goes through `useDialogue().say()`; section jumps use the tile
  wipe. No new transitions.
- Every feature reads Options: TEXT SPEED fast skips typing, ANIMATIONS
  reduced removes motion, TIME OF DAY recolors scenery.
- Colors and type come only from the tokens in `globals.scss`; PokePixel
  never below 14px.
- New art is original. No new borrowed assets.
- Each phase ends with a desktop + phone check, Lighthouse accessibility
  100, and no horizontal overflow at 375, 768 and 1440px.

## Sources

- [Web Design Awards: portfolio category][wda] and
  [best portfolio websites](https://www.webdesignawards.io/best/portfolio-websites)
- Developer portfolios: [Brittany Chiang][bc], [Bruno Simon][bs],
  [Robby Leonardi][rl], [Rauno Freiberg][rf], [Josh W. Comeau][jc],
  [Lee Robinson][lr], [Erfan Mirasadi][em], [Diego Sevilla][ds],
  [Aman Yadav](https://yadavaman.com/), [Emma Poliakova][ep]
- "Best of" lists: [DEV Community 2026](https://dev.to/_d7eb1c1703182e3ce1782/best-developer-portfolio-examples-2026-2d8m),
  [Colorlib 2026](https://colorlib.com/wp/page/16/?mode=jqm)
- Recruiters: [profy.dev survey of 60+ hiring managers](https://profy.dev/article/portfolio-websites-survey),
  [how recruiters review portfolios (~90 seconds)](https://eportfolio-c0z.pages.dev/blog/2025-12-28-how-recruiters-actually-review-portfolios)
- Realtime building blocks: [PartyKit cursor party][cp],
  [TouchCoop (phones as controllers over WebRTC)](https://dev.to/remojansen/turning-your-living-room-into-a-couch-co-op-arena-with-touchcoop-249j)
- Debugging as a battle: [Beglitched design deep dive][bg]; nearest
  portfolio match, a combat-system write-up:
  [Eleanor Gregory](https://stareyednya.github.io/pages/timedhits.html)

[wda]: https://www.webdesignawards.io/categories/portfolio
[bc]: https://brittanychiang.com
[bs]: https://github.com/brunosimon/folio-2025
[rl]: http://www.rleonardi.com/interactive-resume/
[rf]: https://rauno.me
[jc]: https://www.joshwcomeau.com
[lr]: https://leerob.com
[em]: https://iamerfan.me/
[ds]: https://diegosevilla.dev/
[ep]: https://emmapoliakova.github.io/PersonalPortfolio
[cp]: https://github.com/partykit/cursor-party
[ai1]: https://rockstardeveloperuniversity.com/developer-portfolio-project-ideas/
[ai2]: https://www.digitalapplied.com/blog/ai-developer-hiring-skills-that-matter-2026
[bg]: https://gamedeveloper.com/design/game-design-deep-dive-making-debugging-into-a-mechanic-in-i-beglitched-i-

---

# Record: Phases 1–6 (done)

Kept as the record of how the design system was built. Deployed in
Phase 7.

## Phase 1 — Foundation: tokens and motion rules

Everything later depends on this.

- [x] Design tokens as CSS custom properties in `app/scss/globals.scss`:
      colors, font families, type scale, border, shadows, motion durations
      and easing. Framer Motion mirror in `app/lib/motion.ts`.
- [x] Shared Sass mixins in `app/scss/_mixins.scss`: pixel button
      (one hover/press rule), pixel panel, display text.
- [x] Tailwind palette points at the same tokens (one source of truth).
- [x] Core palette, fonts and simple shadows moved onto tokens in every
      component stylesheet. Section-specific colors (about purple/mint,
      party blue, sky/sea) are left for Phases 2–3, which replace them.
- [x] Square corners everywhere except genuinely round things (Pokéballs,
      icon circles in the contact card until Phase 2 replaces them).
- [x] One hover/press rule on every pixel button (hero, top bar, project
      cards, play demo, case-study CTA, 404, contact dialog); no scale or
      blur in UI motion (menu glow, Torchic, speech bubble, dialog).
- [x] PokePixel never below 14px (contact card was 9.6px); Inter for all
      body text, including form inputs; Quicksand removed.
- [x] "Reduce motion" covers the menu (it used only the OS setting).
- [x] Every font size on the type scale (finished in Phase 2).

## Phase 2 — Consistency pass

- [x] One `SectionHeading` (the wooden sign, compact on phones) for Work,
      About, Why me and Contact, left-aligned on the same 72rem column.
- [x] One panel surface: `PixelPanel` (cream, gold title bar) for every
      About, Why me and Contact panel and the contact dialog. Pink/purple,
      mint, dark-green, teal-header and green-terminal styles removed.
- [x] Shared chips and ▶ lists (`chip`, `arrow-list` mixins) used by project
      cards, About and the contact card.
- [x] Contact: a gold "Send a message ▶" button plus labeled GitHub, LinkedIn
      and Resume buttons, instead of four unlabeled 35×35 icons.
- [x] Menu: labels match the top nav ("ABOUT"), stray "→" row removed, the
      Pokéball only shows below 761px (where the top bar has no links) and
      is 56px on phones instead of 72px.
- [x] Top bar: reduce-motion toggle next to sound (phones keep it in the
      menu); fits at every width from 375px to desktop.
- [x] Phone hero: a 120px Pokédex above the name; hero 1,167px → 1,014px
      and "See my work" now inside the first 812px screen.
- [x] Case-study pages and the 404 use the shared TopBar (links go back to
      home sections) and the cream panel.

## Phase 3 — One world, one motion language

- [x] **Time-of-day palette:** `data-time` on `<html>` (morning 5–10, day
      10–17, dusk 17–20, night 20–5) set before first paint by
      `app/lib/timeOfDay.ts`; four scenery palettes in `globals.scss`. Hero
      sky/hills/water, the Work grass, the About forest, a green plaza for
      Why me (was blue), a tint over the Contact painting, and the
      case-study/404 backdrop all read it. Preview any palette with
      `?time=morning|day|dusk|night`. Stars only at dusk and night.
- [x] **One transition:** the hero's 10×6 ink tile grid now also does
      section jumps, on phones too, in a stepped diagonal sweep; the navy
      slanted band is gone. A section reached by a jump appears in place
      (no second fade). Reduced motion jumps instantly (also fixed: smooth
      scrolling on `<html>` ignored the reduce-motion setting).
- [x] Calm hero: blur filters and glow blobs removed, hills no longer morph,
      only the front water layer moves (SVG animations 7 → 1), Pokédex bob
      14px → 4px.
- [x] Signature motion per section: Work, the card's Pokéball wobbles on
      hover; About (and project metrics), the ▶ steps forward on the line
      you point at; Why me, a blinking battle-menu ▶ beside the move.
- [x] **Pixel-mosaic loading:** each cover shows a 16px copy as big pixels
      while loading, then sharpens 16 → 32 → 64 → full (instant with reduced
      motion). Demo clips stay hidden until actually playing.
- [x] One video rule: desktop plays every demo muted while on screen
      (downloads only once scrolled to); phones and reduced motion show
      "▶ Play demo" on every card. The per-clip `autoplay` flag is gone.
- [x] Contact typing line: 68 → 32ms per letter (about 1.3s), a click
      finishes it, and the typing sound stops with the text. Watched live
      in Phase 6.

## Phase 4 — Shared UI systems

- [x] **Options screen** (`OptionsDialog`, `OptionsProvider`): TEXT SPEED
      (normal/fast), ANIMATIONS (full/reduced), SOUND (off/on) and TIME OF DAY
      (auto/morning/day/dusk/night) in one cream panel. Click cycles a value,
      ← → step through it; Escape closes and focus returns. Opened from one
      sliders button in the top bar (replaces the sound and motion buttons, so
      it fits on phones too) and an OPTIONS row in the Pokéball menu.
- [x] Settings are remembered (`app/lib/preferences.ts`) and applied before
      first paint. **Fast** skips the hero intro wipe and reveals, the
      section fade-ins, the Contact typing and dialogue typing.
- [x] **Dialogue box** (`DialogueProvider`, `useDialogue().say()`): one GBA
      text box along the bottom that types its line, shows a blinking ▼,
      closes on click or after 3.5s, and announces the full line to screen
      readers. On phones it sits beside the Pokéball. Used for: email copied
      (and a "press Ctrl+C" line if the browser blocks the clipboard),
      message sent (the mailbox now closes immediately), and Torchic (its
      speech bubble only showed above 1400px).
- [x] Form errors stay inline next to their fields on purpose: that's where
      people (and screen readers) look for them.

## Phase 5 — Recruiter features

- [x] **Choose your focus:** All / Full-stack / C# / .NET & security / Game
      tools, a radio group (← → keys) above the cards. It reorders them by
      each project's `focus` score (the top one gets the wide layout, in a
      stepped layout animation), highlights matching stack chips in gold,
      says what it did in the dialogue box, and is remembered. The C# / .NET
      pick adds a note that this work is mostly at Fiserv, with the resume's
      numbers and links to About and the resume. Fiserv case studies already
      score highest for it, for when they're published.
- [x] **Evolution timeline:** Player → Student → Trainee → Engineer → ???
      (the role he wants, with a "Send a message" button), from the resume.
      Horizontal on desktop, vertical on phones; each stage flashes white in
      turn when it scrolls in (skipped with reduced motion or Fast text).
- [x] **Why me merged into About:** the moves and the (hidden until filled)
      teammate quotes now sit in About; the section, its nav links and its
      plaza colors are gone. Nav is Work / About / Contact. The "How I got
      here" story is now the timeline, so nothing is said twice.
- [x] **Tabbed case studies:** write-up headings are sorted into Overview /
      Decisions / Results (only tabs with content show); ← → Home End on the
      tab row. Stat bars only where a number has a real maximum: SliceOfPie
      (Lighthouse, PaddleOCR 16/16 vs Tesseract 4/16) and Behavior Tree
      Editor (14/14 trees), with HP-bar colors.
- [x] **Case-study morph:** "Case study" runs Next's router inside
      `document.startViewTransition`; the cover and title share
      `view-transition-name`s with the case-study page. No View Transitions:
      the tile wipe covers the screen first. Reduced motion or a modified
      click (new tab): a plain link. If the browser never starts the
      transition, it navigates anyway after a second.
- [x] Watched live in Phase 6 (two bugs found and fixed there).

## Phase 6 — QA and launch

- [x] **Production build** passes (14 pages; Fiserv drafts excluded).
- [x] **Lighthouse** (mobile, before → after):

      | Page | Performance | Accessibility | Best practices | SEO |
      | --- | --- | --- | --- | --- |
      | Home | 61 → 72–73 | 100 | 100 | 100 |
      | SliceOfPie case study | 74 → 96 | 100 | 100 | 100 |

      Home on desktop: 99. Fixes: Inter through `next/font` (455 KB TTF →
      48 KB latin WOFF2, preloaded, size-matched fallback; CLS 0.079 →
      0.017); case-study cover loads with priority; the Contact card photo
      is no longer high-priority and is served at its 192px display size
      (the source is 9.4 MB); the hero name, role and summary paint at once
      instead of fading in; Google Analytics loads after the page
      (`lazyOnload`). Unused Inter/Quicksand TTFs removed.
- [x] **Accessibility**: one h1, no skipped heading levels, no duplicate
      ids, every control named, every image has alt. Contrast fixed where it
      failed: section-sign text (2.4:1 → 3.2:1+, large text), small green
      labels (`--accent-green` 4.2:1 → 5.2:1), and the Contact typing line
      (now on a dark strip, ~1.5:1 → ~6:1). Hero text is 4.7:1+ in all four
      time-of-day palettes.
- [x] **Keyboard**: logical tab order (top bar → hero → focus picker, one
      stop → cards → timeline CTA → Contact), focus ring on every stop, no
      traps; dialogs trap focus and restore it.
- [x] **Reduced motion**: no looping animation, no intro wipe or parallax,
      play buttons instead of autoplay, no fades, no evolution flash, instant
      section jumps.
- [x] **Layout**: no horizontal overflow on home, case studies or the 404
      at 375, 768 and 1440px.
- [x] **Animations watched at real speed**: tile wipe fully covers at the
      jump (all 60 tiles at ~400ms, clear by ~770ms); Contact typing ~1.3s;
      evolution flash ~1.8s; picking a focus runs with no frame over 17ms.
      Fixed: the featured card's reorder ran backwards (the wide slot was
      reused instead of keyed per project), and the morph sat on the old
      page for 2s (it waited on requestAnimationFrame, which browsers pause
      during a view transition). The morph now starts in ~0.3s. Stat bars
      now all share one length.
- [x] **Launch**: deployed Nov 7 in Phase 7.
