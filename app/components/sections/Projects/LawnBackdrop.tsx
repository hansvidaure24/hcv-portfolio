"use client";

import PixelBackdrop from "../../scene/PixelBackdrop";
import { LAWN_COLORS, paintLawn } from "./lawn";

/**
 * The section's backdrop, the mown lawn (see lawn.ts). A client
 * component, so the server-rendered section can use it: the painter is a
 * function, which can't be passed from the server.
 */
export default function LawnBackdrop() {
  return <PixelBackdrop paint={paintLawn} colors={LAWN_COLORS} />;
}
