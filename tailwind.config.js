/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mainColor: "white",
        primaryColor: "#b7864d",
        secondaryColor: "#0d0510",
        headerBg: "#1e1412",
        mainBg: "#11100f",
      },
      animation: {
        "pulse-slow": "pulse 2.5s infinite",
      },
      fontFamily: {
        manrope: ["Manrope", "sans-serif"],
        comforta: ["Comfortaa", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        cinzel: ["Cinzel", "serif"],
      },
    },
  },
  plugins: [],
};
