import type { Metadata } from "next";
import { SITE_CARD_ALT, SITE_NAME } from "./site";

// The site's own preview card (app/opengraph-image.tsx, app/twitter-image.tsx).
const SITE_CARD = { width: 1200, height: 630, alt: SITE_CARD_ALT };

type PageMeta = {
  title: string;
  description: string;
  /** The page's path, e.g. "/resume": its canonical URL and its preview's link. */
  path: string;
  /** The route has its own opengraph-image and twitter-image files. */
  ownImage?: boolean;
  /** A dated write-up: shared as an article. */
  publishedTime?: string;
};

/**
 * Title, description, canonical URL and link previews for a page below the
 * home page. When a page sets `openGraph` or `twitter`, Next.js replaces the
 * layout's object outright instead of merging it, so each page spells out the
 * whole preview here. Without it, a shared case study, note or resume link
 * had no image or URL, and X showed the home page's title.
 */
export function pageMetadata({ title, description, path, ownImage, publishedTime }: PageMeta): Metadata {
  const shared = {
    title,
    description,
    url: path,
    siteName: SITE_NAME,
    ...(ownImage ? {} : { images: [{ url: "/opengraph-image", ...SITE_CARD }] }),
  };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: publishedTime ? { ...shared, type: "article", publishedTime } : { ...shared, type: "website" },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ownImage ? {} : { images: [{ url: "/twitter-image", ...SITE_CARD }] }),
    },
  };
}
