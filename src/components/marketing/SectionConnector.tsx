"use client";

import { motion } from "framer-motion";

/**
 * Carries "the wire" between page sections: a centred vertical trace that
 * draws itself as it scrolls into view, with a perpetual orange spark once
 * drawn. `label` renders a mono waypoint tag beside the node.
 */
export function SectionConnector({
  height = 140,
  label,
}: {
  height?: number;
  label?: string;
}) {
  const mid = height / 2;

  return (
    <div aria-hidden className="relative mx-auto w-full" style={{ height }}>
      <svg
        className="pointer-events-none absolute left-1/2 top-0 h-full -translate-x-1/2"
        width="120"
        height={height}
        viewBox={`0 0 120 ${height}`}
        fill="none"
      >
        <motion.path
          d={`M 60 0 V ${height}`}
          stroke="rgba(39,66,255,.45)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
        <path
          d={`M 60 0 V ${height}`}
          className="nrx-beam"
          pathLength={100}
          stroke="#ff5c1a"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="10 90"
          style={{ animationDuration: "3.6s" }}
        />
        {/* Waypoint node */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "backOut" }}
          style={{ transformOrigin: `60px ${mid}px` }}
        >
          <circle cx="60" cy={mid} r="4.5" fill="#ffffff" stroke="#2742ff" strokeWidth="1.4" />
          <circle cx="60" cy={mid} r="1.6" fill="#2742ff" />
        </motion.g>
      </svg>

      {label && (
        <motion.span
          className="absolute top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase tracking-[.22em]"
          style={{ left: "calc(50% + 28px)", color: "var(--faint)" }}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  );
}
