// The Work section's backdrop: a mown lawn, the hero's grass a good deal
// darker so the project cards stand out. Wide mowing stripes on a
// stair-step slant, soft patches over them, and a scatter of grass marks.
// The colors are the section's own (--grass, --grass-stripe), which follow
// the time of day.

import { bayer, hash, setPixel, shade, valueNoise, type RGB } from "../../../lib/pixelArt";

export const LAWN_COLORS = ["--grass", "--grass-stripe"] as const;

// How dark the lawn sits under the cards (the old CSS lawn used the same).
export const DIM = 0.6;
const STRIPE = 24; // art pixels per mowing stripe

export function paintLawn(image: ImageData, colors: Record<string, RGB>) {
  const { width: w, height: h } = image;
  const base = shade(colors["--grass"]!, DIM);
  const stripe = shade(colors["--grass-stripe"]!, DIM);
  // Each stripe in three tones, for the soft patches.
  const tones = [base, stripe].map((c) => [shade(c, 0.93), c, shade(c, 1.07)] as const);
  const noise = valueNoise(w, h, 64, 23);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // One pixel across for every two down: a stair-step slant.
      const mown = Math.floor((x + Math.floor(y / 2)) / STRIPE) % 2;
      const v = noise(x, y) + (bayer(x, y) - 0.5) * 0.1;
      setPixel(image, x, y, tones[mown]![v < 0.3 ? 0 : v > 0.7 ? 2 : 1]);
    }
  }

  // Grass marks: little dashes and dots in a darker, a mid and a light tone.
  const marks = [shade(stripe, 0.8), shade(base, 1.14), shade(base, 1.3)];
  const count = Math.round((w * h) / 170);
  for (let n = 0; n < count; n++) {
    const x = Math.floor(hash(n, 1) * w);
    const y = Math.floor(hash(n, 2) * h);
    const c = marks[Math.floor(hash(n, 3) * marks.length)]!;
    const kind = hash(n, 4);
    const cells = kind < 0.4 ? [[0, 0]] : kind < 0.65 ? [[0, 0], [1, 0]] : kind < 0.9 ? [[0, 0], [0, 1]] : [[0, 0], [1, 0], [0, 1], [1, 1]];
    for (const [dx, dy] of cells) if (x + dx! < w && y + dy! < h) setPixel(image, x + dx!, y + dy!, c);
  }
}
