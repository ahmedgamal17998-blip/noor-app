import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        masjid: {
          DEFAULT: "#0d7a3f",
          light: "#16a34a",
          dark: "#064e2a",
        },
        gold: {
          DEFAULT: "#c9a961",
          light: "#e6cb8a",
          dark: "#9a7e3f",
        },
        sand: {
          DEFAULT: "#fef9e7",
          dark: "#f5edc7",
        },
        kid: {
          yellow: "#fbbf24",
          pink: "#f472b6",
          sky: "#60a5fa",
          mint: "#86efac",
        },
        success: "#22c55e",
        wrong: "#ef4444",
      },
      fontFamily: {
        cairo: ["var(--font-cairo)", "system-ui", "sans-serif"],
        quran: ["var(--font-amiri-quran)", "serif"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(13, 122, 63, 0.08)",
        "soft-lg": "0 8px 30px rgba(13, 122, 63, 0.12)",
      },
      animation: {
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
