import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./types/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0b0f19",
        panel: "#112031",
        panel2: "#17283a",
        border: "#2d4057",
        accent: "#f3c969",
        "accent-soft": "#ffd98f",
        danger: "#f87171",
        success: "#34d399",
        warning: "#fbbf24"
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-heading)", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 24px 50px rgba(1, 8, 18, 0.34)",
        soft: "0 14px 34px rgba(2, 12, 27, 0.22)"
      }
    }
  },
  plugins: []
};

export default config;
