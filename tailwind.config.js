/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#08060C",
        ivory: "#0A080E",
        void: "#08060C",
        surface: "#0C0A10",
        "purple-header": "#130B1E",
        card: "#100E14",
        border: "#1A1520",
        graphite: "#0C0A10",
        panel: "#100E14",
        milk: "#E5DFD8",
        stone: "#9A8880",
        muted: "#706468",
        accent: "#D9A752",
        gold: "#D9A752",
        "gold-hover": "#C59239",
        "gold-dark": "#C59239",
        ink: "#E5DFD8",
        "ink-muted": "#9A8880",
        "ink-faint": "#706468",
        canvas: "#08060C",
        spa: {
          gold: "#D9A752",
          "gold-dark": "#C59239",
          brown: "#100E14",
          taupe: "#9A8880",
          muted: "#706468",
          footer: "#07050A",
        },
        mainColor: "#E5DFD8",
        primaryColor: "#D9A752",
        secondaryColor: "#0C0A10",
        headerBg: "#130B1E",
        mainBg: "#08060C",
      },
      fontFamily: {
        sans: ["Onest", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        cormorant: ["Cormorant Garamond", "serif"],
        outfit: ["Outfit", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["3.5rem", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
        "display-lg": ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        "display-md": ["2.125rem", { lineHeight: "1.18" }],
        "display-sm": ["1.625rem", { lineHeight: "1.22" }],
        label: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.2em" }],
      },
      spacing: {
        section: "6.5rem",
        "section-sm": "4.5rem",
      },
      maxWidth: {
        content: "90rem",
        prose: "40rem",
      },
      borderRadius: {
        card: "1.25rem",
        pill: "9999px",
      },
      boxShadow: {
        spa: "0 2px 14px rgba(8, 6, 6, 0.38)",
        "spa-hover": "0 4px 18px rgba(6, 5, 8, 0.45), 0 0 28px rgba(184, 149, 107, 0.08)",
        header: "0 1px 10px rgba(8, 6, 6, 0.18)",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.7s ease-out forwards",
        "fade-up": "fadeUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
