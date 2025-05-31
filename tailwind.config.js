/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mainColor: "white",
        primaryColor: colors.amber,
        headerBg: "#1e1412",
        mainBg: "#11100f",
      },
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        comforta: ["Comfortaa", "sans-serif"],
      },
    },
  },
  plugins: [],
};
