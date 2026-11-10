import { ImageResponse } from "next/og";
import { OG_SIZE, TrainerCardOgImage, getOgFonts } from "./lib/ogImage";
import { SITE_CARD_ALT } from "./lib/site";

export const runtime = "nodejs";
export const alt = SITE_CARD_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<TrainerCardOgImage />, { ...size, fonts: getOgFonts() });
}
