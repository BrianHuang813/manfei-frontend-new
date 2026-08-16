/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#bfa094',
          600: '#a18072',
          700: '#977669',
          800: '#846358',
          900: '#43302b',
        },
        secondary: {
          DEFAULT: '#2C3E50',
          50: '#e8ecf0',
          100: '#d1d9e1',
          200: '#a3b3c3',
          300: '#758da5',
          400: '#476787',
          500: '#2C3E50',
          600: '#243240',
          700: '#1c2630',
          800: '#141a20',
          900: '#0c0e10',
        },
        background: '#F9F9F9',
        // Warmer off-white used by member-facing surfaces
        canvas: '#FAF9F6',
        line: '#06C755', // LINE brand green — fixed by LINE, not ours to theme
        gold: {
          DEFAULT: '#A89070',
          light: '#C4AD94',
          dark: '#8A7560',
          // Same hue, 20% darker. The only gold that clears 4.5:1 against
          // white, so it is the one to use when white text sits on gold.
          deep: '#86735A',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif TC"', 'serif'],
        sans: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
