// Motion tokens for Framer Motion, mirroring the CSS custom properties in
// app/scss/globals.scss (--dur-fast / --dur-base / --dur-scene, --ease-out).

/** Durations in seconds. */
export const DUR = {
  fast: 0.12,
  base: 0.24,
  scene: 0.48,
} as const;

/** The one smooth curve, for scenery and scene changes. */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Stepped easing for UI: moves in `count` discrete jumps, like a GBA sprite. */
export function steps(count: number) {
  return (t: number) => (t >= 1 ? 1 : Math.floor(t * count) / count);
}
