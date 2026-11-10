// The field behind the hero, as a grid of 16 px cells: which cells are open
// grass on screen, so the critters, the tall grass and the finds stay out
// from behind the text panel, the photo and the top bar.

export const TILE = 16;

/** In cells; may be fractional. */
export type Rect = { x: number; y: number; w: number; h: number };

export type Field = {
  /** Size in cells. */
  w: number;
  h: number;
  /** 1 where a cell is open grass on screen. */
  walkable: Uint8Array;
};

export { rng } from "../../../../lib/pixelArt";

/**
 * @param w, h    field size in cells, rounded up, so the last row and column
 *                can hang past the screen's edge
 * @param seen    how much of the field is on screen, in cells (fractional)
 * @param avoid   the hero's text panel and photo, in cells
 * @param topRows rows under the top bar
 */
export function buildField(w: number, h: number, seen: { w: number; h: number }, avoid: Rect[], topRows: number): Field {
  const walkable = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // A cell counts as covered when its middle is.
      const cx = x + 0.5;
      const cy = y + 0.5;
      const covered =
        y < topRows ||
        x + 1 > seen.w ||
        y + 1 > seen.h ||
        avoid.some((r) => cx > r.x && cx < r.x + r.w && cy > r.y && cy < r.y + r.h);
      if (!covered) walkable[y * w + x] = 1;
    }
  }
  return { w, h, walkable };
}
