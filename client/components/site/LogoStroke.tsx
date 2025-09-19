import { motion, useReducedMotion } from "framer-motion";

export default function LogoStroke() {
  const prefersReduced = useReducedMotion();
  const duration = prefersReduced ? 0 : 0.9;
  const delay = prefersReduced ? 0 : 0.05;

  return (
    <div className="relative mx-auto flex h-[80vh] w-full max-w-6xl items-center justify-center md:h-[90vh]">
      {/* Logo reveal (top-to-bottom pour) */}
      <motion.img
        src="https://cdn.builder.io/api/v1/image/assets%2F4d3ba4dca12d422aaa4ee4ceafe37a1f%2F9f266fe2a29b4a5faea828004912cec3?format=webp&width=2200"
        alt="PaintBookco logo"
        className="max-h-full w-auto drop-shadow"
        initial={{ clipPath: prefersReduced ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)", opacity: 1 }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
        transition={{ duration: prefersReduced ? 0 : 1.2, ease: [0.25, 0.1, 0.25, 1], delay: prefersReduced ? 0 : 0.05 }}
        style={{ WebkitClipPath: prefersReduced ? undefined : "inset(0% 0% 0% 0%)" }}
      />

      {/* Paint pour overlay */}
      {!prefersReduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden"
          initial={{}}
          animate={{}}
        >
          <motion.div
            className="absolute left-1/2 top-[-20%] h-[140%] w-[120px] -translate-x-1/2 rounded-b-[60px] bg-[hsl(var(--primary))] shadow-2xl"
            initial={{ y: "-20%", opacity: 0.95 }}
            animate={{ y: "105%", opacity: 0 }}
            transition={{ duration: 1.25, ease: [0.4, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute left-[30%] top-[-25%] h-[140%] w-[80px] -translate-x-1/2 rounded-b-[40px] bg-[hsl(var(--primary))] opacity-80 blur-[1px]"
            initial={{ y: "-25%" }}
            animate={{ y: "110%", opacity: 0 }}
            transition={{ duration: 1.15, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          />
          <motion.div
            className="absolute left-[70%] top-[-25%] h-[140%] w-[60px] -translate-x-1/2 rounded-b-[36px] bg-[hsl(var(--primary))] opacity-70 blur-[1px]"
            initial={{ y: "-25%" }}
            animate={{ y: "110%", opacity: 0 }}
            transition={{ duration: 1.05, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
          />
        </motion.div>
      )}
    </div>
  );
}
