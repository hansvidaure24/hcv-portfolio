// What the hero's canvas needs from whoever lives in the field: where to
// draw each one, where it can be hovered, where its speech bubble goes, and
// what it says.

export type Actor = {
  hovered: boolean;
  bubble: { text: string; until: number } | null;
  /** What it says in the dialogue box when clicked. */
  line: string;
  /** What it sounds like when clicked (only with sound on). */
  sound?: string;
};

export type SpriteView = {
  /** Index into Cast.actors, for its speech bubble. */
  index: number;
  actor: Actor;
  /** Bottom edge in map pixels, for drawing whoever is lower in front. */
  baseY: number;
  /** Hover and click area, in map pixels. */
  hit: { x: number; y: number; w: number; h: number };
  /** Where the speech bubble's tail points, in map pixels. */
  head: { x: number; y: number };
  draw: (ctx: CanvasRenderingContext2D) => void;
};

export type Point = { x: number; y: number };

export interface Cast {
  actors: Actor[];
  update(dt: number, still: boolean): void;
  /** Hovered or tapped: react, and say something in a bubble. */
  poke(actor: Actor): void;
  views(): SpriteView[];
  /** Ground shadows under anything flying, sorted in with the ground. */
  shadows?(): { baseY: number; draw: (ctx: CanvasRenderingContext2D) => void }[];
  /** Where the visitor's pointer is over the field, in map pixels (null: not over it). */
  setPointer?(p: Point | null): void;
  /** Where walkers' feet are, so the grass they walk through can rustle. */
  feet?(): Point[];
}

// What a critter says in the dialogue box when clicked, after its sound
// ("Bzz! ..."). They point the way rather than repeat the proof points the
// hero panel already lists right beside them, and they make no claims of
// their own.
export const CLICK_LINES = [
  "Hans's work starts just below: his experience first, then his projects.",
  "Rather read it all on one page? The resume is up in the top bar.",
  "Curious how this site works? Hans wrote it up in Notes.",
  "Want to talk? Contact is at the bottom of the page.",
];
