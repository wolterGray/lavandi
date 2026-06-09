/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#050505",
        graphite: "#0F0F0F",
        anthracite: "#171717",
        milk: "#F5F0E8",
        stone: "#A8A096",
        muted: "#6B6560",
        gold: "#C4A962",
        champagne: "#E8DFD0",
        // legacy aliases (migrate gradually)
        mainColor: "#F5F0E8",
        primaryColor: "#C4A962",
        secondaryColor: "#050505",
        headerBg: "#0F0F0F",
        mainBg: "#050505",
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        outfit: ["Outfit", "sans-serif"],
        cormorant: ["Cormorant Garamond", "serif"],
      },
      fontSize: {
        "display-lg": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.01em" }],
        "display-sm": ["1.75rem", { lineHeight: "1.2" }],
      },
      spacing: {
        section: "7rem",
        "section-sm": "5rem",
      },
      maxWidth: {
        content: "72rem",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.7s ease-out forwards",
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
