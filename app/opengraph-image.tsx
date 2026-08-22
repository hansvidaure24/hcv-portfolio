import { ImageResponse } from "next/og";
import { OG_SIZE, TrainerCardOgImage, getOgFonts } from "./lib/ogImage";

export const runtime = "nodejs";
export const alt = "Hans Chandler Vidaure — Full-Stack Software Engineer";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(<TrainerCardOgImage />, { ...size, fonts: getOgFonts() });
}
