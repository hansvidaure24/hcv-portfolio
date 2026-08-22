import type { Metadata } from 'next'
import Script from 'next/script'
import './scss/globals.scss'
import MotionPreferenceProvider from './components/providers/MotionPreferenceProvider'
import ContactDialogProvider from './components/providers/ContactDialogProvider'
import { MOTION_BOOT_SCRIPT } from './lib/motionPreference'
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './lib/site'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  keywords: [
    "portfolio",
    "developer",
    "web developer",
    "frontend",
    "personal website",
    "React",
    "JavaScript",
    "UI/UX",
    "responsive design",
    "web app",
    "software engineer",
    "showcase",
    "projects",
    "digital resume"
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
  sameAs: [
    'https://github.com/hansvidaure24',
    'https://www.linkedin.com/in/hans-chandler-vidaure-0a1797190',
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
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/icons/folder.svg" />
        <link rel="icon" type="image/png" href="/icons/folder.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/folder.png" />
        <meta name="theme-color" content="#F8EFD8" />
        {/* Set the motion preference before the first paint so the page doesn't
            flash the wrong motion state on load. */}
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT_SCRIPT }} />
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
      <body>
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
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
          <ContactDialogProvider>{children}</ContactDialogProvider>
        </MotionPreferenceProvider>
      </body>
    </html>
  );
}
