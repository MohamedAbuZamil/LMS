import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-tajawal)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        brand: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
          800: "#5B21B6",
          900: "#4C1D95",
        },
        ink: {
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
        },
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(124, 58, 237, 0.25)",
        card: "0 8px 24px -8px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(60% 60% at 50% 0%, #EDE9FE 0%, #F8FAFC 60%, #FFFFFF 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
