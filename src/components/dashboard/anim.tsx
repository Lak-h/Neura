"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/utils";

export { Reveal } from "@/components/marketing/Reveal";

/**
 * Number that counts up from 0 on mount with a cubic ease-out.
 * `compact` renders 87420 as "87.4k".
 */
export function CountUpValue({
  value,
  compact = false,
  durationMs = 1100,
}: {
  value: number;
  compact?: boolean;
  durationMs?: number;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (value === 0) { setCurrent(0); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrent(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return <>{compact ? formatNumber(current) : current.toLocaleString()}</>;
}

/**
 * Horizontal bar that draws itself (scaleX) when scrolled into view —
 * for leaderboards and usage meters.
 */
export function GrowBar({
  pct,
  delay = 0,
  className,
}: {
  pct: number; // 0–100
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={className ?? "h-2 overflow-hidden rounded-full"}
      style={{ background: "rgba(14,17,22,.07)" }}
    >
      <motion.div
        className="h-full origin-left rounded-full"
        style={{
          width: `${Math.max(0, Math.min(100, pct))}%`,
          background: "linear-gradient(90deg, var(--brand), var(--accent))",
        }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.9, delay, ease: [0.21, 0.65, 0.36, 1] }}
      />
    </div>
  );
}
