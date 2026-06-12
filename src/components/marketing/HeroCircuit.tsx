"use client";

import { motion } from "framer-motion";

/**
 * The hero's signature: ink circuit traces converging from both edges into a
 * central spine that exits the bottom of the hero — visually handing off to
 * the SectionConnector below it. Traces draw themselves on mount; electric
 * beams then travel them forever.
 *
 * Note: animations run unconditionally (no prefers-reduced-motion gating) —
 * a deliberate product call so the SSR and client trees always match.
 */

// Orthogonal circuit runs with 45° bends, all terminating on the central
// spine at x=720. Right side hand-mirrors the left around the centre line.
const LEFT_TRACES = [
  "M -40 96  H 380 L 470 186 H 720",
  "M -40 250 H 300 L 380 330 H 720",
  "M -40 480 H 420 L 510 390 H 720",
  "M 160 -40 V 60 L 240 140 H 470 L 520 190",
];

const RIGHT_TRACES = [
  "M 1480 96  H 1060 L 970 186 H 720",
  "M 1480 250 H 1140 L 1060 330 H 720",
  "M 1480 480 H 1020 L 930 390 H 720",
  "M 1280 -40 V 60 L 1200 140 H 970 L 920 190",
];

const ALL_TRACES = [...LEFT_TRACES, ...RIGHT_TRACES];

// Junction nodes where traces meet the spine.
const NODES: Array<[number, number]> = [
  [720, 96], [720, 186], [720, 250], [720, 330], [720, 390], [720, 480],
];

export function HeroCircuit() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 640"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <defs>
        <linearGradient id="trace-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2742ff" stopOpacity="0" />
          <stop offset="0.55" stopColor="#2742ff" />
          <stop offset="1" stopColor="#ff5c1a" />
        </linearGradient>
        <linearGradient id="spine-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2742ff" />
          <stop offset="1" stopColor="#ff5c1a" />
        </linearGradient>
        <radialGradient id="node-halo">
          <stop offset="0" stopColor="#2742ff" stopOpacity=".30" />
          <stop offset="1" stopColor="#2742ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base traces — faint ink, always visible */}
      {ALL_TRACES.map((d, i) => (
        <path key={`base-${i}`} d={d} stroke="rgba(14,17,22,.13)" strokeWidth="1" />
      ))}

      {/* Draw-in traces */}
      {ALL_TRACES.map((d, i) => (
        <motion.path
          key={`draw-${i}`}
          d={d}
          stroke="rgba(39,66,255,.35)"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.1, delay: 0.15 + i * 0.08, ease: "easeInOut" }}
        />
      ))}

      {/* Travelling beams — one short bright dash looping along each trace */}
      {ALL_TRACES.map((d, i) => (
        <path
          key={`beam-${i}`}
          d={d}
          className="nrx-beam"
          pathLength={100}
          stroke="url(#trace-grad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="10 90"
          style={{ animationDelay: `${1.4 + i * 0.7}s`, animationDuration: `${5 + (i % 3)}s` }}
        />
      ))}

      {/* Central spine — exits the hero bottom, picked up by the connector below */}
      <motion.path
        d="M 720 60 V 700"
        stroke="url(#spine-grad)"
        strokeWidth="1.5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, delay: 0.1, ease: "easeInOut" }}
      />
      <path
        d="M 720 60 V 700"
        className="nrx-beam"
        pathLength={100}
        stroke="#ff5c1a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 94"
        style={{ animationDelay: "2s", animationDuration: "4s" }}
      />

      {/* Junction nodes */}
      {NODES.map(([cx, cy], i) => (
        <motion.g
          key={`node-${i}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 + i * 0.1, ease: "backOut" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r="9" fill="url(#node-halo)" />
          <circle cx={cx} cy={cy} r="3" fill="#ffffff" stroke="#2742ff" strokeWidth="1.3" />
        </motion.g>
      ))}
    </svg>
  );
}
