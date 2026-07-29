import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          coral: "#FF3A56",
          "coral-hover": "#E02E47",
          "coral-light": "rgba(255, 58, 86, 0.15)",
          dark: "#0B0E14",
          "dark-card": "#161B26",
          light: "#F8FAFC",
          "light-card": "#FFFFFF",
          emerald: "#10B981",
        },
      },
      backgroundImage: {
        "radial-spotlight":
          "radial-gradient(circle, rgba(255,58,86,0.25) 0%, rgba(11,14,20,0) 70%)",
        "radial-spotlight-light":
          "radial-gradient(circle, rgba(255,58,86,0.18) 0%, rgba(248,250,252,0) 70%)",
      },
      boxShadow: {
        "glow-coral": "0 0 25px rgba(255, 58, 86, 0.35)",
        "glow-coral-lg": "0 0 45px rgba(255, 58, 86, 0.45)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
