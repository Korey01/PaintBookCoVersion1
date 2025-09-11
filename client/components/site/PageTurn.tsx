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
      initial={{ opacity: 0.7, rotateY: -6, x: 16 }}
      animate={{ opacity: 1, rotateY: 0, x: 0 }}
      exit={{ opacity: 0, rotateY: 6, x: -16 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ transformStyle: "preserve-3d", transformOrigin: "100% 50%" }}
      className="relative"
    >
      {/* Subtle page edge highlight */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/5 to-transparent" />
      {children}
    </motion.div>
  );
}
