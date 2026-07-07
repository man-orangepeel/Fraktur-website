import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Bitcoin-orange accent, pulled from the FRAKTUR mark. Dark theme is
        // mandatory site-wide because the v2 logo assets only work on black.
        fraktur: {
          bg: "#05070a",
          panel: "#0d1117",
          border: "#1c232c",
          text: "#e6e9ee",
          muted: "#8a94a3",
          orange: "#f5891a",
          orangeDim: "#c96f14",
        },
        risk: {
          low: "#3ba55d",
          medium: "#e8b339",
          mediumHigh: "#e88a2f",
          high: "#e2542c",
          critical: "#d63b3b",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
