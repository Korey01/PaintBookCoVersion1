import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT:              "hsl(var(--sidebar-background))",
          foreground:           "hsl(var(--sidebar-foreground))",
          primary:              "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent:               "hsl(var(--sidebar-accent))",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground))",
          border:               "hsl(var(--sidebar-border))",
          ring:                 "hsl(var(--sidebar-ring))",
        },
        // Editorial brand tokens
        ink:    "hsl(var(--ink))",
        paper:  "hsl(var(--paper))",
        coral:  "hsl(var(--coral))",

        // Dashboard themes
        "dashboard-customer": {
          bg: "hsl(var(--dashboard-customer-bg))",
          card: "hsl(var(--dashboard-customer-card))",
          accent: "hsl(var(--dashboard-customer-accent))",
          "text-primary": "hsl(var(--dashboard-customer-text-primary))",
          "text-secondary": "hsl(var(--dashboard-customer-text-secondary))",
          success: "hsl(var(--dashboard-customer-success))",
          warning: "hsl(var(--dashboard-customer-warning))",
          danger: "hsl(var(--dashboard-customer-danger))",
        },
        "dashboard-painter": {
          bg: "hsl(var(--dashboard-painter-bg))",
          card: "hsl(var(--dashboard-painter-card))",
          accent: "hsl(var(--dashboard-painter-accent))",
          "text-primary": "hsl(var(--dashboard-painter-text-primary))",
          "text-secondary": "hsl(var(--dashboard-painter-text-secondary))",
          success: "hsl(var(--dashboard-painter-success))",
          warning: "hsl(var(--dashboard-painter-warning))",
          danger: "hsl(var(--dashboard-painter-danger))",
        },
      },
      fontFamily: {
        serif:   ['"DM Serif Display"', "Georgia", '"Times New Roman"', "serif"],
        sans:    ['"DM Sans"', "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ['"DM Serif Display"', "Georgia", "serif"],
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 1px)",
        sm:  "0px",
        xl:  "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1000": "1000ms",
      },
      transitionTimingFunction: {
        "editorial": "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      letterSpacing: {
        editorial: "-0.02em",
        widest2:   "0.15em",
      },
      lineHeight: {
        editorial: "1.05",
        "editorial-body": "1.7",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "editorial-up": {
          from: { opacity: "0", transform: "translateY(32px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "clip-reveal": {
          from: { clipPath: "inset(0 0 100% 0)", opacity: "0" },
          to:   { clipPath: "inset(0 0 0% 0)",   opacity: "1" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition:  "200% center" },
        },
        "scroll-bounce": {
          "0%, 100%": { transform: "translateY(0)",  opacity: "1" },
          "50%":       { transform: "translateY(6px)", opacity: "0.6" },
        },
        "underline-in": {
          from: { transform: "scaleX(0)" },
          to:   { transform: "scaleX(1)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "editorial-up":    "editorial-up 0.9s cubic-bezier(0.25,0.1,0.25,1) both",
        "clip-reveal":     "clip-reveal 0.9s cubic-bezier(0.25,0.1,0.25,1) both",
        "shimmer":         "shimmer 1.8s ease infinite",
        "scroll-bounce":   "scroll-bounce 1.8s ease-in-out infinite",
        "fade-in":         "fade-in 0.6s ease-out",
        "scale-in":        "scale-in 0.7s cubic-bezier(0.25,0.1,0.25,1) both",
      },
      boxShadow: {
        "editorial":      "0 2px 16px -4px rgba(0,0,0,0.08)",
        "editorial-lg":   "0 8px 40px -8px rgba(0,0,0,0.14)",
        "editorial-xl":   "0 16px 56px -12px rgba(0,0,0,0.18)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
