import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Extended brand palette
        paint: {
          coral: "hsl(var(--paint-coral))",
          teal: "hsl(var(--paint-teal))",
          lime: "hsl(var(--paint-lime))",
          gold: "hsl(var(--paint-gold))",
          indigo: "hsl(var(--paint-indigo))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "Inter", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "paint-drip": {
          "0%":   { transform: "scaleY(0) translateY(-50%)", opacity: "0", transformOrigin: "top" },
          "60%":  { transform: "scaleY(1.08) translateY(4px)", opacity: "1", transformOrigin: "top" },
          "100%": { transform: "scaleY(1) translateY(0)", opacity: "1", transformOrigin: "top" },
        },
        "brush-reveal": {
          from: { clipPath: "inset(0 100% 0 0)" },
          to:   { clipPath: "inset(0 0% 0 0)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.4)" },
          "50%":       { boxShadow: "0 0 0 12px hsl(var(--primary) / 0)" },
        },
        "float-bob": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "33%":       { transform: "translateY(-16px) rotate(3deg)" },
          "66%":       { transform: "translateY(-8px) rotate(-2deg)" },
        },
        "float-bob-reverse": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "33%":       { transform: "translateY(14px) rotate(-3deg)" },
          "66%":       { transform: "translateY(7px) rotate(2deg)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        "paint-splash": {
          "0%":   { transform: "scale(0) rotate(-20deg)", opacity: "0" },
          "70%":  { transform: "scale(1.1) rotate(5deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "color-wash": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":       { backgroundPosition: "100% 50%" },
        },
        "count-fade": {
          from: { opacity: "0", transform: "translateY(12px) scale(0.9)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "accordion-down":    "accordion-down 0.2s ease-out",
        "accordion-up":      "accordion-up 0.2s ease-out",
        "paint-drip":        "paint-drip 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "brush-reveal":      "brush-reveal 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
        "shimmer":           "shimmer 2s linear infinite",
        "glow-pulse":        "glow-pulse 2.4s ease-in-out infinite",
        "float-bob":         "float-bob 6s ease-in-out infinite",
        "float-bob-reverse": "float-bob-reverse 7s ease-in-out infinite",
        "spin-slow":         "spin-slow 20s linear infinite",
        "paint-splash":      "paint-splash 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "color-wash":        "color-wash 6s ease infinite",
        "count-fade":        "count-fade 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backgroundSize: {
        "200": "200% 200%",
      },
      boxShadow: {
        "glow-primary": "0 0 0 4px hsl(var(--primary) / 0.25), 0 8px 24px -4px hsl(var(--primary) / 0.35)",
        "glow-secondary": "0 0 0 4px hsl(var(--secondary) / 0.2), 0 8px 24px -4px hsl(var(--secondary) / 0.3)",
        "glow-accent": "0 0 0 4px hsl(var(--accent) / 0.2), 0 8px 24px -4px hsl(var(--accent) / 0.3)",
        "card-hover": "0 20px 40px -12px hsl(var(--primary) / 0.16), 0 8px 16px -4px hsl(var(--foreground) / 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
