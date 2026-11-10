"use client";

// A calm field behind the hero, like a pond with fish in it: little critters
// (SpritePilot's CC0 Creatures Pack) buzz, fly and potter about, and which
// ones are out follows the site's time of day. Nothing to play and nothing in
// the way. Hover one and it pipes up; click it and it says one line in the
// dialogue box. It's decorative, so screen readers skip it (the clicked line
// still reaches them through the dialogue box). On a phone, a tap on the
// grass stands in for the cursor for a moment.
//
// Rendering: the scene is drawn at its real pixel size into a small buffer,
// then scaled up by a whole number of *device* pixels, so pixels stay square
// and crisp on any screen. It updates at about 30 fps and stops while the hero
// is off screen or the tab is hidden.

import { useEffect, useRef } from "react";
import { useDialogue } from "../../../providers/DialogueProvider";
import { useMotionSettings } from "../../../providers/MotionPreferenceProvider";
import { playSound } from "../../../../lib/sound";
import type { Actor, Cast, SpriteView } from "./cast";
import { ALL_SPECIES, Critters, sheetUrl, type Species } from "./critters";
import { FieldLife, LIFE_ART, lifeUrl, type Drawable, type LifeArt } from "./life";
import { FIND_ART, Finds, findLine, findSound, findUrl, LEVEL_UP_SOUND, type FindArt } from "./finds";
import { CloudShadows } from "./clouds";
import { track } from "../../../../lib/analytics";
import { fitPixelCanvas, grassPainter, setPixel, watchViewport } from "../../../../lib/pixelArt";
import { buildField, TILE, type Field, type Rect } from "./fieldMap";
import styles from "./HeroField.module.scss";

/** Paint the field's base grass (shared with the Contact shore). */
function paintField(g: CanvasRenderingContext2D, w: number, h: number) {
  const grass = grassPainter(w, h);
  const image = g.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) setPixel(image, x, y, grass(x, y));
  g.putImageData(image, 0, 0);
}

const MAX_ACTORS = 8;
const FRAME_MS = 32;
// How long a tap on the grass counts as the cursor being there, on phones.
const TAP_MS = 1500;

/**
 * Load an image. Waits for the load event rather than image.decode(), which
 * can stay pending while the page isn't rendering (a tab opened in the
 * background), and then the field would never start.
 */
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Couldn't load ${src}`));
    image.src = src;
  });
}

export default function HeroField() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  const bubbleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const { reduced } = useMotionSettings();
  const { say } = useDialogue();
  const reducedRef = useRef(reduced);
  const sayRef = useRef(say);

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);
  useEffect(() => {
    sayRef.current = say;
  }, [say]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const wrapEl = wrapRef.current;
    const heroEl = wrapEl?.closest("section");
    const context = canvasEl?.getContext("2d");
    const glowEl = glowRef.current;
    const glowContext = glowEl?.getContext("2d");
    if (!canvasEl || !wrapEl || !heroEl || !context || !glowEl || !glowContext) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const wrap: HTMLDivElement = wrapEl;
    const hero: HTMLElement = heroEl;
    const ctx: CanvasRenderingContext2D = context;
    // Fireflies get their own canvas above the time-of-day tint, so they
    // glow at night instead of being dimmed along with the field.
    const glowCanvas: HTMLCanvasElement = glowEl;
    const gctx: CanvasRenderingContext2D = glowContext;

    const buffer = document.createElement("canvas");
    const bctx = buffer.getContext("2d")!;
    const glowBuffer = document.createElement("canvas");
    const gbctx = glowBuffer.getContext("2d")!;
    let critterImages: Record<Species, HTMLImageElement> | null = null;
    let lifeImages: Record<LifeArt, HTMLImageElement> | null = null;
    let life: FieldLife | null = null;
    let findImages: Record<FindArt, HTMLImageElement> | null = null;
    let finds: Finds | null = null;
    let clouds: CloudShadows | null = null;
    let glowing = false;

    let disposed = false;
    let ready = false;
    let raf = 0;
    let onScreen = true;
    let last = performance.now();
    let field: Field | null = null;
    let cast: Cast | null = null;
    let views: SpriteView[] = [];
    let ground: HTMLCanvasElement | null = null;
    let scale = 3; // device pixels per map pixel
    let dpr = 1;
    let hovered: Actor | null = null;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    let tapTimer: ReturnType<typeof setTimeout> | undefined;

    /** Fit the field to the hero. False while the hero has no size yet. */
    function layout() {
      const box = hero.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return false;
      // Two CSS pixels per art pixel (the default), the same for everything
      // in the scene so no two things have different-sized pixels. Size
      // differences come from the art instead: a 16 px bee next to a 32 px
      // bird.
      ({ dpr, scale } = fitPixelCanvas(canvas, box.width, box.height));
      fitPixelCanvas(glowCanvas, box.width, box.height);
      const cell = (TILE * scale) / dpr; // CSS pixels per cell
      const w = Math.ceil(canvas.width / (TILE * scale));
      const h = Math.ceil(canvas.height / (TILE * scale));
      const avoid: Rect[] = Array.from(hero.querySelectorAll<HTMLElement>("[data-field-avoid]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { x: (r.left - box.left) / cell, y: (r.top - box.top) / cell, w: r.width / cell, h: r.height / cell };
      });
      const topRows = Math.ceil((parseFloat(getComputedStyle(hero).paddingTop) || 0) / cell);

      const seen = { w: canvas.width / (TILE * scale), h: canvas.height / (TILE * scale) };
      const f = buildField(w, h, seen, avoid, topRows);
      field = f;
      const timeOfDay = document.documentElement.dataset.time ?? "day";
      cast = new Critters(f, critterImages!, timeOfDay, topRows);
      life = new FieldLife(f, lifeImages!, timeOfDay);
      finds = new Finds(f, findImages!);
      clouds = new CloudShadows(w * TILE, h * TILE);
      hovered = null;
      buffer.width = glowBuffer.width = w * TILE;
      buffer.height = glowBuffer.height = h * TILE;
      glowing = true; // clear the glow canvas on the next draw
      ground = document.createElement("canvas");
      ground.width = w * TILE;
      ground.height = h * TILE;
      paintField(ground.getContext("2d")!, ground.width, ground.height);
      return true;
    }

    function draw() {
      if (!field || !cast) return;
      if (ground) bctx.drawImage(ground, 0, 0);
      // Cloud shadows fall on the ground, under everything standing on it.
      // With reduced motion they're left out: a still one is just a smudge.
      if (!reducedRef.current) clouds?.draw(bctx);

      // Everything on the ground sorted by its bottom edge, so whoever is
      // lower on screen is drawn in front (a beetle walking behind the grass).
      views = cast.views();
      const items: Drawable[] = [
        ...views,
        ...(life?.ground() ?? []),
        ...(finds?.ground() ?? []),
        ...(cast.shadows?.() ?? []),
      ];
      items.sort((a, b) => a.baseY - b.baseY).forEach((item) => item.draw(bctx));
      life?.air().forEach((item) => item.draw(bctx));
      finds?.air().forEach((item) => item.draw(bctx));

      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(buffer, 0, 0, buffer.width, buffer.height, 0, 0, buffer.width * scale, buffer.height * scale);

      // The glow layer: only redrawn while something's glowing.
      const glow = life?.glow() ?? [];
      if (glow.length || glowing) {
        gctx.clearRect(0, 0, glowCanvas.width, glowCanvas.height);
        gbctx.clearRect(0, 0, glowBuffer.width, glowBuffer.height);
        glow.forEach((item) => item.draw(gbctx));
        gctx.imageSmoothingEnabled = false;
        gctx.drawImage(glowBuffer, 0, 0, glowBuffer.width, glowBuffer.height, 0, 0, glowBuffer.width * scale, glowBuffer.height * scale);
        glowing = glow.length > 0;
      }

      // Speech bubbles are DOM, in the site's own panel style and font.
      const shown = new Set<number>();
      for (const v of views) {
        const el = bubbleRefs.current[v.index];
        const bubble = v.actor.bubble;
        if (!el || !bubble) continue;
        const x = Math.round((v.head.x * scale) / dpr);
        const y = Math.round((v.head.y * scale) / dpr);
        if (el.textContent !== bubble.text) el.textContent = bubble.text;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
        el.hidden = false;
        shown.add(v.index);
      }
      bubbleRefs.current.forEach((el, i) => {
        if (el && !shown.has(i)) el.hidden = true;
      });
    }

    function tick(now: number) {
      raf = 0;
      if (disposed || !ready) return;
      if (now - last < FRAME_MS) {
        schedule();
        return;
      }
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      cast?.update(dt, reducedRef.current);
      life?.update(dt, reducedRef.current);
      finds?.update(dt, reducedRef.current);
      if (!reducedRef.current) {
        clouds?.update(dt);
        // Grass rustles where walkers pass through it.
        for (const f of cast?.feet?.() ?? []) life?.brush(f.x, f.y);
      }
      draw();
      schedule();
    }

    function schedule() {
      if (!raf && ready && onScreen && !document.hidden) raf = requestAnimationFrame(tick);
    }

    function resume() {
      last = performance.now();
      schedule();
    }

    // --- Pointer: hover pipes up, click says a line in the dialogue box. ---
    /** The pointer in map pixels, or null when it's over the text, the photo or a control. */
    function mapPoint(e: MouseEvent) {
      const target = e.target as Element | null;
      if (target?.closest("[data-field-avoid], a, button, input, textarea")) return null;
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) * dpr) / scale, y: ((e.clientY - r.top) * dpr) / scale };
    }

    function viewAt(e: MouseEvent): SpriteView | null {
      const p = mapPoint(e);
      if (!cast || !p) return null;
      const { x, y } = p;
      let found: SpriteView | null = null;
      for (const v of views) {
        const { hit } = v;
        if (x >= hit.x && x <= hit.x + hit.w && y >= hit.y && y <= hit.y + hit.h && (!found || v.baseY > found.baseY)) found = v;
      }
      return found;
    }

    function setHovered(actor: Actor | null) {
      if (actor === hovered) return;
      if (hovered) hovered.hovered = false;
      hovered = actor;
      if (actor) {
        actor.hovered = true;
        cast?.poke(actor);
      }
      hero.style.cursor = actor ? "pointer" : "";
    }

    function onFind(e: MouseEvent) {
      const p = mapPoint(e);
      return !!p && !!finds?.hit(p.x, p.y);
    }

    // Critters and fireflies notice the cursor; grass rustles as it passes.
    function setPointer(p: { x: number; y: number } | null) {
      cast?.setPointer?.(p);
      life?.setPointer(p);
      if (p && !reducedRef.current) life?.brush(p.x, p.y);
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setPointer(mapPoint(e));
      setHovered(viewAt(e)?.actor ?? null);
      if (!hovered && onFind(e)) hero.style.cursor = "pointer";
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setPointer(null);
      setHovered(null);
    };
    // Phones have no cursor, so a tap on the grass stands in for one for a
    // moment: birds near it flutter off, a bee wanders over, the grass under
    // it rustles. Then it lifts, as if the cursor had left. A tap on a
    // critter or a find is left to the click, so a bird doesn't fly off from
    // the very tap meant for it.
    const onTap = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      const p = mapPoint(e);
      if (!p || viewAt(e) || onFind(e)) return;
      setPointer(p);
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => setPointer(null), TAP_MS);
    };
    const onClick = (e: MouseEvent) => {
      // A gem or star first: it's what someone reaching for it means to hit.
      if (onFind(e)) {
        const got = finds?.collect();
        if (!got) return;
        playSound(findSound(got), 0.6);
        if (got.levelUp) {
          setTimeout(() => playSound(LEVEL_UP_SOUND, 0.6), 350);
          track("hero_finds_complete");
        }
        sayRef.current(findLine(got));
        hero.style.cursor = "";
        return;
      }
      const view = viewAt(e);
      if (!view || !cast) return;
      cast.poke(view.actor);
      life?.pop(view.head.x, view.head.y);
      // Quiet, and only if the visitor turned sound on (playSound checks).
      if (view.actor.sound) playSound(view.actor.sound, 0.5);
      sayRef.current(view.actor.line);
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    hero.addEventListener("pointerdown", onTap);
    hero.addEventListener("click", onClick);

    const io = new IntersectionObserver(([entry]) => {
      onScreen = Boolean(entry?.isIntersecting);
      if (onScreen) resume();
    });
    io.observe(hero);
    const onVisibility = () => {
      if (!document.hidden) resume();
    };
    document.addEventListener("visibilitychange", onVisibility);

    let loaded = false; // the art is in
    let laidOut = ""; // the hero's size and pixel density at the last layout
    /** Lay the field out again. Unless forced, only if the hero's size or the pixel density changed. */
    function relayout(force: unknown = true) {
      const box = hero.getBoundingClientRect();
      const key = `${Math.round(box.width)}x${Math.round(box.height)}@${window.devicePixelRatio}`;
      if (!force && key === laidOut) return;
      if (!loaded || !layout()) return;
      laidOut = key;
      draw();
      if (!ready) {
        // The first time it fits: fade the field in. If the hero had no size
        // yet, this waits for the resize that gives it one.
        ready = true;
        wrap.setAttribute("data-ready", "");
        hero.setAttribute("data-field", "ready");
        resume();
      }
    }
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(relayout, 150);
    });
    // The text panel and photo too: they can change size without the hero
    // changing (fonts, copy edits), and the field has to make room again.
    ro.observe(hero);
    hero.querySelectorAll("[data-field-avoid]").forEach((el) => ro.observe(el));
    // Browser zoom changes the pixel density as well as the size, and a
    // resize observer alone can miss it. Plain window resizes also fire when
    // a phone's address bar slides away, so those only count if the hero's
    // size or density really changed (or the critters would start over).
    const unwatchViewport = watchViewport(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => relayout(false), 150);
    });
    // Picking a time of day in Options swaps who's out.
    const timeWatch = new MutationObserver(relayout);
    timeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-time"] });

    // Start once the art is in and the hero's own entrance has settled, so
    // the text panel and photo are measured where they end up.
    const settled = new Promise((resolve) => setTimeout(resolve, 700));
    const art: Promise<unknown>[] = [
      document.fonts?.ready,
      settled,
      Promise.all(ALL_SPECIES.map((s) => loadImage(sheetUrl(s)))).then((images) => {
        critterImages = Object.fromEntries(ALL_SPECIES.map((s, i) => [s, images[i]!])) as Record<Species, HTMLImageElement>;
      }),
      Promise.all(LIFE_ART.map((a) => loadImage(lifeUrl(a)))).then((images) => {
        lifeImages = Object.fromEntries(LIFE_ART.map((a, i) => [a, images[i]!])) as Record<LifeArt, HTMLImageElement>;
      }),
      Promise.all(FIND_ART.map((a) => loadImage(findUrl(a)))).then((images) => {
        findImages = Object.fromEntries(FIND_ART.map((a, i) => [a, images[i]!])) as Record<FindArt, HTMLImageElement>;
      }),
    ];
    Promise.all(art)
      .then(() => {
        if (disposed) return;
        loaded = true;
        relayout();
      })
      .catch((error) => {
        // The art didn't load (or setting up failed): the painted sky behind
        // it stays. Say why while developing, so a bug can't hide here.
        if (process.env.NODE_ENV !== "production") console.error("Hero field didn't start:", error);
      });

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      clearTimeout(tapTimer);
      ro.disconnect();
      unwatchViewport();
      io.disconnect();
      timeWatch.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      hero.removeEventListener("pointerdown", onTap);
      hero.removeEventListener("click", onClick);
      hero.removeAttribute("data-field");
      hero.style.cursor = "";
    };
  }, []);

  return (
    <div ref={wrapRef} className={styles.field} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.focus} />
      <div className={styles.shade} />
      <div className={styles.tint} />
      <canvas ref={glowRef} className={styles.glow} />
      {Array.from({ length: MAX_ACTORS }, (_, i) => (
        <span
          key={i}
          hidden
          className={styles.bubble}
          ref={(el) => {
            bubbleRefs.current[i] = el;
          }}
        />
      ))}
    </div>
  );
}
