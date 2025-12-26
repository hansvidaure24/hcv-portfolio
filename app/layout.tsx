import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hans Portfolio',
  description: 'A sleek, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS. Showcases your projects, skills, and contact information with a clean design, fast performance, and mobile-friendly experience.',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/icons/folder.svg" />
        <link rel="icon" type="image/png" href="/icons/folder.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/folder.png" />
        <meta name="theme-color" content="#0B1C2D" />
        {/* Open Graph Meta Tags for social sharing */}
        <meta property="og:title" content="Hans Portfolio – Modern Developer Portfolio" />
        <meta property="og:description" content="A sleek, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS. Showcases your projects, skills, and contact information with a clean design, fast performance, and mobile-friendly experience." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://your-deployed-site-url.com" />
        <meta property="og:image" content="/icons/folder.png" />
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hans Portfolio – Modern Developer Portfolio" />
        <meta name="twitter:description" content="A sleek, responsive portfolio website built with Next.js, TypeScript, and Tailwind CSS. Showcases your projects, skills, and contact information with a clean design, fast performance, and mobile-friendly experience." />
        <meta name="twitter:image" content="/icons/folder.png" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}