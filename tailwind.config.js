/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#081226',
        surface: '#0b1b3d',
        accent: '#f59e0b',
      },
    },
  },
  plugins: [],
}
