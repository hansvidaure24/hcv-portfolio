// The seams between sections: thin pixel-art strips pinned to the top edge
// of a section, over the line where its backdrop meets the one above. The
// backdrops slide at their own speeds (parallax), so that line is a straight
// cut between two scenes; a strip hides it and joins them: the meadow's edge
// over the pond, the pond's bank up onto the lawn, and a bank of cloud
// between the lawn and the sky. Each matches the colors on both sides,
// including the time-of-day tint where a scene has one.

import { cssFilter, GRASS, mix, readColor, rng, setPixel, shade, type RGB } from "../../lib/pixelArt";
import { DIM as LAWN_DIM } from "../sections/Projects/lawn";
import { shoreClouds } from "../sections/Contact/shore";

const WHITE: RGB = [255, 255, 255];

function put(image: ImageData, x: number, y: number, c: RGB) {
  if (x >= 0 && y >= 0 && x < image.width && y < image.height) setPixel(image, x, y, c);
}

/** Short tufts along an edge: 0 to 3 pixels, in little peaks. */
function tufts(w: number, seed: number) {
  const random = rng(seed);
  const spikes = Array.from({ length: w }, () => (random() < 0.32 ? 1 + Math.floor(random() * 3) : 0));
  return spikes.map((s, x) => Math.max(s, (spikes[x - 1] ?? 0) - 1, (spikes[x + 1] ?? 0) - 1));
}

/** A gentle wave along an edge, a pixel or two either way. */
const wave = (x: number, phase: number) => Math.round(1.2 * Math.sin(x / 7 + phase) + 0.8 * Math.sin(x / 17 + phase * 2));

/** A broken line, for ripples and surf. */
const dashed = (x: number) => (Math.floor(x / 5) + Math.floor(x / 13)) % 3 === 0;

/**
 * Hero → Experience: the meadow's grass hangs over the top of the water,
 * with foam where they meet. The grass is the hero's at its bottom edge:
 * the field's filter, its darker edges and its time-of-day tint.
 */
export const FIELD_WATER_COLORS = ["--water-2", "--water-3", "--scene-tint"] as const;
export function paintFieldToWater(image: ImageData, colors: Record<string, RGB>) {
  const { width: w, height: h } = image;
  const tint = readColor("--scene-tint");
  const water = colors["--water-2"]!;
  const foam = mix(colors["--water-3"]!, WHITE, 0.45);
  const base = cssFilter(GRASS.base, 0.82, 0.95);
  const hang = tufts(w, 3);
  const bank = Math.max(4, Math.round(h * 0.35));
  for (let x = 0; x < w; x++) {
    // The hero's vignette (HeroField.module.scss .shade) at its bottom edge.
    const d = Math.hypot((x / w - 0.5) / 0.85, (1 - 0.42) / 0.75);
    const dark = Math.min(1, Math.max(0, (d - 0.4) / 0.6)) * 0.32;
    const grass = mix(mix(base, [8, 40, 28], dark), tint.rgb, tint.alpha);
    const edge = bank + wave(x, 0.7) + hang[x]!;
    for (let y = 0; y < edge; y++) put(image, x, y, y === edge - 1 ? shade(grass, 0.8) : grass);
    put(image, x, edge, foam);
    if (dashed(x)) put(image, x, edge + 2, mix(water, foam, 0.6));
  }
}

/**
 * Experience → Work: the deep water at the bottom of Experience laps at a
 * bank, and the lawn's grass pokes up into the foam.
 */
export const WATER_LAWN_COLORS = ["--water-deep-2", "--water-3", "--grass"] as const;
export function paintWaterToLawn(image: ImageData, colors: Record<string, RGB>) {
  const { width: w, height: h } = image;
  const water = colors["--water-deep-2"]!;
  const foam = mix(colors["--water-3"]!, WHITE, 0.4);
  const lawn = shade(colors["--grass"]!, LAWN_DIM);
  const lawnEdge = shade(lawn, 0.75);
  const up = tufts(w, 8);
  const shore = Math.max(5, Math.round(h * 0.45));
  for (let x = 0; x < w; x++) {
    const s = shore + wave(x, 2.1);
    for (let y = 0; y < s; y++) put(image, x, y, water);
    if (dashed(x)) put(image, x, s - 3, mix(water, foam, 0.5));
    put(image, x, s, foam);
    put(image, x, s + 1, lawnEdge);
    // Tufts poke up through the foam, dark at the tip.
    for (let k = 1; k <= up[x]!; k++) put(image, x, s + 1 - k, k === up[x] ? lawnEdge : lawn);
  }
}

/**
 * Work → Contact: the lawn's edge, then a bank of cloud, so you rise from the
 * lawn into the sky over the sea. The clouds are the shore's for the time of
 * day (shore.ts), through the same filter.
 */
export const LAWN_SKY_COLORS = ["--grass", "--scene-tint"] as const;
export function paintLawnToSky(image: ImageData, colors: Record<string, RGB>) {
  const { width: w, height: h } = image;
  const lawn = shade(colors["--grass"]!, LAWN_DIM);
  const lawnEdge = shade(lawn, 0.75);
  const clouds = shoreClouds();
  const cloud = cssFilter(clouds.cloud, 0.82, 0.95);
  const cloudShade = cssFilter(clouds.cloudShade, 0.82, 0.95);

  const hang = tufts(w, 5);
  const lawnRows = Math.max(3, Math.round(h * 0.22));
  for (let x = 0; x < w; x++) {
    const edge = lawnRows + hang[x]!;
    for (let y = 0; y < edge; y++) put(image, x, y, y === edge - 1 ? lawnEdge : lawn);
  }

  // Overlapping puffs, a little flattened, kept clear of the strip's bottom
  // so the bank ends in bumps over the sky rather than a straight line.
  const random = rng(19);
  const puffs: { cx: number; cy: number; r: number }[] = [];
  for (let x0 = -8; x0 < w + 8; x0 += 6 + random() * 9) {
    puffs.push({ cx: x0, cy: h * (0.5 + (random() - 0.5) * 0.1), r: h * (0.24 + random() * 0.2) });
  }
  const inside = (x: number, y: number) => puffs.some((p) => (x - p.cx) ** 2 + ((y - p.cy) * 1.15) ** 2 <= p.r ** 2);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Lit from above: the underside of each puff is shaded.
      if (inside(x, y)) put(image, x, y, inside(x + 1, y + 2) ? cloud : cloudShade);
    }
  }
}
