// The Contact section's backdrop: the end of the walk down the page, where
// the hero's meadow meets the sea. Sky, a few clouds, the sea, a strip of
// beach, then the same grass as the hero. Original art, drawn in code with
// the field's dithering and pixel size; it replaced a borrowed Pokémon
// background.
//
// Each time of day paints its own sky, sea and clouds (with stars at night),
// so the section looks like night rather than a darkened day, like the
// sections above it. The land (beach and grass) takes the hero's time-of-day
// tint instead, so the grass here still matches the field at the top.

import { band, grassPainter, hash, mix, readColor, rng, setPixel, type RGB } from "../../../lib/pixelArt";

const hex = (n: number): RGB => [(n >> 16) & 255, (n >> 8) & 255, n & 255];

type Time = "morning" | "day" | "dusk" | "night";

type Palette = {
  /** Top of the sky down to the horizon. */
  sky: RGB[];
  /** The horizon in to the beach. */
  sea: RGB[];
  /** The horizon line. */
  glare: RGB;
  sparkle: RGB;
  cloud: RGB;
  cloudShade: RGB;
  /** Stars per 1,000 pixels of sky. */
  stars: number;
};

const PALETTES: Record<Time, Palette> = {
  day: {
    sky: [0x5d9fd6, 0x6aa8db, 0x7bb5e2, 0x8fc2e8, 0xa8d2ee, 0xc2e0f1].map(hex),
    sea: [0x86b9e4, 0x6aa3dc, 0x5590d2, 0x4a83c8].map(hex),
    glare: hex(0xe2f2f6),
    sparkle: hex(0xc4e2f5),
    cloud: hex(0xf6f7fb),
    cloudShade: hex(0xd5dbef),
    stars: 0,
  },
  // Lavender overhead, peach at the horizon, and the sea catching it.
  morning: {
    sky: [0x6f86b8, 0x8f96c0, 0xb3a3c1, 0xd6b0b3, 0xf0c2a6, 0xfbd9b0].map(hex),
    sea: [0xc9b3c4, 0x8fa0c8, 0x6a88c0, 0x5778b4].map(hex),
    glare: hex(0xffe2c4),
    sparkle: hex(0xffe9d0),
    cloud: hex(0xfde8e0),
    cloudShade: hex(0xd9b8c4),
    stars: 0,
  },
  // Indigo overhead, orange at the horizon; the first few stars.
  dusk: {
    sky: [0x2e2c63, 0x4a3a78, 0x7a4a80, 0xb05a72, 0xdf7a5e, 0xf4a35e].map(hex),
    sea: [0xd98a6a, 0x8a5e8a, 0x5a4a82, 0x3e3a6e].map(hex),
    glare: hex(0xffc08a),
    sparkle: hex(0xffc89a),
    cloud: hex(0xf2b08e),
    cloudShade: hex(0x9a6a8c),
    stars: 0.6,
  },
  // Navy, a little lighter toward the horizon, dim clouds and stars.
  night: {
    sky: [0x070d24, 0x0b1532, 0x101e40, 0x16294f, 0x1d355e, 0x26446e].map(hex),
    sea: [0x2a4670, 0x1b3358, 0x142847, 0x0f2039].map(hex),
    glare: hex(0x4a6a96),
    sparkle: hex(0x6f8fbf),
    cloud: hex(0x3a4a6e),
    cloudShade: hex(0x26324f),
    stars: 3,
  },
};

// The land, painted for daytime and then tinted like the hero's field.
const FOAM = hex(0xf2f8f4);
const WET_SAND = hex(0xd3bd86);
const SAND = hex(0xeadba9);
const SAND_SPECK = hex(0xd9c690);
const GRASS_EDGE = hex(0x3f7d64);
const STAR = hex(0xdfe8ff);
const STAR_WARM = hex(0xfff3c4);

/** The site's time of day (night when unset, as in the CSS). */
export function timeOfDay(): Time {
  const t = typeof document === "undefined" ? undefined : document.documentElement.dataset.time;
  return t === "morning" || t === "day" || t === "dusk" ? t : "night";
}

/** The shore's clouds for the current time of day (the seam above uses them too). */
export function shoreClouds() {
  const { cloud, cloudShade } = PALETTES[timeOfDay()];
  return { cloud, cloudShade };
}

/** Repaint when the time of day changes (PixelBackdrop watches these). */
export const SHORE_COLORS = ["--scene-tint"] as const;

type Blob = { cx: number; cy: number; rx: number; ry: number };

/** A cloud: a few overlapping puffs, cut flat along the bottom. */
function makeCloud(cx: number, width: number, base: number, random: () => number) {
  const puffs = 3 + Math.floor(random() * 3);
  const step = width / puffs;
  const blobs: Blob[] = [];
  for (let k = 0; k < puffs; k++) {
    // Taller in the middle, like a heap.
    const middle = 1 - Math.abs(k - (puffs - 1) / 2) / (puffs / 2);
    const rx = step * (0.8 + random() * 0.4);
    const ry = rx * (0.7 + random() * 0.25) * (1 + 0.9 * middle);
    blobs.push({ cx: cx - width / 2 + (k + 0.5) * step + (random() - 0.5) * step * 0.4, cy: base - ry * 0.45, rx, ry });
  }
  const inside = (x: number, y: number) =>
    y <= base && blobs.some((b) => ((x - b.cx) / b.rx) ** 2 + ((y - b.cy) / b.ry) ** 2 <= 1);
  const left = Math.floor(Math.min(...blobs.map((b) => b.cx - b.rx)));
  const right = Math.ceil(Math.max(...blobs.map((b) => b.cx + b.rx)));
  const top = Math.floor(Math.min(...blobs.map((b) => b.cy - b.ry)));
  return { inside, left, right, top, base };
}

export function paintShore(image: ImageData) {
  const { width: w, height: h } = image;
  const p = PALETTES[timeOfDay()];
  // The hero field's tint (HeroField.module.scss .tint), laid over the land.
  const tint = readColor("--scene-tint");
  const land = (c: RGB) => mix(c, tint.rgb, tint.alpha);
  const foamC = land(FOAM);
  const wetSand = land(WET_SAND);
  const sand = land(SAND);
  const sandSpeck = land(SAND_SPECK);
  const grassEdge = land(GRASS_EDGE);

  const random = rng(5);
  const horizon = Math.round(h * 0.5);
  const shore = horizon + Math.max(12, Math.round(h * 0.12));
  const beach = Math.max(7, Math.round(h * 0.05));
  const grass = grassPainter(w, h);

  // Per column: where the waves reach, and where the grass starts (tufts
  // poke up a pixel or three into the sand).
  const foamAt = new Int16Array(w);
  const grassTop = new Int16Array(w);
  const spikes = Array.from({ length: w }, () => (random() < 0.3 ? 1 + Math.floor(random() * 3) : 0));
  for (let x = 0; x < w; x++) {
    foamAt[x] = shore + Math.round(1.2 * Math.sin(x / 7 + 1.3) + Math.sin(x / 19));
    const tuft = Math.max(spikes[x] ?? 0, (spikes[x - 1] ?? 0) - 1, (spikes[x + 1] ?? 0) - 1);
    grassTop[x] = shore + beach - tuft;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const foam = foamAt[x]!;
      const top = grassTop[x]!;
      let c: RGB;
      if (y < horizon) c = band(p.sky, y / horizon, x, y);
      else if (y === horizon) c = p.glare;
      // A broken line of surf just out from the beach.
      else if (y === foam - 3 && (Math.floor(x / 4) + Math.floor(x / 11)) % 3 === 0) c = foamC;
      else if (y < foam) c = band(p.sea, (y - horizon) / (shore - horizon), x, y);
      else if (y === foam) c = foamC;
      else if (y === foam + 1) c = wetSand;
      else if (y < top) c = hash(x, y) < 1 / 24 ? sandSpeck : sand; // a darker grain here and there
      else if (y === top) c = grassEdge;
      else c = land(grass(x, y));
      setPixel(image, x, y, c);
    }
  }

  // Stars, from their own random sequence so the rest of the scene stays
  // put: single pixels, a few brighter crosses, thinning toward the horizon.
  if (p.stars > 0) {
    const starRandom = rng(41);
    const count = Math.round((w * horizon * p.stars) / 1000);
    for (let n = 0; n < count; n++) {
      const x = Math.floor(starRandom() * w);
      const y = Math.floor(starRandom() ** 1.5 * horizon * 0.8);
      const color = starRandom() < 0.2 ? STAR_WARM : STAR;
      setPixel(image, x, y, color);
      if (starRandom() < 0.06 && x > 0 && x < w - 1 && y > 0) {
        const dim = mix(color, p.sky[0]!, 0.5);
        setPixel(image, x - 1, y, dim);
        setPixel(image, x + 1, y, dim);
        setPixel(image, x, y - 1, dim);
        setPixel(image, x, y + 1, dim);
      }
    }
  }

  // Light on the water: a few short dashes, most of them toward the horizon.
  const sparkles = Math.round((w * (shore - horizon)) / 450);
  for (let n = 0; n < sparkles; n++) {
    const y = horizon + 2 + Math.floor(random() ** 2.2 * (shore - horizon - 6));
    const x0 = Math.floor(random() * w);
    const length = 2 + Math.floor(random() * 4);
    for (let x = x0; x < Math.min(w, x0 + length); x++) if (y < foamAt[x]! - 3) setPixel(image, x, y, p.sparkle);
  }

  // Clouds low in the sky, spread across it, lit from the top left: the
  // bottom and right edges are shaded.
  const count = Math.max(3, Math.min(8, Math.round(w / 110)));
  for (let n = 0; n < count; n++) {
    const width = 36 + random() * 60;
    const cx = ((n + 0.15 + random() * 0.7) / count) * w;
    const base = Math.round(horizon * (0.62 + random() * 0.26));
    const cloud = makeCloud(cx, width, base, random);
    for (let y = Math.max(0, cloud.top); y <= cloud.base; y++) {
      for (let x = Math.max(0, cloud.left); x <= Math.min(w - 1, cloud.right); x++) {
        if (!cloud.inside(x, y)) continue;
        setPixel(image, x, y, cloud.inside(x + 1, y + 3) ? p.cloud : p.cloudShade);
      }
    }
  }
}
