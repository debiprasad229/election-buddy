/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        governance: {
          50: '#f0f5fa',
          100: '#e1ebf4',
          200: '#c5d8ea',
          300: '#9abbdc',
          400: '#6999cb',
          500: '#467bba',
          600: '#34609b',
          700: '#2b4d7d',
          800: '#264268',
          900: '#233857',
          950: '#17243b', // High-contrast base
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans Odia',
          'Noto Sans Telugu',
          'Noto Sans Tamil',
          'Noto Sans Devanagari',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
