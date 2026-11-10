"use client";

import PixelBackdrop from "./PixelBackdrop";
import {
  FIELD_WATER_COLORS,
  LAWN_SKY_COLORS,
  paintFieldToWater,
  paintLawnToSky,
  paintWaterToLawn,
  WATER_LAWN_COLORS,
} from "./seams";
import styles from "./Seam.module.scss";

const SEAMS = {
  "field-water": { paint: paintFieldToWater, colors: FIELD_WATER_COLORS, className: styles.fieldWater },
  "water-lawn": { paint: paintWaterToLawn, colors: WATER_LAWN_COLORS, className: styles.waterLawn },
  "lawn-sky": { paint: paintLawnToSky, colors: LAWN_SKY_COLORS, className: styles.lawnSky },
} as const;

/**
 * The pixel-art seam at the top of a section, where its backdrop meets the
 * one above (see seams.ts). Pass it as ParallaxSection's `overlay`, so it
 * stays on the edge instead of sliding with the backdrop. A client
 * component, so server-rendered sections can use it by name.
 */
export default function Seam({ kind }: { kind: keyof typeof SEAMS }) {
  const { paint, colors, className } = SEAMS[kind];
  return (
    <div className={`${styles.seam} ${className}`} aria-hidden="true">
      <PixelBackdrop paint={paint} colors={colors} />
    </div>
  );
}
