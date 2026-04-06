import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

type Variant = "fade-up" | "fade-left" | "fade-right" | "scale-up" | "fade-in";

const variantMap: Record<Variant, Variants> = {
  "fade-up": {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0 },
  },
  "scale-up": {
    hidden: { opacity: 0, scale: 0.93 },
    visible: { opacity: 1, scale: 1 },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0,
    },
  },
};

interface AnimatedSectionProps {
  children: ReactNode;
  variant?: Variant;
  /** Wrap children in a stagger container so each child animates in sequence */
  stagger?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
  /** HTML element to use */
  as?: "div" | "section" | "article" | "header" | "footer" | "li";
  once?: boolean;
  amount?: number;
}

export default function AnimatedSection({
  children,
  variant = "fade-up",
  stagger = false,
  delay = 0,
  duration = 0.55,
  className,
  as = "div",
  once = true,
  amount = 0.15,
}: AnimatedSectionProps) {
  const MotionTag = motion[as] as typeof motion.div;

  if (stagger) {
    return (
      <MotionTag
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        className={className}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      variants={variantMap[variant]}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1], delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

/** Wrap this around direct children of a stagger AnimatedSection */
export function AnimatedItem({
  children,
  variant = "fade-up",
  duration = 0.55,
  className,
  as = "div",
}: Omit<AnimatedSectionProps, "stagger" | "delay" | "once" | "amount">) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      variants={variantMap[variant]}
      transition={{ duration, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
