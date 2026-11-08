import type { Config } from 'tailwindcss'

// Colors and fonts point at the CSS custom properties in app/scss/globals.scss,
// so Tailwind utilities and the Sass modules share one set of tokens.
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        'ink-muted': 'var(--ink-muted)',
        cream: 'var(--cream)',
        paper: 'var(--paper)',
        gold: 'var(--gold)',
        'gold-light': 'var(--gold-light)',
        'gold-deep': 'var(--gold-deep)',
        green: 'var(--green)',
        red: 'var(--red)',
        wood: 'var(--wood)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
}
export default config
