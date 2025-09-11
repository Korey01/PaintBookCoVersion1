import { PropsWithChildren } from "react";
import { motion } from "framer-motion";

export type PageTurnProps = PropsWithChildren<{
  /** Unique key, usually the current route path */
  routeKey: string;
}>;

export default function PageTurn({ routeKey, children }: PageTurnProps) {
  return (
    <motion.div
      key={routeKey}
      initial={{ opacity: 0.6, rotateY: -8, x: 24 }}
      animate={{ opacity: 1, rotateY: 0, x: 0 }}
      exit={{ opacity: 0, rotateY: 8, x: -24 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformStyle: "preserve-3d", transformOrigin: "100% 50%" }}
      className="relative"
    >
      {/* Subtle page edge highlight */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent" />
      {children}
    </motion.div>
  );
}
