import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
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
        // Emerald (GBA) palette
        routeGreen: '#4C8C6B',
        routeGreenDark: '#2E5C45',
        routeGreenDeep: '#1B3B2C',
        panelCream: '#F8EFD8',
        panelBorder: '#2A2A1E',
        pathBrown: '#8A6D4B',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        quickSand: ['Quicksand', 'sans-serif'],
        pokePixel: ['PokePixel', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config
