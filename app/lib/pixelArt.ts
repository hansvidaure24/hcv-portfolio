// Helpers for the pixel-art backdrops drawn in code (the hero's field and the
// Contact section's shore), so they share one look: the same grass, the same
// dithering and the same pixel size.

export type RGB = readonly [number, number, number];

/** Small seeded random generator, so a backdrop looks the same on every visit. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 4×4 ordered dither, so edges and blends break up into pixels the way
// hand-drawn pixel art does, instead of smooth gradients.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** The dither threshold at (x, y), from 0 to 15/16. */
export const bayer = (x: number, y: number) => (BAYER[(y % 4) * 4 + (x % 4)] ?? 0) / 16;

/**
 * Soft value noise: random values `scale` pixels apart, eased between, so it
 * makes big gentle blobs. Returns a lookup from (x, y) to 0..1.
 */
export function valueNoise(w: number, h: number, scale: number, seed: number) {
  const random = rng(seed);
  const gw = Math.ceil(w / scale) + 2;
  const gh = Math.ceil(h / scale) + 2;
  const grid = Array.from({ length: gw * gh }, () => random());
  const at = (x: number, y: number) => grid[y * gw + x] ?? 0.5;
  const ease = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const gx = x / scale;
    const gy = y / scale;
    const x0 = Math.floor(gx);
    const y0 = Math.floor(gy);
    const tx = ease(gx - x0);
    const ty = ease(gy - y0);
    const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx;
    const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx;
    return top + (bottom - top) * ty;
  };
}

// The site's daytime grass with soft patches over it, one shade either way,
// so it has some lay of the land instead of reading as a flat fill. Morning,
// dusk and night come from each scene's tint layer.
export const GRASS = {
  dark: [0x54, 0x9e, 0x7f],
  base: [0x5a, 0xa5, 0x85],
  light: [0x61, 0xac, 0x8b],
} as const satisfies Record<string, RGB>;
/** Art pixels between the grass noise's points: big, gentle patches. */
export const GRASS_PATCH_SCALE = 64;

/** A lookup for the grass's color at (x, y), for a w × h area. */
export function grassPainter(w: number, h: number, seed = 17) {
  const noise = valueNoise(w, h, GRASS_PATCH_SCALE, seed);
  return (x: number, y: number): RGB => {
    const v = noise(x, y) + (bayer(x, y) - 0.5) * 0.1;
    return v < 0.3 ? GRASS.dark : v > 0.7 ? GRASS.light : GRASS.base;
  };
}

/** a → b, t of the way. */
export const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

/** Lighter (f > 1) or darker (f < 1). */
export const shade = (c: RGB, f: number): RGB => [
  Math.min(255, Math.round(c[0] * f)),
  Math.min(255, Math.round(c[1] * f)),
  Math.min(255, Math.round(c[2] * f)),
];

/**
 * Solid bands down an area (t from 0 at its top to 1 at its bottom), the last
 * quarter of each blending into the next pixel by pixel: a pixel-art gradient.
 */
export function band(colors: readonly RGB[], t: number, x: number, y: number) {
  const f = Math.min(0.999, Math.max(0, t)) * colors.length;
  const i = Math.floor(f);
  const into = f - i;
  const next = into > 0.75 && (into - 0.75) / 0.25 > bayer(x, y) ? 1 : 0;
  return colors[Math.min(colors.length - 1, i + next)]!;
}

/** A fixed, patternless 0..1 value per pixel, for scattering specks. */
export function hash(x: number, y: number) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** A CSS color as a custom property computes to: #rgb, #rrggbb or rgb(). */
export function parseColor(value: string): RGB | null {
  const v = value.trim();
  const short = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i.exec(v);
  if (short) return [parseInt(short[1]! + short[1]!, 16), parseInt(short[2]! + short[2]!, 16), parseInt(short[3]! + short[3]!, 16)];
  const long = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(v);
  if (long) return [parseInt(long[1]!, 16), parseInt(long[2]!, 16), parseInt(long[3]!, 16)];
  const rgb = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(v);
  if (rgb) return [Math.round(+rgb[1]!), Math.round(+rgb[2]!), Math.round(+rgb[3]!)];
  return null;
}

/**
 * A color custom property with its alpha (for the translucent time-of-day
 * tints), read from the page. "transparent" or unset is alpha 0.
 */
export function readColor(name: string): { rgb: RGB; alpha: number } {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+)(%?))?/i.exec(value);
  if (m) {
    const alpha = m[4] === undefined ? 1 : m[5] ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { rgb: [Math.round(+m[1]!), Math.round(+m[2]!), Math.round(+m[3]!)], alpha };
  }
  const rgb = parseColor(value);
  return rgb ? { rgb, alpha: 1 } : { rgb: [0, 0, 0], alpha: 0 };
}

/** CSS `saturate(s) brightness(b)`, as the field and shore canvases apply it. */
export function cssFilter([r, g, b]: RGB, s: number, bright: number): RGB {
  const out = [
    (0.213 + 0.787 * s) * r + (0.715 - 0.715 * s) * g + (0.072 - 0.072 * s) * b,
    (0.213 - 0.213 * s) * r + (0.715 + 0.285 * s) * g + (0.072 - 0.072 * s) * b,
    (0.213 - 0.213 * s) * r + (0.715 - 0.715 * s) * g + (0.072 + 0.928 * s) * b,
  ].map((v) => Math.max(0, Math.min(255, Math.round(v * bright))));
  return [out[0]!, out[1]!, out[2]!];
}

/** A translucent color multiplied over c (CSS `mix-blend-mode: multiply`). */
export const multiply = (c: RGB, over: { rgb: RGB; alpha: number }): RGB =>
  mix(c, [(c[0] * over.rgb[0]) / 255, (c[1] * over.rgb[1]) / 255, (c[2] * over.rgb[2]) / 255], over.alpha);

/** Write one opaque pixel into an ImageData. */
export function setPixel(image: ImageData, x: number, y: number, [r, g, b]: RGB) {
  const i = (y * image.width + x) * 4;
  image.data[i] = r;
  image.data[i + 1] = g;
  image.data[i + 2] = b;
  image.data[i + 3] = 255;
}

/**
 * Size a canvas to whole device pixels of a CSS box, with its CSS size set to
 * match exactly, so the browser never stretches it by a fraction (which
 * doubles a column of pixels here and there). Each art pixel becomes a whole
 * number of device pixels, close to `cssPerPixel` CSS pixels.
 *
 * Returns the device pixels per art pixel, and the art size that covers it.
 */
export function fitPixelCanvas(canvas: HTMLCanvasElement, width: number, height: number, cssPerPixel = 2) {
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.max(1, Math.round(cssPerPixel * dpr));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${canvas.width / dpr}px`;
  canvas.style.height = `${canvas.height / dpr}px`;
  return { dpr, scale, w: Math.ceil(canvas.width / scale), h: Math.ceil(canvas.height / scale) };
}

/**
 * Calls `onChange` when the window resizes or its pixel density changes.
 * Browser zoom does both, and a ResizeObserver alone can miss it. Returns a
 * function that stops watching.
 */
export function watchViewport(onChange: () => void) {
  let density: MediaQueryList | null = null;
  function onDensity() {
    watchDensity();
    onChange();
  }
  // A media query only matches one density, so after a change, watch the new one.
  function watchDensity() {
    density?.removeEventListener("change", onDensity);
    density = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    density.addEventListener("change", onDensity);
  }
  window.addEventListener("resize", onChange);
  watchDensity();
  return () => {
    window.removeEventListener("resize", onChange);
    density?.removeEventListener("change", onDensity);
  };
}

/**
 * The same, for a still picture: the canvas holds the art at its real pixel
 * size and CSS scales it up (pixelated), each art pixel still a whole number
 * of device pixels. Far less memory than a full-size canvas, which matters
 * for a backdrop several screens tall. It may overhang the box by a pixel.
 */
export function fitArtCanvas(canvas: HTMLCanvasElement, width: number, height: number, cssPerPixel = 2) {
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.max(1, Math.round(cssPerPixel * dpr));
  const w = Math.ceil((width * dpr) / scale);
  const h = Math.ceil((height * dpr) / scale);
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = `${(w * scale) / dpr}px`;
  canvas.style.height = `${(h * scale) / dpr}px`;
  return { w, h };
}
