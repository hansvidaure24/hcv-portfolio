"use client";

import PixelBackdrop from "../../scene/PixelBackdrop";
import { WATER_COLORS, paintWater } from "./water";

/**
 * The section's backdrop, the still water (see water.ts). A client
 * component, so the server-rendered section can use it: the painter is a
 * function, which can't be passed from the server.
 */
export default function WaterBackdrop() {
  return <PixelBackdrop paint={paintWater} colors={WATER_COLORS} />;
}
