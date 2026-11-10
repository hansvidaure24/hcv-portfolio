import { OG_SIZE, PROJECT_OG_ALT, projectOgImage, projectOgImageParams } from "../../lib/ogImage";

// Each case study's own link preview (lib/ogImage.tsx), drawn at build.
export const runtime = "nodejs";
export const alt = PROJECT_OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";
export const generateStaticParams = projectOgImageParams;
export const dynamicParams = false;
export default projectOgImage;
