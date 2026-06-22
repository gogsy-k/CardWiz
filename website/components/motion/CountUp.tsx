"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/** Counts 0→`to` once it scrolls into view. Geist + tabular-nums. Reduced-motion → final value. */
export default function CountUp({
  to,
  duration = 1,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, reduce, duration]);

  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-IN");
  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
