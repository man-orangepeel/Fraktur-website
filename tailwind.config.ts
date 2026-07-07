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
          // Electric midnight blue — second brand accent, used for the audit /
          // verification visual language (flow diagram, progress gauges,
          // "Verify" links), kept distinct from orange's donation/CTA role.
          electric: "#3b6fed",
          electricDim: "#1b2a5c",
        },
        // Legacy risk.* tokens — kept as-is for the Companies page proof
        // table (ProofVisual.tsx), which still uses the original 5-tier
        // model including "Medium-High". Not used by the new Home severity
        // system below.
        risk: {
          low: "#3ba55d",
          medium: "#e8b339",
          mediumHigh: "#e88a2f",
          high: "#e2542c",
          critical: "#d63b3b",
        },
        // Home page's simplified 4-tier severity scale (+ "none" for zero
        // findings) — green reserved exclusively for a clean wallet.
        severity: {
          none: "#3ba55d",
          low: "#e8b339",
          medium: "#e88a2f",
          high: "#e2542c",
          // Vivid magenta-crimson rather than a near-black purple — reads as
          // "beyond red" at a glance against dark panels, doesn't recede into
          // the background the way a very dark tone would.
          critical: "#c81e6e",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
        // Editorial serif for every headline on the Companies page — a
        // web-safe stack, not a Google Fonts fetch (see layout.tsx for why).
        display: ["Iowan Old Style", "Palatino Linotype", "Palatino", "Georgia", "serif"],
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
