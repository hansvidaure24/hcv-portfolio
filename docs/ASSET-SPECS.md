# Asset specs

What Hans needs to make or gather for [DESIGN-ROADMAP.md](DESIGN-ROADMAP.md),
and the exact format for each. Anything not listed here (frames, panels, the
d-pad, skies, icons) gets drawn in code.

Drop finished files in `assets-src/` (sources such as `.aseprite`, `.piskel`,
`.tmj` and `.beepbox` links) plus the exported files. They get optimized and
wired in from there.

## At a glance

| # | Asset | For | Kind | Priority |
| --- | --- | --- | --- | --- |
| 1 | 10 job posts + your verdict on each | Phase 10 Type Matchup tests | Text you gather | **Now**: blocks Phase 10 |
| 2 | Skill list marked caught / seen | Phase 9 Evidence Dex | Corrections to a draft | **Now**: blocks Phases 9–10 |
| 3 | 2–3 teammate quotes | About (hidden until filled) | Text from others | **Now**: takes the longest |
| 4 | Plain portrait photo + card text | Replaces the Pokémon trading card | Photo | Soon: borrowed art is live |
| 5 | Hero photo without Piplup | Replaces `hero-avatar.jpg` | Photo | Soon |
| 6 | Mascot sprite + cry | Replaces Torchic | Pixel art + sound | Soon; required before Phase 12 |
| 7 | Background music loop | Replaces `pokemon-bgmusic.mp3` | Music | Soon |
| 8 | UI sound effects | Replaces the game sounds | Sounds | **Done** (CC0, SpritePilot) |
| 9 | GitHub token | Phase 8 activity strip | Setting, not art | Phase 8 |
| 10 | Town tileset + 3 buildings | Phase 12 Explore mode | Pixel art | December |
| 11 | Trainer walk sprite | Phase 12 | Pixel art | December |
| 12 | 3–4 NPC sprites | Phase 12 | Pixel art | December |
| 13 | Town map | Phase 12 | Tiled map or a sketch | December |
| 14 | Explore sound effects | Phase 12 | Sounds | December, optional |

No borrowed Pokémon art is left (Nov 9): see the end.

---

## Rules for all art and audio

- **Original only.** No tracing, recoloring or remixing sprites, melodies or
  sounds from Pokémon or any other game. Genre conventions are fine: 16px
  tiles, top-down towns, chiptune. Silhouette test for characters: if
  someone could name the Pokémon it looks like, redraw it.
- **Pixel art:** draw at native size and export PNG with transparency. No
  anti-aliasing, soft brushes or half-transparent pixels. The site scales by
  whole numbers (2×, 3×, 4×) with `image-rendering: pixelated`, so never
  upscale before exporting.
- **Palette:** at most 16 colors per sprite (plus transparent), GBA style.
  Start from the site's colors so new art matches:

  | Token | Hex | Use |
  | --- | --- | --- |
  | ink | `#2A2A1E` | outlines |
  | ink-soft | `#3A3A2C` | dark shading |
  | ink-muted | `#6B5A3A` | wood, dirt |
  | cream | `#F8EFD8` | light surfaces |
  | paper | `#FFFDF5` | highlights |
  | gold | `#FDE68A` | accents |
  | gold-deep | `#F5B942` | accent shading |
  | accent-green | `#157A64` | foliage dark |
  | grass (day) | `#5AA585` | ground |
  | grass stripe (day) | `#519778` | ground variation |

- **Draw daytime only.** The site already tints scenery for morning, dusk and
  night. If you want lit windows or lamps at night, draw them as a separate
  overlay layer.
- **File names:** lowercase with hyphens (`mascot-idle.png`), one sheet per
  character.
- **Sprite sheets:** frames left to right in one row per animation, no gaps
  or margins, every frame the same size. Write the frame size and frames per
  second in a `.txt` next to the sheet.
- **Free tools** (to match the "Free only" rule): Piskel or Pixelorama for
  pixel art, Tiled for maps, BeepBox or FamiStudio for music, jsfxr or
  ChipTone for sound effects, Audacity for trimming.
- **Audio:** MP3, 44.1 kHz. Sound effects mono with no silence at the start
  (a gap makes clicks feel slow), peak around −1 dBFS.

---

## 1. Job posts for Type Matchup (Phase 10)

The matcher's test fixtures. Without real posts it can only be tested
against made-up ones.

- **10 posts** you'd realistically apply to: about 4 full-stack C#/.NET,
  3 React/TypeScript, 2 fintech or security-leaning, 1 game tools.
- From different sites (LinkedIn, Indeed, Greenhouse, Lever, Workday), since
  each formats requirements differently.
- **Plain text, pasted as-is**, including headings like "Requirements",
  "Preferred" and "Nice to have", and bullet characters.
- **Remove** the company name, recruiter names, links and salary.
- One file each: `assets-src/jobs/01-fullstack-dotnet.txt`, `02-...`.
- At the bottom of each file, after a line with `---`, your honest verdict:
  `apply`, `stretch` or `no`, plus any skill you think the matcher must
  catch. These become the test's expected answers.

## 2. Skill list (Phase 9)

A draft of about 30 skills comes from the resume, site and repos. You
correct it:

- **caught**: used at work or shipped in a project. **seen**: learned or
  tried.
- Remove anything you wouldn't want to be asked about in an interview.
- Add names job posts use for the same thing if a common one is missing.

## 3. Teammate quotes

Format already in `app/data/party.ts`:

- 1–3 sentences in their words, their name and role ("Senior Software
  Engineer, Fiserv"), and a link if one exists (a LinkedIn recommendation is
  easiest).
- Get their OK to publish it.

## 4. Portrait for the trainer card (replaces `hans.png`)

The current card is a Pokémon TCG frame, with its copyright line. The new
frame gets drawn in code in the site's own style (cream panel, ink border),
so only the photo is needed.

- **Photo:** at least 768×1076 px (5:7, portrait), JPG, or PNG with the
  background removed. Waist up, face in the top third, plain background.
  No characters or logos edited in.
- **Card text** (optional, it's yours to write): a name line, an "HP"-style
  number, and two "moves", each a name plus a one-line description.

## 5. Hero photo (replaces `hero-avatar.jpg`)

The current one has Piplup edited in.

- **1080×1080 px JPG**, under 250 KB.
- The Pokédex screen crops it to roughly 4:3 landscape, so keep your face
  and shoulders inside the middle 60% of the square.
- The same Dumbo photo with Piplup removed works, or a new photo. Once the
  mascot exists, it can stand in the photo instead.

## 6. Mascot (replaces Torchic)

Your own creature or companion. It also follows the trainer in Explore mode.

- **Concept first:** a name, one sentence about it (used for alt text and
  dialogue), and a front-view sketch. Worth a check before animating.
- **Sprite sheet `mascot.png`, 32×32 px frames**, shown at 3–4×:
  - Row 1, idle: 4 frames, loop, about 6 fps.
  - Row 2, happy (plays once when clicked): 4–6 frames, about 10 fps.
  - Rows 3–6, walk (for Explore mode, can come later): down, up, left,
    right, 3 frames each. Right can be the left row mirrored if it's
    symmetric.
- Readable at 64 px: a clear silhouette, 2–3 main colors plus the ink
  outline.
- **Cry `mascot-cry.mp3`:** under 1 second, under 15 KB.

## 7. Background music (replaces `pokemon-bgmusic.mp3`)

- **An original chiptune loop, 60–120 seconds**, calm "town" mood, about
  90–120 BPM. It plays only after a visitor turns sound on, so avoid a loud
  start.
- **Must loop seamlessly:** the last bar leads into the first. Note the
  loop point if it isn't the whole file.
- MP3 at 128 kbps, under 2 MB (the current file is 4.2 MB), at about the
  same loudness as the sound effects.
- Write the melody yourself; don't rearrange an existing game's tune.

## 8. UI sound effects

**Done (Nov 9), no file needed from you.** Replaced with SpritePilot's CC0
interface sounds (click, toggle, confirm, and a 45 ms tap the typing line
repeats), built by `assets-src/spritepilot/build_sounds.py`. The spec
below is kept for reference.

These looked like game rips.

| File | Plays when | Length |
| --- | --- | --- |
| `press-start.mp3` | "See my work", opening a case study | about 1 s |
| `button.mp3` | most clicks | under 0.2 s |
| `menu-navigation.mp3` | moving through menus, tabs | under 0.1 s |
| `type.mp3` | Contact typing line | **one 30–60 ms blip**; the code repeats it instead of playing a 2.3 s recording |

Under 10 KB each. One family of sounds, made with the same tool and
settings, so they belong together.

## 9. GitHub token (Phase 8)

Not art. The activity strip on the trainer card needs GitHub's GraphQL API.
Create a **fine-grained personal access token** (free) with read-only
access to public repositories, and add it as `GITHUB_TOKEN` in Vercel's
environment variables. Without it, the card shows only what the public API
gives.

---

## Explore mode art (Phase 12)

The roadmap's stretch phase: a small town in the hero where buildings are
sections. Make the map last; the tiles come first.

### 10. Tileset and buildings

- **`town-tiles.png`: 16×16 tiles**, 256 px wide (16 tiles per row), no
  spacing or margin.
- Ground: grass (3 variants), a dirt or stone path with all edges and
  corners (a 3×3 block plus 4 inner corners), and flowers (2-frame
  animation).
- Water with shore edges and corners. Animate it in 4 frames, laid out as
  4 copies of the water tiles side by side.
- Nature: trees about 32×48 (the bottom row blocks walking, the top draws
  over the player), bushes and rocks.
- Props: fences (horizontal, vertical, corners), a signpost, a lamp post and
  a mailbox.
- **Buildings**, each its own PNG on the 16 px grid, with the door one tile
  wide, centered in the bottom row:

  | File | Section | Size |
  | --- | --- | --- |
  | `building-lab.png` | Work | 80×64 (5×4 tiles) |
  | `building-house.png` | About | 64×64 (4×4) |
  | `building-post.png` | Contact | 64×64 (4×4) |

  Give each a distinct roof color so they read at a glance. The signs with
  section names are drawn in code in the site's font.

### 11. Trainer sprite (you)

- **`trainer.png`, 16×32 px frames**: 3 columns (stand, step A, step B) by
  4 rows (down, up, left, right). The sheet is 48×128.
- Walks at about 8 fps. Recognizably you: hair, glasses, a shirt color you'd
  wear.

### 12. NPCs

- **3–4 characters, 16×32 px**, one sheet each: 4 frames (facing down, up,
  left, right). The sheet is 64×32.
- Each one says one line ("Have you tried Pocket Quest? It's playable now!"), drafted
  from the site's data for your OK. Give each a look that hints at its topic
  (a scientist near the Lab, a mail carrier by the Post office).

### 13. Town map

- About **30×20 tiles** (480×320 px, 2× a GBA screen), built in **Tiled** and
  saved as JSON (`town.tmj`) with these layers:
  - `ground`, `decor`, `above` (tree tops and roofs drawn over the player);
  - `collision`: any tile marks a blocked cell;
  - `objects`: `spawn` (where you start), `door` (with a `section` property:
    `work`, `about` or `contact`), and `npc` (with an `id`).
- Or a grid sketch on paper (one square per tile), and it gets built in
  Tiled for you.

### 14. Explore sound effects (optional)

Same rules as #8: a bump into a wall, a door opening (under 0.5 s), and
footsteps only if they're very quiet.

---

## 15. Small UI icons (done Nov 9, Flaticon, credited)

Five 16×16 pixel icons in `app/components/ui/PixelIcon.tsx`: **play**
(live demo), **code** (`< >`, source), **page** (write-up), **menu** (three
bars, the phone's menu button) and **copy** (the email's copy button).
Traced to whole pixels from the icons Hans picked on Flaticon (Nov 9; the
16px files had soft, anti-aliased edges): menu and document by menon (Pixel
pack), code by Taufik Ramadhan (Arrow Pixel Art), play by Disha Vaghasiya
(Pixel Arrow Icon), copy by frelayasia (Pixel User Interface). Flaticon's
free license needs a credit: it's under the contact card ("Icons by menon,
Taufik Ramadhan, Disha Vaghasiya and frelayasia from Flaticon"). Keep it as
long as these icons (or tracings of them) are used. The files themselves
aren't in the repo.

- One set, one artist, so they match: 16×16 on a pixel grid, one color (the
  code tints them), transparent background. SVG or a 1× PNG.
- Draw your own, or pick a set whose license fits a public repo: MIT or CC0
  (Pixelarticons is MIT: keep its license file) is simplest. Flaticon's free
  icons need a credit line on the site, and can't be used as standalone
  files, so check that a public GitHub repo is allowed before using them.
- GitHub and LinkedIn stay words: their logos are trademarks to use as
  issued, not redrawn.
- To swap one: replace its rectangles in `PixelIcon.tsx` (or render the
  file there); every place that uses it follows.

## Decisions only (no file from you)

- **Font:** done (Nov 9). The fan copy of the Pokémon GBA font
  (`pokepixel-gba.ttf`, no license on file) is gone; the display font is
  Pixelify Sans (SIL Open Font License, `public/fonts/OFL-pixelify-sans.txt`),
  scaled up 134% in `app/layout.tsx` so every size reads as before.
- **Pokéball:** done (Nov 9). The phone menu is a three-bar icon, and the
  little Pokéball on each project card is a square status light.
- **Pokédex frame:** done (Nov 9). The hero photo sits in a frame built like
  the site's panels (cream, ink border, gold "PLAYER 1" bar, a scan line).
- **Contact background:** done (Nov 9). `pokemonbackground.png` is gone; the
  section has an original pixel shore drawn in code
  (`app/components/sections/Contact/shore.ts`).
- **Unused files:** the old icons (`home.png`, `message.png`, the GitHub
  and LinkedIn PNGs and six more) were deleted Nov 9; `back.mp3` is still
  there if unused.
