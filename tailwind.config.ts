import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — map to CSS custom properties
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        sidebar: {
          bg: "rgb(var(--sidebar-bg) / <alpha-value>)",
          border: "rgb(var(--sidebar-border) / <alpha-value>)",
        },
        // Fixed brand scale (not variable)
        brand: {
          "50": "#f0fdf4",
          "100": "#dcfce7",
          "200": "#bbf7d0",
          "300": "#86efac",
          "400": "#4ade80",
          "500": "#22c55e",
          "600": "#16a34a",
          "700": "#15803d",
          "800": "#166534",
          "900": "#14532d",
          "950": "#052e16",
        },
      },
      fontFamily: {
        serif: ["Instrument Serif", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":
          "radial-gradient(ellipse at top right, rgba(74,222,128,0.12) 0%, transparent 60%), radial-gradient(ellipse at bottom left, rgba(52,211,153,0.06) 0%, transparent 50%)",
        "card-glow":
          "linear-gradient(135deg, rgba(74,222,128,0.05) 0%, rgba(52,211,153,0.02) 100%)",
        "mesh-gradient":
          "radial-gradient(at 40% 20%, rgba(74,222,128,0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(52,211,153,0.06) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(74,222,128,0.04) 0px, transparent 50%)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-in-right":
          "slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-very-slow": "spin 30s linear infinite",
        "orbit": "orbit 20s linear infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(24px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-16px)" },
        },
        orbit: {
          "0%": {
            transform: "rotate(0deg) translateX(160px) rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg) translateX(160px) rotate(-360deg)",
          },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(74,222,128,0.1)" },
          "50%": { boxShadow: "0 0 40px rgba(74,222,128,0.25)" },
        },
      },
      boxShadow: {
        "green-sm": "0 0 15px rgba(74,222,128,0.1)",
        "green-md": "0 0 30px rgba(74,222,128,0.15)",
        "green-lg": "0 0 60px rgba(74,222,128,0.2)",
        "card-dark":
          "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02)",
        "card-hover":
          "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(74,222,128,0.1)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
