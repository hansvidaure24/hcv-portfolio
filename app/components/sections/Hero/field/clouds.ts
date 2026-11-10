// Cloud shadows drifting across the field, drawn as pixel art: a solid core
// and a dithered edge, so they belong with the sprites instead of sitting on
// top as smooth gradients. Each is a few overlapping ellipses.

import { rng } from "./fieldMap";

const SHADE = [10, 45, 30, Math.round(0.13 * 255)] as const;
// Where an ellipse's falloff counts as core rather than edge.
const CORE = 0.25;

type Cloud = { x: number; y: number; speed: number; mask: HTMLCanvasElement };

function shape(w: number, h: number, random: () => number) {
  const blobs = Array.from({ length: 4 }, () => ({
    cx: w * (0.2 + random() * 0.6),
    cy: h * (0.35 + random() * 0.3),
    rx: w * (0.18 + random() * 0.14),
    ry: h * (0.28 + random() * 0.16),
  }));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const g = canvas.getContext("2d")!;
  const image = g.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let d = -1;
      for (const b of blobs) d = Math.max(d, 1 - ((x - b.cx) / b.rx) ** 2 - ((y - b.cy) / b.ry) ** 2);
      // Inside the core, every pixel; on the edge, every other one.
      if (d > CORE || (d > 0 && (x + y) % 2 === 0)) {
        const i = (y * w + x) * 4;
        image.data[i] = SHADE[0];
        image.data[i + 1] = SHADE[1];
        image.data[i + 2] = SHADE[2];
        image.data[i + 3] = SHADE[3];
      }
    }
  }
  g.putImageData(image, 0, 0);
  return canvas;
}

export class CloudShadows {
  private clouds: Cloud[] = [];
  private random: () => number;

  /** width, height: the field in art pixels. */
  constructor(
    private width: number,
    private height: number,
    seed = 21,
  ) {
    this.random = rng(seed);
    const r = this.random;
    for (let i = 0; i < 3; i++) {
      const w = Math.round(Math.max(140, width * (0.28 + r() * 0.12)));
      const h = Math.round(w * 0.5);
      this.clouds.push({
        x: r() * (width + w) - w,
        y: (0.05 + i * 0.32 + r() * 0.08) * height - h / 2,
        speed: 6 + r() * 3, // art pixels a second: two to three minutes across
        mask: shape(w, h, r),
      });
    }
  }

  update(dt: number) {
    for (const c of this.clouds) {
      c.x += c.speed * dt;
      if (c.x > this.width) c.x = -c.mask.width - this.random() * 80;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const c of this.clouds) ctx.drawImage(c.mask, Math.round(c.x), Math.round(c.y));
  }
}
