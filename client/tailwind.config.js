/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        darkBg: "rgba(52,52,52)",
        darkText: "#e5e5e5",
        lightBg: "#f9f9f9",
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}