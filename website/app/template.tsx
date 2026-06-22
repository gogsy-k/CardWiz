"use client";

import { MotionConfig, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Wraps every page. template.tsx remounts on navigation, so the entrance fade
 * replays per route change. MotionConfig reducedMotion="user" makes ALL motion
 * (layout / whileInView / springs) respect the OS reduced-motion setting.
 */
export default function Template({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
