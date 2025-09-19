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

      {/* Paint pour overlay */}
      {!prefersReduced && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden"
          initial={{}}
          animate={{}}
        >
          {/* Wide screen-filling pour */}
          <motion.div
            className="absolute left-0 top-[-30%] h-[150%] w-full rounded-b-[100px] bg-[hsl(var(--primary))] saturate-150 contrast-125 shadow-2xl"
            initial={{ y: "-30%", opacity: 0.98 }}
            animate={{ y: "110%", opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          />
          {/* Central stream */}
          <motion.div
            className="absolute left-1/2 top-[-20%] h-[150%] w-[160px] -translate-x-1/2 rounded-b-[70px] bg-[hsl(var(--primary))] saturate-150 contrast-125 shadow-xl"
            initial={{ y: "-20%", opacity: 0.98 }}
            animate={{ y: "110%", opacity: 0 }}
            transition={{ duration: 1.9, ease: [0.4, 0, 0.2, 1], delay: 0.05 }}
          />
          {/* Side streams */}
          <motion.div
            className="absolute left-[30%] top-[-25%] h-[150%] w-[110px] -translate-x-1/2 rounded-b-[50px] bg-[hsl(var(--primary))] opacity-90 saturate-150 contrast-125 blur-[0.5px]"
            initial={{ y: "-25%" }}
            animate={{ y: "112%", opacity: 0 }}
            transition={{ duration: 1.75, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          />
          <motion.div
            className="absolute left-[70%] top-[-25%] h-[150%] w-[90px] -translate-x-1/2 rounded-b-[44px] bg-[hsl(var(--primary))] opacity-85 saturate-150 contrast-125 blur-[0.5px]"
            initial={{ y: "-25%" }}
            animate={{ y: "112%", opacity: 0 }}
            transition={{ duration: 1.65, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
          />
        </motion.div>
      )}
    </div>
  );
}
