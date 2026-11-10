/**
 * Small pixel icons, drawn as rectangles on a 16×16 grid in the text's color
 * (like the Options sliders in the top bar), so they stay crisp at any size
 * and take the theme's colors. Traced to whole pixels (Nov 9) from the 16×16
 * set Hans picked, whose soft anti-aliased edges would blur on the pixel
 * theme. To change one, replace its rectangles here; every place that uses
 * it follows.
 *
 * Always decorative: the word beside an icon (or the button's aria-label)
 * says what it is.
 */

export type PixelIconName = "play" | "code" | "page" | "menu" | "copy";

type Rect = readonly [x: number, y: number, w: number, h: number];

const ICONS: Record<PixelIconName, readonly Rect[]> = {
  // A stepped triangle pointing right: live demo, live site.
  play: [
    [5, 2, 1, 12],
    [6, 3, 1, 10],
    [7, 4, 1, 8],
    [8, 5, 1, 6],
    [9, 6, 1, 4],
    [10, 7, 1, 2],
  ],
  // < >: source code.
  code: [
    [5, 3, 1, 2],
    [3, 5, 2, 1],
    [2, 6, 1, 1],
    [1, 7, 1, 2],
    [2, 9, 1, 1],
    [3, 10, 2, 1],
    [5, 11, 1, 2],
    [10, 3, 1, 2],
    [11, 5, 2, 1],
    [13, 6, 1, 1],
    [14, 7, 1, 2],
    [13, 9, 1, 1],
    [11, 10, 2, 1],
    [10, 11, 1, 2],
  ],
  // A rounded page with three lines of text: a write-up.
  page: [
    [4, 1, 8, 1],
    [3, 2, 1, 1],
    [12, 2, 1, 1],
    [2, 3, 2, 10],
    [12, 3, 2, 10],
    [3, 13, 1, 1],
    [12, 13, 1, 1],
    [4, 14, 8, 1],
    [6, 4, 4, 2],
    [6, 7, 4, 2],
    [6, 10, 4, 2],
  ],
  // Three bars: the phone menu.
  menu: [
    [4, 4, 8, 2],
    [4, 7, 8, 2],
    [4, 10, 8, 2],
  ],
  // Two stacked folders: copy.
  copy: [
    [5, 2, 3, 1],
    [4, 3, 1, 1],
    [8, 3, 1, 1],
    [4, 4, 1, 7],
    [8, 4, 5, 1],
    [13, 5, 1, 6],
    [4, 11, 10, 1],
    [2, 5, 1, 8],
    [12, 12, 1, 1],
    [3, 13, 9, 1],
  ],
};

export default function PixelIcon({ name, size = 16, className }: { name: PixelIconName; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      shapeRendering="crispEdges"
      fill="currentColor"
      className={className}
    >
      {ICONS[name].map(([x, y, w, h]) => (
        <rect key={`${x},${y},${w},${h}`} x={x} y={y} width={w} height={h} />
      ))}
    </svg>
  );
}
