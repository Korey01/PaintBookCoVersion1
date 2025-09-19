import { motion, useReducedMotion } from "framer-motion";

export default function LogoStroke() {
  const prefersReduced = useReducedMotion();
  const duration = prefersReduced ? 0 : 0.9;
  const delay = prefersReduced ? 0 : 0.05;

  return (
    <div className="relative mx-auto flex h-screen w-full items-center justify-center">
      {/* Logo reveal (top-to-bottom pour) */}
      <motion.img
        src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F9f266fe2a29b4a5faea828004912cec3?format=webp&width=2200"
        alt="PaintBookco logo"
        className="max-h-full w-auto drop-shadow"
        initial={{ clipPath: prefersReduced ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)", opacity: 1 }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
        transition={{ duration: prefersReduced ? 0 : 1.8, ease: [0.25, 0.1, 0.25, 1], delay: prefersReduced ? 0 : 0.05 }}
        style={{ WebkitClipPath: prefersReduced ? undefined : "inset(0% 0% 0% 0%)" }}
      />

      {/* Paint pour overlay - fluid wave */}
      {!prefersReduced && (
        <FluidPour />
      )}
    </div>
  );
}

function FluidPour() {
  const d = (y: number, a: number) => `M0 0 H100 V${y} C 80 ${y - a} 60 ${y + a} 40 ${y - a} 20 ${y + a} 0 ${y} Z`;
  const d1 = d(-20, 8);
  const d2 = d(20, 6);
  const d3 = d(60, 10);
  const d4 = d(120, 8);
  return (
    <motion.svg aria-hidden className="pointer-events-none absolute inset-0 z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.path
        fill="hsl(var(--primary))"
        d={d1}
        initial={{ opacity: 0.96 }}
        animate={{ d: [d1, d2, d3, d4], opacity: [0.96, 0.9, 0.85, 0] }}
        transition={{ duration: 2.2, ease: [0.4, 0, 0.2, 1], times: [0, 0.45, 0.85, 1] }}
        style={{ filter: "blur(0.6px)" }}
      />
      <motion.path
        fill="hsl(var(--primary))"
        opacity={0.6}
        d={d(-10, 5)}
        animate={{ d: [d(-10, 5), d(18, 4), d(55, 7), d(118, 5)], opacity: [0.6, 0.55, 0.5, 0] }}
        transition={{ duration: 2.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ filter: "blur(1px)" }}
      />
      <motion.circle cx={30} cy={-5} r={2.8} fill="hsl(var(--primary))" initial={{ y: -10, opacity: 0.95 }} animate={{ y: 120, opacity: [0.95, 0.9, 0] }} transition={{ duration: 1.9, delay: 0.15, ease: [0.4, 0, 0.2, 1] }} />
      <motion.circle cx={70} cy={-8} r={2.2} fill="hsl(var(--primary))" initial={{ y: -12, opacity: 0.9 }} animate={{ y: 120, opacity: [0.9, 0.85, 0] }} transition={{ duration: 2.0, delay: 0.1, ease: [0.4, 0, 0.2, 1] }} />
    </motion.svg>
  );
}
