The top of this site used to be a painted sky. Now it's a small field: birds, bees and a slime by day, bats and ghosts at night, fireflies when it's dark, tall grass that rustles when the cursor passes through it. I wanted it to feel alive without getting in the way of the one thing a visitor came for, which is the text in front of it. This is how it's built, and the two bugs that taught me the most.

## Pixels that stay square

Pixel art falls apart the moment the browser scales it by a fraction: one column of pixels comes out twice as wide as its neighbor, and the whole scene looks smeared. So the field never lets the browser decide. It draws the scene at its real size into a small buffer, then copies it up to the screen by a whole number of *device* pixels:

```ts
const scale = Math.max(1, Math.round(2 * devicePixelRatio)); // ~2 CSS px per art pixel
canvas.width = Math.floor(box.width * devicePixelRatio);
canvas.style.width = `${canvas.width / devicePixelRatio}px`; // never stretched
ctx.imageSmoothingEnabled = false;
ctx.drawImage(buffer, 0, 0, buffer.width * scale, buffer.height * scale);
```

Everything in the scene uses the same scale, so a 16 px bee next to a 32 px bird looks like two sizes of creature, not two sizes of pixel.

## Alive, but cheap

A background that animates all the time costs every visitor, including the ones who never look at it. So the field:

- loads after the page, so the name and the buttons paint first;
- updates at about 30 frames a second, not 60;
- stops completely when the hero is off screen or the tab is hidden;
- shows a plain grass color until it's ready: the same color the field draws, measured to within one shade, so loading only adds the life instead of swapping scenes.

The other sections have backdrops too (water, a lawn, a shoreline), but they're still. Each is painted once, when its section comes near the screen, in about 10 to 25 ms. The tall ones are drawn at their real pixel size and scaled up by CSS, which takes about a ninth of the memory: around 3 MB instead of 27 MB for the tallest one on my screen.

## Bug 1: zooming out broke the field

Zooming the browser out left the grass covering only the top of the hero; below it, nothing. The canvas was still sized for the old zoom level.

The field re-laid itself out from a `ResizeObserver` alone, and I had assumed that covered every size change. Zoom changes the page's size *and* its pixel density, so instead of trusting one signal, the field now also listens to the window's `resize` event and to a media query that fires when the pixel density changes:

```ts
const density = matchMedia(`(resolution: ${devicePixelRatio}dppx)`);
density.addEventListener("change", relayout);
window.addEventListener("resize", relayout);
```

That fix had a catch of its own. On phones, `resize` also fires whenever the address bar slides away as you scroll, and a re-layout puts every critter back at the start. So a re-layout now only runs when the hero's size or the pixel density has really changed.

## Bug 2: a server component can't pass a function

The section backdrops share one component that takes a painter function: water for Experience, a lawn for Work. Wiring it into a section rendered on the server took the whole page down with a 500: React can't send a function from a server component to a client one, because it can't be serialized. Each section now uses a tiny client wrapper that imports its own painter. Obvious in hindsight; easy to miss when the component you're reusing was first used from a client component, where it just worked.

## What I'd do differently

Test zoom from the start. I had checked phones, tablets and monitors, in portrait and landscape, and zoom was the case none of them covered.
