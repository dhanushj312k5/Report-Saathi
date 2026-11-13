/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#4c0519',
          950: '#2b020c',
        },
        obsidian: {
          800: '#14080b',
          900: '#0b0305',
          950: '#060103',
        }
      },
      backgroundImage: {
        'crimson-radial': 'radial-gradient(ellipse at 50% 30%, #8b111e 0%, #3e070c 45%, #0d0204 85%)',
        'fluted-curtain': 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255, 255, 255, 0.015) 40px, rgba(255, 255, 255, 0.015) 80px)',
      }
    },
  },
  plugins: [],
}
