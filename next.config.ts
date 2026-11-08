import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'
// Vercel preview deployments inject the Vercel toolbar from vercel.live.
const isPreview = process.env.VERCEL_ENV === 'preview'
const toolbar = isPreview ? ' https://vercel.live' : ''

// Everything is self-hosted (fonts via next/font, images, video, sound), so
// the only third parties are Google Analytics and, inside the contact form,
// Cloudflare Turnstile. Inline scripts stay allowed:
// Next's App Router streams its data in inline <script> tags, and so do the
// pre-paint boot scripts in layout.tsx. Nonces would mean rendering every
// page per request. Everything else is locked to this origin.
// GA4 sends hits to google-analytics.com or, depending on the visitor, to
// www.google.com/g/collect (seen in testing; leaving it out silently drops
// those pageviews), and to doubleclick when Google signals is on.
const GA = 'https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.google.com https://*.g.doubleclick.net'
// Cloudflare Turnstile (the contact form's bot check): its script and the
// iframe it draws the challenge in. Loaded only when the contact form opens.
const TURNSTILE = 'https://challenges.cloudflare.com'

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://*.googletagmanager.com ${TURNSTILE}${toolbar}`,
  `connect-src 'self' ${GA}${toolbar}`,
  `img-src 'self' data: ${GA}${toolbar}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "media-src 'self'",
  `frame-src ${TURNSTILE}${toolbar}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

// HSTS is left to Vercel (max-age=63072000), and every .dev domain is on the
// browsers' HSTS preload list anyway, so it isn't repeated here.
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      // Not on PDFs: browsers render a PDF inside their own viewer page, and a
      // strict CSP on the PDF response can leave the resume blank.
      { source: '/((?!.*\\.pdf$).*)', headers: [{ key: 'Content-Security-Policy', value: CSP }] },
    ]
  },
}

export default nextConfig
