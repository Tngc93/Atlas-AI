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
        ink: "#172026",
        paper: "#f7f8f3",
        mint: "#2f8f83",
        amber: "#d2872f",
        coral: "#c95f4f",
        steel: "#4b6b82",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 32, 38, 0.10)",
      },
    },
  },
  plugins: [],
};

export default config;
