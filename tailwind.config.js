/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: '#E8EBF0',
          100: '#C5CCD9',
          200: '#8E9BB3',
          300: '#576A8D',
          400: '#2E4270',
          500: '#1B2A4A',
          600: '#162240',
          700: '#111A33',
          800: '#0C1226',
          900: '#070B19',
        },
        gold: {
          50: '#FDF8EF',
          100: '#F9EDDA',
          200: '#F0D5A8',
          300: '#E4BC76',
          400: '#D4A54E',
          500: '#C9A96E',
          600: '#B08A45',
          700: '#8D6E36',
          800: '#6A5228',
          900: '#47371A',
        },
        ivory: {
          50: '#FDFCFA',
          100: '#F5F0EB',
          200: '#E8E3DE',
          300: '#D4CEC7',
          400: '#B8B0A6',
          500: '#9C9285',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
