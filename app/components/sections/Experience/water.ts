// The Experience section's backdrop: deep, still water. Faint light comes
// down from the surface in slanted shafts, and seagrass grows up the left and
// right edges with a few bubbles over it, so the middle stays clear for the
// timeline. Still and dark, so the text reads first. The colors are the
// section's own (--water-*), which follow the time of day.

import { band, bayer, hash, mix, rng, setPixel, shade, type RGB } from "../../../lib/pixelArt";

export const WATER_COLORS = ["--water-1", "--water-2", "--water-3", "--water-deep-2"] as const;

// Where the section's bottom edge sits in its background layer, give or take
// the parallax: the seagrass grows from just below it.
const FLOOR = 0.9;

export function paintWater(image: ImageData, colors: Record<string, RGB>) {
  const { width: w, height: h } = image;
  const top = colors["--water-2"]!;
  const bottom = colors["--water-deep-2"]!;
  const light = colors["--water-1"]!;
  const glint = colors["--water-3"]!;
  const random = rng(11);
  const bands = Array.from({ length: 6 }, (_, i) => mix(top, bottom, i / 5));

  // Light shafts from the surface, slanting, thinning out with depth.
  const SLOPE = 0.35;
  // Spread across the width (they slant right as they go down).
  const shaftCount = Math.max(2, Math.round(w / 200));
  const shafts = Array.from({ length: shaftCount }, (_, n) => ({
    x: ((n + 0.2 + random() * 0.6) / shaftCount) * w * 1.1 - w * 0.3,
    width: 14 + random() * 26,
  }));
  const shaftsEnd = h * 0.6;

  for (let y = 0; y < h; y++) {
    const fade = 0.5 * (1 - y / shaftsEnd);
    for (let x = 0; x < w; x++) {
      let c = band(bands, y / h, x, y);
      if (fade > 0 && bayer(x, y) < fade && shafts.some((s) => x >= s.x + y * SLOPE && x < s.x + y * SLOPE + s.width)) {
        c = mix(c, light, 0.45);
      }
      setPixel(image, x, y, c);
    }
  }

  // Glints just under the surface.
  const glints = Math.round((w * h * 0.12) / 700);
  for (let n = 0; n < glints; n++) {
    const y = Math.floor(random() * h * 0.12);
    const x0 = Math.floor(random() * w);
    for (let x = x0; x < Math.min(w, x0 + 2 + Math.floor(random() * 4)); x++) setPixel(image, x, y, mix(band(bands, y / h, x, y), glint, 0.5));
  }

  // Seagrass: clumps of long blades up the edges, darker than the water,
  // each blade swaying a little and thinning to a point.
  const floor = Math.round(h * FLOOR);
  const grass = [shade(bottom, 0.5), shade(bottom, 0.7)] as const;
  const edge = Math.max(10, Math.round(w * 0.09));
  const clumps = Math.max(2, Math.round(w / 180));
  const tips: { x: number; y: number }[] = [];
  for (let side = 0; side < 2; side++) {
    for (let n = 0; n < clumps; n++) {
      const x0 = side === 0 ? 3 + random() * edge : w - 4 - random() * edge;
      const blades = 3 + Math.floor(random() * 3);
      const tallest = h * (0.08 + random() * 0.14);
      for (let b = 0; b < blades; b++) {
        const height = Math.round(tallest * (0.45 + random() * 0.55));
        const phase = random() * Math.PI * 2;
        const lean = (b - (blades - 1) / 2) * (2 + random() * 2); // fanning out
        const color = grass[b % 2]!;
        for (let up = 0; up < height; up++) {
          const rel = up / height;
          const x = Math.round(x0 + b - blades / 2 + lean * rel + 1.8 * Math.sin(up / 9 + phase) * rel);
          const y = floor - up;
          const thick = rel < 0.6 ? 2 : 1;
          for (let dx = 0; dx < thick; dx++) if (x + dx >= 0 && x + dx < w && y >= 0 && y < h) setPixel(image, x + dx, y, color);
        }
      }
      tips.push({ x: Math.round(x0), y: Math.round(floor - tallest) });
    }
  }

  // A few bubbles over some of the clumps: small rings, rising.
  const ring = (cx: number, cy: number, r: number) => {
    const pts = r === 1 ? [[0, -1], [-1, 0], [1, 0], [0, 1]] : [[-1, -2], [0, -2], [1, -2], [-2, -1], [2, -1], [-2, 0], [2, 0], [-2, 1], [2, 1], [-1, 2], [0, 2], [1, 2]];
    for (const [dx, dy] of pts) {
      const x = cx + dx!;
      const y = cy + dy!;
      if (x >= 0 && x < w && y >= 0 && y < h) setPixel(image, x, y, mix(band(bands, y / h, x, y), glint, 0.55));
    }
  };
  for (const tip of tips) {
    if (hash(tip.x, tip.y) < 0.4) continue;
    let y = tip.y - 6;
    for (let n = 0; n < 2 + Math.floor(random() * 3) && y > 4; n++) {
      ring(tip.x + Math.round((random() - 0.5) * 4), y, random() < 0.6 ? 1 : 2);
      y -= 8 + Math.floor(random() * 8);
    }
  }
}
