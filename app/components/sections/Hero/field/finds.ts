// Something to find (Phase 13c): now and then a gem or a star twinkles in
// the grass for a while. Clicking it collects it; the third one plays the
// level-up burst and the dialogue box points at the work. Nothing to lose,
// nothing that blocks, and it stops after three. SpritePilot CC0 art
// (assets-src/spritepilot/*/LICENSE.txt).

import type { Drawable } from "./life";
import { rng, TILE, type Field } from "./fieldMap";

export type FindArt = "gem" | "star" | "magic-sparkle" | "level-up";
// size: which of the pack's drawings. The finds are small; the level-up
// burst is the big moment.
const STRIPS: Record<FindArt, { size: 16 | 32; frames: number; fps: number }> = {
  gem: { size: 16, frames: 8, fps: 10 },
  star: { size: 16, frames: 10, fps: 10 },
  "magic-sparkle": { size: 16, frames: 8, fps: 10 },
  "level-up": { size: 32, frames: 12, fps: 15 },
};
export const FIND_ART = Object.keys(STRIPS) as FindArt[];
export const findUrl = (a: FindArt) => `/graphics/spritepilot/${a}-${STRIPS[a].size}px_strip${STRIPS[a].frames}.png`;

export const FINDS_TO_LEVEL_UP = 3;
const SIZE = 16; // a find's size
const FIRST_AFTER = 20; // seconds on the hero before the first one
const BETWEEN: [number, number] = [30, 50];
const STAYS = 16; // seconds a find twinkles before it fades

// Kept at module scope, so the count lasts for the visit even when the hero
// re-lays itself out (a resize, a new time of day). A reload starts over.
let found = 0;

type Kind = "gem" | "star";
type Burst = { art: "magic-sparkle" | "level-up"; x: number; y: number; age: number };

export type Collected = { kind: Kind; count: number; levelUp: boolean };

export function findLine({ kind, count, levelUp }: Collected) {
  if (levelUp) return `Level up! You found all ${FINDS_TO_LEVEL_UP}. That's everything hidden here; the real work is just below.`;
  if (count === 1) return `You found a ${kind}! 1 of ${FINDS_TO_LEVEL_UP}. Keep an eye on the grass.`;
  return `Another ${kind}! ${count} of ${FINDS_TO_LEVEL_UP}.`;
}

export const findSound = (c: Collected) => `/sounds/finds/${c.kind}.mp3`;
export const LEVEL_UP_SOUND = "/sounds/finds/level-up.mp3";

export class Finds {
  private item: { kind: Kind; x: number; y: number; age: number } | null = null;
  private bursts: Burst[] = [];
  private time = 0;
  private nextAt: number;
  private still = false;
  private random: () => number;

  constructor(
    private field: Field,
    private images: Record<FindArt, HTMLImageElement>,
    seed = 13,
  ) {
    this.random = rng(seed + found);
    this.nextAt = found === 0 ? FIRST_AFTER : this.between();
  }

  private between() {
    const [a, b] = BETWEEN;
    return this.time + a + this.random() * (b - a);
  }

  /** A cell in the open: on screen, with a cell of grass all round it. */
  private spot() {
    const { w, h, walkable } = this.field;
    const open = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && walkable[y * w + x] === 1;
    for (let n = 0; n < 200; n++) {
      const x = Math.floor(this.random() * w);
      const y = Math.floor(this.random() * h);
      if (open(x, y) && open(x - 1, y) && open(x + 1, y) && open(x, y - 1) && open(x, y + 1)) return { x: x * TILE, y: y * TILE };
    }
    return null;
  }

  update(dt: number, still: boolean) {
    this.still = still;
    this.time += dt;
    for (const b of this.bursts) b.age += dt;
    this.bursts = this.bursts.filter((b) => b.age < STRIPS[b.art].frames / STRIPS[b.art].fps);

    if (this.item) {
      this.item.age += dt;
      if (this.item.age > STAYS) {
        this.bursts.push({ art: "magic-sparkle", x: this.item.x, y: this.item.y, age: 0 });
        this.item = null;
        this.nextAt = this.between();
      }
    } else if (found < FINDS_TO_LEVEL_UP && this.time >= this.nextAt) {
      const spot = this.spot();
      if (spot) this.item = { kind: this.random() < 0.5 ? "gem" : "star", ...spot, age: 0 };
      else this.nextAt = this.between();
    }
  }

  /** Is (x, y), in map pixels, on the find? A little generous, for fingers. */
  hit(x: number, y: number) {
    const i = this.item;
    return !!i && x >= i.x - 4 && x <= i.x + SIZE + 4 && y >= i.y - 4 && y <= i.y + SIZE + 4;
  }

  collect(): Collected | null {
    const i = this.item;
    if (!i) return null;
    found += 1;
    this.item = null;
    this.bursts.push({ art: "magic-sparkle", x: i.x, y: i.y, age: 0 });
    const levelUp = found === FINDS_TO_LEVEL_UP;
    if (levelUp) this.bursts.push({ art: "level-up", x: i.x - SIZE / 2, y: i.y - SIZE * 2, age: 0 });
    this.nextAt = this.between();
    return { kind: i.kind, count: found, levelUp };
  }

  private frame(art: FindArt, age: number) {
    if (this.still) return 0;
    const { frames, fps } = STRIPS[art];
    return Math.floor(age * fps) % frames;
  }

  private sprite(ctx: CanvasRenderingContext2D, art: FindArt, frame: number, x: number, y: number) {
    const { size } = STRIPS[art];
    ctx.drawImage(this.images[art], frame * size, 0, size, size, Math.round(x), Math.round(y), size, size);
  }

  /** The find itself, sorted with the critters so they can pass in front of it. */
  ground(): Drawable[] {
    const i = this.item;
    if (!i) return [];
    return [
      {
        baseY: i.y + SIZE,
        draw: (ctx) => {
          // It fades in over its first half second and out over its last two.
          ctx.globalAlpha = Math.min(1, i.age / 0.5, (STAYS - i.age) / 2);
          this.sprite(ctx, i.kind, this.frame(i.kind, i.age), i.x, i.y);
          // A sparkle every few seconds, so it catches the eye without nagging.
          const twinkle = i.age % 3;
          if (!this.still && twinkle < 0.8) this.sprite(ctx, "magic-sparkle", this.frame("magic-sparkle", twinkle), i.x, i.y - 4);
          ctx.globalAlpha = 1;
        },
      },
    ];
  }

  /** Sparkles and the level-up burst, over everything. */
  air(): Drawable[] {
    return this.bursts.map((b) => ({
      baseY: 0,
      draw: (ctx) => {
        const { frames, fps } = STRIPS[b.art];
        this.sprite(ctx, b.art, this.still ? frames - 1 : Math.min(frames - 1, Math.floor(b.age * fps)), b.x, b.y);
      },
    }));
  }
}
