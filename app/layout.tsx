import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'
import './scss/globals.scss'
import MotionPreferenceProvider from './components/providers/MotionPreferenceProvider'
import ContactDialogProvider from './components/providers/ContactDialogProvider'
import DialogueProvider from './components/providers/DialogueProvider'
import OptionsProvider from './components/providers/OptionsProvider'
import MorphWatcher from './components/scene/MorphWatcher'
import AnalyticsClicks from './components/providers/AnalyticsClicks'
import { MOTION_BOOT_SCRIPT } from './lib/motionPreference'
import { TIME_BOOT_SCRIPT } from './lib/timeOfDay'
import { TEXT_SPEED_BOOT_SCRIPT } from './lib/preferenceKeys'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './lib/site'
import { DEX } from './data/dex'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

// next/font self-hosts these as preloaded files with a size-matched fallback,
// so text paints right away without a layout shift when the font arrives.
// Inter ships as a small latin-only WOFF2 instead of the 874 KB variable TTF.
const inter = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-inter' })
// The pixel display font: Pixelify Sans (SIL Open Font License, see
// public/fonts/OFL-pixelify-sans.txt), the regular weight as a local file so
// the link-preview image (lib/ogImage.tsx) can use the same one. It draws
// small for its size, so it's scaled up 134% (its width and x-height then
// match the font it replaced, and every size and layout tuned for that one
// still holds). next/font's own stand-in for it is sized for 100%, so text
// set in it rewrapped when the real font arrived and pushed the page down;
// "Pixelify Fallback" (globals.scss) is sized for the 134%.
const pixel = localFont({
  src: '../public/fonts/pixelify-sans.ttf',
  display: 'swap',
  variable: '--font-pixel',
  adjustFontFallback: false,
  fallback: ['Pixelify Fallback', 'monospace'],
  declarations: [{ prop: 'size-adjust', value: '134%' }],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  keywords: [
    "Hans Vidaure",
    "full-stack software engineer",
    "software engineer",
    "C#",
    ".NET",
    "ASP.NET",
    "React",
    "TypeScript",
    "SQL",
    "application security",
    "fintech",
    "portfolio"
  ],
  authors: [{ name: 'Hans Chandler Vidaure' }],
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

const PERSON_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Hans Chandler Vidaure',
  url: SITE_URL,
  jobTitle: 'Full-Stack Software Engineer',
  // Every skill with proof on the site (app/data/dex.ts), training-only ones left out.
  knowsAbout: DEX.filter((entry) => entry.status === 'caught').map((entry) => entry.name),
  sameAs: [
    'https://github.com/hansvidaure24',
    'https://www.linkedin.com/in/hans-chandler-vidaure/',
  ],
};

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" className={`${inter.variable} ${pixel.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/icons/folder.svg" />
        <link rel="icon" type="image/png" href="/icons/folder.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/folder.png" />
        <meta name="theme-color" content="#F8EFD8" />
        {/* Set the motion preference before the first paint so the page doesn't
            flash the wrong motion state on load. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
        {/* Pick the time-of-day palette before the first paint, too. */}
        <script dangerouslySetInnerHTML={{ __html: TIME_BOOT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: TEXT_SPEED_BOOT_SCRIPT }} />
        {/* Without JavaScript the scroll fade-ins never run: show those
            sections as they are (ParallaxSection marks them data-reveal). */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: "<style>[data-reveal]{opacity:1!important;transform:none!important}</style>",
          }}
        />
        {/* These are static schema objects, so stringifying them is fine. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
      </head>
      {/* Browser extensions add classes to <body> before React loads (an ad
          blocker's "TotalExt-Lang-en", for one); that isn't a bug in the page. */}
      <body suppressHydrationWarning>
        {GA_ID && (
          <>
            {/* lazyOnload: the 177 KB analytics script waits until the page has
                finished loading, so it never competes with the hero for the
                main thread. Visits are still recorded. */}
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="lazyOnload" />
            <Script id="ga4-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <MotionPreferenceProvider>
          <DialogueProvider>
            <OptionsProvider>
              <ContactDialogProvider>{children}</ContactDialogProvider>
              <MorphWatcher />
              <AnalyticsClicks />
            </OptionsProvider>
          </DialogueProvider>
        </MotionPreferenceProvider>
      </body>
    </html>
  );
}
