import type { Config } from "tailwindcss";

/**
 * Tailwind v4 reads design tokens from `@theme` in app/globals.css.
 * This legacy config (loaded via `@config` in globals.css) only carries
 * things that are awkward to express in CSS: breakpoints, keyframes, fonts.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "390px",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-out": { from: { opacity: "1" }, to: { opacity: "0" } },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "45%": { opacity: "0.86" },
          "55%": { opacity: "0.94" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent)" },
          "50%": { boxShadow: "0 0 24px 4px color-mix(in srgb, var(--accent) 35%, transparent)" },
        },
      },
      animation: {
        "fade-in": "fade-in 600ms ease-out both",
        "fade-out": "fade-out 900ms ease-in forwards",
        "rise-in": "rise-in 500ms cubic-bezier(.2,.8,.2,1) both",
        flicker: "flicker 4s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
      },
    },
  },
};

export default config;
