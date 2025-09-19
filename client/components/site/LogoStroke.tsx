import { motion, useReducedMotion } from "framer-motion";

export default function LogoStroke() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative mx-auto flex h-screen w-full items-center justify-center">
      {/* Logo reveal (top-to-bottom pour) */}
      <motion.img
        src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F9f266fe2a29b4a5faea828004912cec3?format=webp&width=2200"
        alt="PaintBookco logo"
        className="max-h-full w-auto drop-shadow"
        initial={{ clipPath: prefersReduced ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)", opacity: 1 }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
        transition={{ duration: prefersReduced ? 0 : 1.6, ease: [0.25, 0.1, 0.25, 1], delay: prefersReduced ? 0 : 0.05 }}
        style={{ WebkitClipPath: prefersReduced ? undefined : "inset(0% 0% 0% 0%)" }}
      />

      {/* Paint pour overlay - 3 vertical lines with staggered speeds */}
      {!prefersReduced && <LinesPour />}
    </div>
  );
}

function LinesPour() {
  const lines = [
    { left: '35%', width: 72, duration: 1.35, delay: 0.05, radius: 56 },
    { left: '50%', width: 120, duration: 1.75, delay: 0.0, radius: 72 },
    { left: '65%', width: 92, duration: 1.55, delay: 0.1, radius: 60 },
  ] as const;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      {lines.map((l, i) => (
        <motion.div
          key={i}
          className="absolute top-[-35%] h-[170%] -translate-x-1/2 bg-[hsl(var(--primary))] saturate-150 contrast-125 shadow-xl"
          style={{ left: l.left as any, width: l.width, borderBottomLeftRadius: l.radius, borderBottomRightRadius: l.radius, filter: 'blur(0.4px)' }}
          initial={{ y: "-35%", opacity: 0.98, rotate: 0 }}
          animate={{ y: "115%", opacity: 0, x: [0, -3, 2, -1, 0], scaleX: [1, 0.99, 1.01, 0.99, 1], rotate: [0, -0.6, 0.5, -0.3, 0] }}
          transition={{ duration: l.duration, delay: l.delay, ease: [0.4, 0, 0.2, 1], times: [0, 0.2, 0.5, 0.8, 1] }}
        />
      ))}
    </div>
  );
}
