import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-muted": "rgb(var(--color-surface-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        mint: "rgb(var(--color-mint) / <alpha-value>)",
        amber: "rgb(var(--color-amber) / <alpha-value>)",
        coral: "rgb(var(--color-coral) / <alpha-value>)",
        steel: "rgb(var(--color-steel) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 18px 60px rgb(var(--shadow-soft) / 0.28)",
        panel: "0 24px 90px rgb(var(--shadow-soft) / 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
