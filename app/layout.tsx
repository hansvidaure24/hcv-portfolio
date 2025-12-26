import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hans Portfolio',
  description: 'My professional portfolio website',
  keywords: ['portfolio', 'developer', 'projects'],
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
        <link rel="alternate icon" type="image/png" href="/icons/folder.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/folder.png" />
        <meta name="theme-color" content="#0B1C2D" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}