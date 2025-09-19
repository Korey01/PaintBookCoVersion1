import { motion, useReducedMotion } from "framer-motion";

export default function LogoStroke() {
  const prefersReduced = useReducedMotion();
  const duration = prefersReduced ? 0 : 0.9;
  const delay = prefersReduced ? 0 : 0.05;

  return (
    <div className="relative mx-auto flex h-[46vh] w-full max-w-5xl items-center justify-center md:h-[60vh]">
      {/* Logo reveal */}
      <motion.img
        src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F03ce221d7cdc4cdba2d14b6eceffd308?format=webp&width=1600"
        alt="PaintBookco logo"
        className="max-h-full w-auto drop-shadow"
        initial={{ clipPath: prefersReduced ? "inset(0% 0% 0% 0%)" : "inset(0% 100% 0% 0%)", opacity: 1 }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
        transition={{ duration, ease: [0.4, 0, 0.2, 1], delay }}
        style={{ WebkitClipPath: prefersReduced ? undefined : "inset(0% 0% 0% 0%)" }}
      />

      {/* Brush stroke sweeper */}
      {!prefersReduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 h-32 w-40 -translate-y-1/2 rounded-md bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--secondary))] blur-md opacity-70 mix-blend-multiply"
          initial={{ x: "-15%", scaleX: 0.9, rotate: -2 }}
          animate={{ x: "115%", scaleX: 1.05, rotate: 1, opacity: 0 }}
          transition={{ duration: duration + 0.2, ease: [0.4, 0, 0.2, 1], delay: delay / 2 }}
        />
      )}
    </div>
  );
}
