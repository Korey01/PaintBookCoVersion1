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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative"
    >
      {children}
    </motion.div>
  );
}
