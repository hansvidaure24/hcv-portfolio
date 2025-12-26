import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: '#E6EAF0',
        navy: '#0B1C2D',
        blue: '#1F3A5F',
        gold: '#C9A24D',
        slate: '#2C2F36',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        garamond: ['Apple Garamond Regular', 'serif'],
        quickSand: ['Quicksand', 'sans-serif'],
        pokemon: ['Pokemon Generation', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
