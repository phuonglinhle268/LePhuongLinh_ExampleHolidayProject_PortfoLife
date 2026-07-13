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
          DEFAULT: '#D02B52',
          light: '#FCE7EB',
          dark: '#B01E3E',
        },
        bgLight: '#FFF5F6',
      },
    },
  },
  plugins: [],
}
