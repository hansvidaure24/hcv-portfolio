// Critters in the hero's field, from SpritePilot's Creatures Pack (CC0,
// public domain: assets-src/spritepilot/creatures-pack/LICENSE.txt). Who's out follows the
// site's time of day, like the rest of the scenery: bees, birds, a beetle and
// a slime by day; bats at dusk; bats, ghosts and a spider at night.
//
// Flyers drift between spots that are on screen (so they sometimes pass
// behind the text panel, like fish under a pond's surface); walkers potter
// along the ground; the spider drops on its thread from the top of the screen.
// Side-on art faces right and is flipped to go left.

import { CLICK_LINES, type Actor, type Cast, type Point, type SpriteView } from "./cast";
import { rng, TILE, type Field } from "./fieldMap";

export type Species = "bee" | "bird" | "beetle" | "slime" | "bat" | "ghost" | "spider";

type Spec = {
  /** Which of the pack's drawings: 16 px for small critters, 32 px for big ones. */
  size: 16 | 32;
  frames: number;
  fps: number;
  /** Side-on art faces right and is flipped to go left; front-on art isn't. */
  sideOn: boolean;
  move: "fly" | "walk" | "hang";
  /** Map pixels per second. */
  speed: number;
  /** Seconds it rests between moves (the spider: how long it hangs). */
  rest: [number, number];
  /** How far one move goes, in map pixels (the spider: how far it drops). */
  range: number;
  sounds: string[];
};

export const SPECIES: Record<Species, Spec> = {
  bee: { size: 16, frames: 8, fps: 16, sideOn: true, move: "fly", speed: 18, rest: [0.8, 2.5], range: 90, sounds: ["Bzz!", "Bzzz…"] },
  bird: { size: 32, frames: 8, fps: 12, sideOn: true, move: "fly", speed: 46, rest: [0.3, 1.2], range: 240, sounds: ["Tweet!", "Chirp!"] },
  beetle: { size: 16, frames: 8, fps: 12, sideOn: true, move: "walk", speed: 8, rest: [1.5, 4], range: 50, sounds: ["Click!", "Click-click!"] },
  slime: { size: 32, frames: 10, fps: 10, sideOn: false, move: "walk", speed: 6, rest: [1, 3], range: 40, sounds: ["Blorp!", "Bloop!"] },
  bat: { size: 32, frames: 8, fps: 14, sideOn: false, move: "fly", speed: 34, rest: [0.2, 0.8], range: 140, sounds: ["Eep!", "Squeak!"] },
  ghost: { size: 32, frames: 12, fps: 10, sideOn: true, move: "fly", speed: 9, rest: [2, 5], range: 80, sounds: ["Boo!", "Oooo…"] },
  spider: { size: 32, frames: 12, fps: 10, sideOn: false, move: "hang", speed: 14, rest: [5, 9], range: 70, sounds: ["Hi there!", "Just hanging!"] },
};
export const ALL_SPECIES = Object.keys(SPECIES) as Species[];
export const sheetUrl = (s: Species) => `/graphics/spritepilot/${s}-${SPECIES[s].size}px_strip${SPECIES[s].frames}.png`;

// Who's out, by the site's time of day (html[data-time]), in the order
// they're added as the screen gets bigger.
const BY_TIME: Record<string, Species[]> = {
  morning: ["bird", "bee", "beetle", "bird", "slime", "bee", "bird"],
  day: ["bee", "bird", "beetle", "bee", "slime", "bird", "bee"],
  dusk: ["bat", "bird", "beetle", "slime", "bat", "bird", "bat"],
  night: ["bat", "ghost", "spider", "slime", "bat", "ghost", "bat"],
};
// At most this many at once: a handful moving is calm, more is busy.
const MOST = 5;

// How high flyers are, in art pixels: how far below them their shadow falls.
const ALTITUDE: Partial<Record<Species, number>> = { bee: 9, bird: 16, bat: 16, ghost: 12 };
const SHADOW = "rgba(15, 45, 30, 0.22)";
// Seconds between a critter's looks at the cursor, so it doesn't twitch.
const REACT_EVERY = 0.4;

type Critter = Actor & {
  species: Species;
  /** Centre, in map pixels. */
  x: number;
  y: number;
  tx: number;
  ty: number;
  wait: number;
  left: boolean;
  moving: boolean;
  /** Animation clock, in seconds. */
  clock: number;
  /** Seconds until it comes back, while it's off screen (a bird that flew off, a spider that climbed up). */
  away: number;
  /** The spider: how far down it hangs, and what it's doing. */
  depth: number;
  phase: "down" | "stay" | "up";
  /** Seconds until it looks at the cursor again. */
  react: number;
  /** Seconds left moving at double speed (fleeing). */
  hurry: number;
};

const between = (r: () => number, [a, b]: [number, number]) => a + r() * (b - a);

export class Critters implements Cast {
  actors: Critter[] = [];
  private random: () => number;
  private time = 0;
  private nextChatter = 5;
  private pointer: Point | null = null;

  constructor(
    private field: Field,
    private images: Record<Species, HTMLImageElement>,
    timeOfDay: string,
    private topRows: number,
    seed = 5,
  ) {
    this.random = rng(seed);
    let open = 0;
    for (const v of field.walkable) open += v;
    const count = open < 8 ? 0 : Math.max(2, Math.min(MOST, Math.round(open / 28)));
    const lineup = BY_TIME[timeOfDay] ?? BY_TIME.day!;
    for (let i = 0; i < count; i++) {
      const species = lineup[i % lineup.length]!;
      const spot = this.anySpot();
      if (!spot) break;
      const spec = SPECIES[species];
      const c: Critter = {
        species,
        x: spot.x,
        y: spot.y,
        tx: spot.x,
        ty: spot.y,
        wait: between(this.random, spec.rest),
        left: this.random() < 0.5,
        moving: false,
        clock: this.random() * 10,
        away: 0,
        depth: 0,
        phase: "down",
        react: 0,
        hurry: 0,
        hovered: false,
        bubble: null,
        line: `${spec.sounds[0]} ${CLICK_LINES[i % CLICK_LINES.length]}`,
        // Made from the CC0 Sound Effects pack by assets-src/spritepilot/build_sounds.py.
        sound: `/sounds/critters/${species}.mp3`,
      };
      if (spec.move === "hang") this.dropSpider(c, true);
      this.actors.push(c);
    }
  }

  private open(x: number, y: number) {
    const cx = Math.floor(x / TILE);
    const cy = Math.floor(y / TILE);
    if (cx < 0 || cy < 0 || cx >= this.field.w || cy >= this.field.h) return false;
    return this.field.walkable[cy * this.field.w + cx] === 1;
  }

  private anySpot() {
    const { w, h, walkable } = this.field;
    for (let n = 0; n < 200; n++) {
      const i = Math.floor(this.random() * w * h);
      if (walkable[i]) return { x: (i % w) * TILE + TILE / 2, y: Math.floor(i / w) * TILE + TILE / 2 };
    }
    return null;
  }

  private nextTarget(c: Critter) {
    const spec = SPECIES[c.species];
    // Now and then a bird flies off the side of the screen and comes back later.
    if (c.species === "bird" && this.random() < 0.15) {
      const size = SPECIES.bird.size;
      c.tx = this.random() < 0.5 ? -size : this.field.w * TILE + size;
      c.ty = c.y + (this.random() - 0.5) * 40;
      return;
    }
    const flat = spec.move === "walk" ? 0.4 : 0.7;
    for (let n = 0; n < 30; n++) {
      const x = c.x + (this.random() * 2 - 1) * spec.range;
      const y = c.y + (this.random() * 2 - 1) * spec.range * flat;
      if (this.open(x, y)) {
        c.tx = x;
        c.ty = y;
        return;
      }
    }
    const spot = this.anySpot();
    if (spot) {
      c.tx = spot.x;
      c.ty = spot.y;
    }
  }

  /** Hang the spider from a column that's open just under the top bar. It
   *  drops in from above the screen: over the hero the bar is see-through. */
  private dropSpider(c: Critter, startDown: boolean) {
    const { w, walkable } = this.field;
    const columns: { x: number; rows: number }[] = [];
    for (let cx = 0; cx < w; cx++) {
      let rows = 0;
      while (this.topRows + rows < this.field.h && walkable[(this.topRows + rows) * w + cx]) rows++;
      if (rows >= 2) columns.push({ x: cx, rows });
    }
    const col = columns[Math.floor(this.random() * columns.length)];
    if (!col) {
      c.away = 1e9;
      return;
    }
    const top = this.topRows * TILE;
    c.x = col.x * TILE + TILE / 2;
    const size = SPECIES.spider.size;
    c.depth = Math.min(col.rows * TILE - size, size / 2 + this.random() * SPECIES.spider.range);
    c.phase = startDown ? "stay" : "down";
    c.y = startDown ? top + c.depth : -size;
    c.wait = between(this.random, SPECIES.spider.rest);
  }

  update(dt: number, still: boolean) {
    this.time += dt;
    const { random } = this;
    for (const c of this.actors) {
      if (c.bubble && c.bubble.until <= this.time && !c.hovered) c.bubble = null;
      if (still) {
        c.moving = false;
        continue;
      }
      const spec = SPECIES[c.species];
      // The beetle only walks its legs when it's moving; the rest always animate.
      if (c.species !== "beetle" || c.moving) c.clock += dt;

      if (c.away > 0) {
        c.away -= dt;
        if (c.away <= 0) this.comeBack(c);
        continue;
      }
      if (c.hovered) {
        c.moving = false;
        continue;
      }

      c.react -= dt;
      c.hurry -= dt;
      if (this.pointer && c.react <= 0 && this.notice(c, this.pointer)) c.react = REACT_EVERY;
      const speed = spec.speed * (c.hurry > 0 ? 2 : 1);

      if (spec.move === "hang") {
        const top = this.topRows * TILE;
        c.moving = c.phase !== "stay";
        if (c.phase === "down") {
          c.y += speed * dt;
          if (c.y >= top + c.depth) c.phase = "stay";
        } else if (c.phase === "stay") {
          c.wait -= dt;
          if (c.wait <= 0) c.phase = "up";
        } else {
          c.y -= speed * dt;
          if (c.y <= -spec.size) c.away = 6 + random() * 8;
        }
        continue;
      }

      if (c.wait > 0) {
        c.wait -= dt;
        c.moving = false;
        if (c.wait <= 0) this.nextTarget(c);
        continue;
      }
      const dx = c.tx - c.x;
      const dy = c.ty - c.y;
      const d = Math.hypot(dx, dy);
      if (d < 1) {
        c.moving = false;
        const offscreen = c.x < 0 || c.x > this.field.w * TILE;
        if (offscreen) c.away = 3 + random() * 5;
        else c.wait = between(random, spec.rest);
        continue;
      }
      const step = Math.min(d, speed * dt);
      c.x += (dx / d) * step;
      c.y += (dy / d) * step;
      c.moving = true;
      if (spec.sideOn && Math.abs(dx) > 0.5) c.left = dx < 0;
    }

    // Now and then someone pipes up.
    if (this.time >= this.nextChatter) {
      this.nextChatter = this.time + 7 + random() * 7;
      const here = this.actors.filter((c) => c.away <= 0 && !c.bubble && this.open(c.x, c.y));
      const c = here[Math.floor(random() * here.length)];
      if (c) c.bubble = { text: this.sound(c), until: this.time + 1.4 };
    }
  }

  setPointer(p: Point | null) {
    this.pointer = p;
  }

  /** React to the cursor nearby; true if it did. */
  private notice(c: Critter, p: Point) {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const d = Math.hypot(dx, dy) || 1;
    switch (c.species) {
      case "bird":
      case "bat":
        // Too close: flutter off, away from it.
        if (d > 70) return false;
        c.tx = c.x - (dx / d) * 120;
        c.ty = c.y - (dy / d) * 70;
        c.wait = 0;
        c.hurry = 1.2;
        return true;
      case "bee": {
        // Curious: drift over and hover around it.
        if (d > 130 || d < 14) return false;
        const a = this.random() * Math.PI * 2;
        const r = 14 + this.random() * 12;
        c.tx = p.x + Math.cos(a) * r;
        c.ty = p.y + Math.sin(a) * r * 0.6;
        c.wait = 0;
        return true;
      }
      case "ghost":
        // Floats over, slowly, and keeps a little distance.
        if (d > 160 || d < 26) return false;
        c.tx = p.x + (c.x < p.x ? -22 : 22);
        c.ty = p.y - 6;
        c.wait = 0;
        return true;
      case "slime":
        // Edges closer.
        if (d > 90 || d < 22) return false;
        c.tx = c.x + dx * 0.5;
        c.ty = c.y + dy * 0.3;
        c.wait = 0;
        return true;
      case "beetle":
        // Stops and turns to face it.
        if (d > 60) return false;
        c.left = dx < 0;
        c.tx = c.x;
        c.ty = c.y;
        c.wait = Math.max(c.wait, 1);
        return true;
      case "spider":
        // Something's coming: back up the thread.
        if (Math.abs(dx) > 40 || dy < -10 || dy > 70 || c.phase === "up") return false;
        c.phase = "up";
        c.hurry = 1.5;
        return true;
    }
  }

  feet(): Point[] {
    return this.actors
      .filter((c) => c.away <= 0 && SPECIES[c.species].move === "walk")
      .map((c) => ({ x: c.x, y: c.y + SPECIES[c.species].size / 2 }));
  }

  /** A small pixel ellipse on the ground under each flyer, for depth. */
  shadows() {
    return this.actors
      .filter((c) => c.away <= 0 && ALTITUDE[c.species] !== undefined)
      .map((c) => {
        const { size } = SPECIES[c.species];
        const w = size === 32 ? 12 : 6;
        const x = Math.round(c.x - w / 2);
        const y = Math.round(c.y + size / 2 + (ALTITUDE[c.species] ?? 0));
        return {
          baseY: y + 2,
          draw: (ctx: CanvasRenderingContext2D) => {
            ctx.fillStyle = SHADOW;
            ctx.fillRect(x + 1, y, w - 2, 1);
            ctx.fillRect(x, y + 1, w, 1);
            ctx.fillRect(x + 1, y + 2, w - 2, 1);
          },
        };
      });
  }

  private comeBack(c: Critter) {
    if (c.species === "spider") {
      this.dropSpider(c, false);
      return;
    }
    // A bird comes back in from the other side.
    const fromLeft = c.x > 0;
    const spot = this.anySpot();
    const size = SPECIES[c.species].size;
    c.x = fromLeft ? -size : this.field.w * TILE + size;
    c.y = spot?.y ?? c.y;
    c.tx = spot?.x ?? this.field.w * TILE * 0.5;
    c.ty = spot?.y ?? c.y;
    c.wait = 0;
  }

  private sound(c: Critter) {
    const s = SPECIES[c.species].sounds;
    return s[Math.floor(this.random() * s.length)]!;
  }

  poke(actor: Actor) {
    const c = actor as Critter;
    c.wait = Math.max(c.wait, 1.5);
    if (!c.bubble) c.bubble = { text: this.sound(c), until: this.time + 1.6 };
  }

  views(): SpriteView[] {
    const out: SpriteView[] = [];
    this.actors.forEach((c, index) => {
      if (c.away > 0) return;
      const spec = SPECIES[c.species];
      const img = this.images[c.species];
      const frame = Math.floor(c.clock * spec.fps) % spec.frames;
      const size = spec.size;
      const dx = Math.round(c.x - size / 2);
      const dy = Math.round(c.y - size / 2);
      const flip = spec.sideOn && c.left;
      out.push({
        index,
        actor: c,
        // Flyers pass over whatever's on the ground.
        baseY: spec.move === "fly" ? 1e6 + dy : dy + size,
        hit: { x: dx - 2, y: dy - 2, w: size + 4, h: size + 4 },
        head: { x: c.x, y: dy + 1 },
        draw: (ctx) => {
          if (spec.move === "hang") {
            ctx.fillStyle = "rgba(235, 245, 240, 0.6)";
            ctx.fillRect(Math.round(c.x), 0, 1, dy + 3);
          } else if (spec.move === "walk") {
            ctx.fillStyle = "rgba(20, 40, 20, 0.25)";
            ctx.fillRect(dx + size / 4, dy + size - 1, size / 2, 1);
          }
          if (flip) {
            ctx.save();
            ctx.translate(dx + size, dy);
            ctx.scale(-1, 1);
            ctx.drawImage(img, frame * size, 0, size, size, 0, 0, size, size);
            ctx.restore();
          } else {
            ctx.drawImage(img, frame * size, 0, size, size, dx, dy, size, size);
          }
        },
      });
    });
    return out;
  }
}
