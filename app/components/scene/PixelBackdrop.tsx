"use client";

import { useEffect, useRef } from "react";
import { fitArtCanvas, parseColor, watchViewport, type RGB } from "../../lib/pixelArt";
import styles from "./PixelBackdrop.module.scss";

/** Paints a backdrop into an image at its real pixel size. */
export type Painter = (image: ImageData, colors: Record<string, RGB>) => void;

type Props = {
  paint: Painter;
  /**
   * CSS custom properties the painter uses (read from the page). They change
   * with the time of day, and the backdrop is repainted when they do.
   */
  colors?: readonly string[];
  className?: string;
};

const NONE: readonly string[] = [];

/**
 * A still pixel-art backdrop for a section's background layer (pass it as
 * ParallaxSection's `background`). Painted once, when the section comes near
 * the screen (many visits never reach the lower sections), then again only if
 * the layer changes size or the time of day changes its colors. Until then
 * the layer's own CSS background shows, which is also what visitors without
 * JavaScript get.
 */
export default function PixelBackdrop({ paint, colors = NONE, className = "" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = ref.current;
    const boxEl = canvasEl?.parentElement;
    if (!canvasEl || !boxEl) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const box: HTMLElement = boxEl;
    let painted = "";
    let near = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function render() {
      // The layout size: the layer slides with the page (parallax), which
      // doesn't change it.
      const width = box.clientWidth;
      const height = box.clientHeight;
      if (width < 1 || height < 1) return;
      const style = getComputedStyle(document.documentElement);
      const palette: Record<string, RGB> = {};
      for (const name of colors) palette[name] = parseColor(style.getPropertyValue(name)) ?? [0, 0, 0];
      const key = `${width}x${height}@${window.devicePixelRatio}:${JSON.stringify(palette)}`;
      if (key === painted) return;
      painted = key;
      const { w, h } = fitArtCanvas(canvas, width, height);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const image = ctx.createImageData(w, h);
      paint(image, palette);
      ctx.putImageData(image, 0, 0);
      canvas.setAttribute("data-ready", "");
    }

    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(render, 150);
    });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        near = true;
        render();
        ro.observe(box);
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(box);
    // Browser zoom changes the pixel density as well as the size; render()
    // skips the work when neither really changed.
    const unwatchViewport = watchViewport(() => {
      if (!near) return;
      clearTimeout(timer);
      timer = setTimeout(render, 150);
    });
    // Picking a time of day in Options changes the section's colors.
    const timeWatch = new MutationObserver(() => {
      if (near) render();
    });
    timeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-time"] });

    return () => {
      io.disconnect();
      ro.disconnect();
      unwatchViewport();
      timeWatch.disconnect();
      clearTimeout(timer);
    };
  }, [paint, colors]);

  return <canvas ref={ref} className={`${styles.backdrop} ${className}`} />;
}
