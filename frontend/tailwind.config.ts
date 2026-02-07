import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "cb-bg": "#131722",
        "cb-panel": "#1e222d",
        "cb-border": "#2a2e39",
        "cb-text": "#d1d4dc",
        "cb-muted": "#787b86",
        "cb-accent": "#2962ff",
        "cb-green": "#26a69a",
        "cb-red": "#ef5350",
      },
    },
  },
  plugins: [],
};

export default config;
