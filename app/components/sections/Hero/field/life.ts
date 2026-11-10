// The small things around the critters (Phase 13a): tall grass swaying in
// clumps along the screen's edges, fireflies at dusk and night, and the heart
// that pops when someone clicks a critter. (Falling leaves were cut: the
// pack's animation looked awkward drifting across the field.) SpritePilot CC0 art (assets-src/spritepilot/*/LICENSE.txt).
//
// Three layers, so the canvas can stack them: ground() sorts in with the
// critters (a beetle can walk behind the grass), air() is drawn over
// everything, and glow() goes on its own canvas above the time-of-day tint,
// so fireflies light up at night instead of being dimmed with the field.

import type { Point } from "./cast";
import { rng, TILE, type Field } from "./fieldMap";

export type LifeArt = "tall-grass" | "fireflies" | "heart";
// size: which of the pack's drawings (16 or 32 px), shown at the same pixel
// scale as everything else, so the grass stands taller than a bee.
const STRIPS: Record<LifeArt, { size: 16 | 32; frames: number; fps: number }> = {
  "tall-grass": { size: 32, frames: 12, fps: 10 },
  fireflies: { size: 32, frames: 16, fps: 10 },
  heart: { size: 16, frames: 5, fps: 8 },
};
export const LIFE_ART = Object.keys(STRIPS) as LifeArt[];
export const lifeUrl = (a: LifeArt) => `/graphics/spritepilot/${a}-${STRIPS[a].size}px_strip${STRIPS[a].frames}.png`;

export type Drawable = { baseY: number; draw: (ctx: CanvasRenderingContext2D) => void };

const POP_SECONDS = 0.9;

// How many fireflies, by the site's time of day.
const FIREFLIES: Record<string, number> = { morning: 0, day: 0, dusk: 3, night: 6 };

type Drifter = { x: number; y: number; vx: number; vy: number; phase: number };
type Grass = { x: number; y: number; clock: number; rustle: number };
// Seconds grass keeps rustling after something brushes through it, and how
// much faster it sways meanwhile.
const RUSTLE = 0.7;
const RUSTLE_SPEED = 3;

export class FieldLife {
  private grass: Grass[] = [];
  private fireflies: Drifter[] = [];
  private pops: { x: number; y: number; age: number }[] = [];
  private time = 0;
  private still = false;
  private pointer: Point | null = null;
  private random: () => number;
  private width: number;
  private height: number;

  constructor(
    private field: Field,
    private images: Record<LifeArt, HTMLImageElement>,
    timeOfDay: string,
    seed = 9,
  ) {
    this.random = rng(seed);
    this.width = field.w * TILE;
    this.height = field.h * TILE;
    const { w, h, walkable } = field;

    // Tall grass: clumps of two or three along the left, right and bottom
    // edges, never out in the open where it would compete with the text.
    const edge: number[] = [];
    let open = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!walkable[i]) continue;
        open++;
        if (x <= 1 || x >= w - 3 || y >= h - 3) edge.push(i);
      }
    }
    const taken = new Set<number>();
    for (let n = Math.round(edge.length / 14); n > 0; n--) {
      const start = edge[Math.floor(this.random() * edge.length)];
      if (start === undefined) break;
      const size = 2 + Math.floor(this.random() * 2);
      for (let k = 0; k < size; k++) {
        const i = start + k;
        if (!walkable[i] || taken.has(i) || Math.floor(i / w) !== Math.floor(start / w)) break;
        taken.add(i);
        this.grass.push({ x: (i % w) * TILE, y: Math.floor(i / w) * TILE, clock: this.random() * 2, rustle: 0 });
      }
    }

    // Fewer fireflies on small screens.
    const share = Math.min(1, open / 150);
    const spot = () => {
      for (let n = 0; n < 100; n++) {
        const i = Math.floor(this.random() * w * h);
        if (walkable[i]) return { x: (i % w) * TILE + this.random() * TILE, y: Math.floor(i / w) * TILE + this.random() * TILE };
      }
      return { x: this.random() * this.width, y: this.random() * this.height };
    };
    for (let n = Math.round((FIREFLIES[timeOfDay] ?? 0) * share); n > 0; n--) {
      const { x, y } = spot();
      this.fireflies.push({ x, y, vx: 0, vy: 0, phase: this.random() * 4 });
    }
  }

  setPointer(p: Point | null) {
    this.pointer = p;
  }

  /** Something passed through here (the cursor, a walker's feet): nearby grass rustles. */
  brush(x: number, y: number) {
    for (const g of this.grass) {
      if (Math.abs(g.x + TILE / 2 - x) < 14 && Math.abs(g.y + TILE - y) < 14) g.rustle = RUSTLE;
    }
  }

  /** A heart rising from a clicked critter. */
  pop(x: number, y: number) {
    this.pops.push({ x, y, age: 0 });
  }

  update(dt: number, still: boolean) {
    this.still = still;
    for (const p of this.pops) p.age += dt;
    this.pops = this.pops.filter((p) => p.age < POP_SECONDS);
    if (still) return;
    this.time += dt;
    const r = this.random;

    for (const g of this.grass) {
      g.clock += dt * (g.rustle > 0 ? RUSTLE_SPEED : 1);
      g.rustle -= dt;
    }

    // At night a firefly or two drifts over to the cursor.
    const p = this.pointer;
    const curious = p
      ? [...this.fireflies]
          .map((f) => ({ f, d: Math.hypot(f.x + 16 - p.x, f.y + 16 - p.y) }))
          .filter(({ d }) => d < 150)
          .sort((a, b) => a.d - b.d)
          .slice(0, 2)
          .map(({ f }) => f)
      : [];

    // Fireflies wander: their drift turns a little at a time.
    for (const f of this.fireflies) {
      if (p && curious.includes(f)) {
        // Steer gently toward a spot just beside the cursor.
        f.vx += Math.sign(p.x - 24 - f.x) * 10 * dt;
        f.vy += Math.sign(p.y - 20 - f.y) * 10 * dt;
      }
      f.vx = Math.max(-8, Math.min(8, f.vx + (r() - 0.5) * 6 * dt));
      f.vy = Math.max(-6, Math.min(6, f.vy + (r() - 0.5) * 6 * dt));
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      // At an edge, turn back in (flipping the drift every frame there would
      // leave it stuck, twitching in place).
      const size = STRIPS.fireflies.size;
      if (f.x < 0) [f.x, f.vx] = [0, Math.abs(f.vx)];
      if (f.x > this.width - size) [f.x, f.vx] = [this.width - size, -Math.abs(f.vx)];
      if (f.y < 0) [f.y, f.vy] = [0, Math.abs(f.vy)];
      if (f.y > this.height - size) [f.y, f.vy] = [this.height - size, -Math.abs(f.vy)];
    }
  }

  private frame(art: LifeArt, phase: number, clock = this.time) {
    if (this.still) return 0;
    const { frames, fps } = STRIPS[art];
    return Math.floor((clock + phase) * fps) % frames;
  }

  private sprite(ctx: CanvasRenderingContext2D, art: LifeArt, frame: number, x: number, y: number) {
    const { size } = STRIPS[art];
    ctx.drawImage(this.images[art], frame * size, 0, size, size, Math.round(x), Math.round(y), size, size);
  }

  ground(): Drawable[] {
    return this.grass.map((g) => ({
      baseY: g.y + TILE,
      // Stands on its cell: bottom on the cell's bottom, centered across it.
      draw: (ctx) => {
        const { size } = STRIPS["tall-grass"];
        this.sprite(ctx, "tall-grass", this.frame("tall-grass", 0, g.clock), g.x + TILE / 2 - size / 2, g.y + TILE - size);
      },
    }));
  }

  air(): Drawable[] {
    const out: Drawable[] = [];
    for (const p of this.pops) {
      const t = p.age / POP_SECONDS;
      out.push({
        baseY: 0,
        draw: (ctx) => {
          ctx.globalAlpha = 1 - t * t;
          const rise = this.still ? 0 : t * 14;
          this.sprite(ctx, "heart", this.still ? 0 : Math.floor(p.age * STRIPS.heart.fps) % STRIPS.heart.frames, p.x - STRIPS.heart.size / 2, p.y - STRIPS.heart.size - rise);
          ctx.globalAlpha = 1;
        },
      });
    }
    return out;
  }

  glow(): Drawable[] {
    return this.fireflies.map((f) => ({ baseY: 0, draw: (ctx) => this.sprite(ctx, "fireflies", this.frame("fireflies", f.phase), f.x, f.y) }));
  }
}
