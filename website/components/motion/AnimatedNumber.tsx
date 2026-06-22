"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useSpring } from "motion/react";

/**
 * Spring-tracks a changing value so it smoothly rolls to the new target on every
 * change (slider drag, chip switch) — not a count-from-0. Reduced-motion → jumps.
 */
export default function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const spring = useSpring(value, { stiffness: 140, damping: 22 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    spring.set(value);
  }, [value, reduce, spring]);

  useMotionValueEvent(spring, "change", (v) => setDisplay(v));

  return <span className={`tabular-nums ${className ?? ""}`}>{format(reduce ? value : display)}</span>;
}
