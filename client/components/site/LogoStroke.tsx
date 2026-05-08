import { motion, useReducedMotion } from "framer-motion";

export default function LogoStroke() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative mx-auto flex h-[60vh] w-full items-center justify-center">
      <div className="pointer-events-none absolute left-0 right-0 top-0 h-[60vh] bg-gradient-to-br from-black/10 to-white/20 mix-blend-overlay" />
      <motion.img
        src="https://paintbookco-uploads.s3.eu-west-2.amazonaws.com/paintbookco-logo.png"
        alt="PaintBookco logo"
        className="relative z-10 max-h-[70vh] w-auto -translate-y-36"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ filter: "drop-shadow(1px 1px 0 rgba(0,0,0,0.25)) drop-shadow(-1px -1px 0 rgba(255,255,255,0.65))" }}
      />
    </div>
  );
}
