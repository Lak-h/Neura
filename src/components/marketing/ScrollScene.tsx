"use client";

import { useRef } from "react";
import {
  motion, useScroll, useSpring, useTransform, type MotionValue,
} from "framer-motion";

/**
 * The Apple-style centrepiece: a 340vh section whose inner viewport pins to
 * the screen while scroll position scrubs the animation. Three phases:
 *
 *   01 SIGNALS   — source chips fade in, wires draw toward the centre
 *   02 REASONING — the core assembles: halo, rings, gem, guardrail labels
 *   03 ACTION    — wires draw outward, action chips snap in, pulses flow
 *
 * Everything is transform/opacity/pathLength on scrubbed motion values —
 * no filters, no layout work. Animations run unconditionally so the SSR
 * and client trees always match (no reduced-motion branching).
 */

const INK = "#0e1116";
const BLUE = "#2742ff";
const ORANGE = "#ff5c1a";

const SOURCES = [
  { y: 150, label: "webhook received" },
  { y: 350, label: "new email" },
  { y: 550, label: "cron schedule" },
];
const ACTIONS = [
  { y: 150, label: "update CRM" },
  { y: 350, label: "reply in Slack" },
  { y: 550, label: "send invoice" },
];

const IN_PATHS = SOURCES.map((s) => `M 232 ${s.y} C 380 ${s.y}, 440 350, 540 350`);
const OUT_PATHS = ACTIONS.map((a) => `M 660 350 C 760 350, 820 ${a.y}, 968 ${a.y}`);

const COPY = [
  { k: "01", title: "Every signal, captured.", sub: "Webhooks, inboxes, schedules — anything that happens in your business becomes an event on the wire." },
  { k: "02", title: "One core does the thinking.", sub: "Your policies, your knowledge, your guardrails — reasoning happens in a core your company owns." },
  { k: "03", title: "Decisions become work.", sub: "CRM updated, customer answered, invoice sent. Not suggestions — finished actions, on the record." },
];

/** Copy block that crossfades in/out across a progress window. */
function Phase({
  p, range, k, title, sub,
}: {
  p: MotionValue<number>;
  range: [number, number, number, number];
  k: string; title: string; sub: string;
}) {
  const opacity = useTransform(p, range, [0, 1, 1, 0]);
  const y = useTransform(p, range, [18, 0, 0, -18]);
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center text-center" style={{ opacity, y }}>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[.3em]" style={{ color: BLUE }}>
        {k} <span style={{ color: "var(--faint)" }}>/ 03</span>
      </p>
      <h3 className="text-2xl font-semibold tracking-tight sm:text-[2rem]" style={{ color: "var(--foreground)" }}>
        {title}
      </h3>
      <p className="mt-2 max-w-md text-[14.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
        {sub}
      </p>
    </motion.div>
  );
}

function RailTick({ p, at, label }: { p: MotionValue<number>; at: [number, number]; label: string }) {
  const color = useTransform(p, (v) => (v >= at[0] && v < at[1] ? BLUE : "var(--faint)"));
  return <motion.span style={{ color }}>{label}</motion.span>;
}

export function ScrollScene() {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  // ── Phase 1: sources + inbound wires ──
  const chipIn0 = useTransform(p, [0.04, 0.11], [0, 1]);
  const chipIn1 = useTransform(p, [0.07, 0.14], [0, 1]);
  const chipIn2 = useTransform(p, [0.10, 0.17], [0, 1]);
  const chipIn = [chipIn0, chipIn1, chipIn2];
  const inDraw = useTransform(p, [0.08, 0.34], [0, 1]);

  // ── Phase 2: core assembly ──
  const coreScale = useTransform(p, [0.30, 0.46], [0.6, 1]);
  const coreOpacity = useTransform(p, [0.30, 0.42], [0, 1]);
  const ringRotate = useTransform(p, [0.3, 1], [0, 150]);
  const subLabels = useTransform(p, [0.46, 0.54], [0, 1]);

  // ── Phase 3: outbound wires + actions + live pulses ──
  const outDraw = useTransform(p, [0.52, 0.76], [0, 1]);
  const chipOut0 = useTransform(p, [0.66, 0.74], [0, 1]);
  const chipOut1 = useTransform(p, [0.70, 0.78], [0, 1]);
  const chipOut2 = useTransform(p, [0.74, 0.82], [0, 1]);
  const chipOut = [chipOut0, chipOut1, chipOut2];
  const pulses = useTransform(p, [0.82, 0.92], [0, 1]);

  // Progress rail
  const railFill = useTransform(p, [0, 1], [0, 1]);

  const mono = "var(--font-geist-mono), monospace";

  return (
    <section id="system" ref={ref} className="relative scroll-mt-0" style={{ height: "340vh" }}>
      {/* Pinned viewport */}
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6">

        {/* Copy phases */}
        <div className="relative mb-6 h-36 w-full max-w-2xl sm:h-32">
          <Phase p={p} range={[0.02, 0.08, 0.24, 0.30]} {...COPY[0]} />
          <Phase p={p} range={[0.32, 0.38, 0.54, 0.60]} {...COPY[1]} />
          <Phase p={p} range={[0.62, 0.68, 0.92, 0.985]} {...COPY[2]} />
        </div>

        {/* The scene */}
        <div className="w-full max-w-5xl">
          <svg viewBox="0 0 1200 700" fill="none" className="mx-auto w-full" style={{ maxHeight: "62vh" }} role="img"
            aria-label="Diagram: business signals flow into the Neuraxis reasoning core, which executes finished actions">
            <defs>
              <linearGradient id="ss-in" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={BLUE} stopOpacity=".2" />
                <stop offset="1" stopColor={BLUE} />
              </linearGradient>
              <linearGradient id="ss-out" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={ORANGE} />
                <stop offset="1" stopColor={ORANGE} stopOpacity=".25" />
              </linearGradient>
              <linearGradient id="ss-gem" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={BLUE} />
                <stop offset="1" stopColor="#1f36d8" />
              </linearGradient>
              <radialGradient id="ss-halo">
                <stop offset="0" stopColor={BLUE} stopOpacity=".14" />
                <stop offset="1" stopColor={BLUE} stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Inbound wires */}
            {IN_PATHS.map((d, i) => (
              <g key={`in-${i}`}>
                <path d={d} stroke="rgba(14,17,22,.10)" strokeWidth="1.2" />
                <motion.path d={d} stroke="url(#ss-in)" strokeWidth="2" style={{ pathLength: inDraw }} />
              </g>
            ))}

            {/* Outbound wires */}
            {OUT_PATHS.map((d, i) => (
              <g key={`out-${i}`}>
                <path d={d} stroke="rgba(14,17,22,.10)" strokeWidth="1.2" />
                <motion.path d={d} stroke="url(#ss-out)" strokeWidth="2" style={{ pathLength: outDraw }} />
              </g>
            ))}

            {/* Live pulses, gated by the final phase */}
            <motion.g style={{ opacity: pulses }}>
              {IN_PATHS.map((d, i) => (
                <g key={`pi-${i}`} className="nrx-pulse"
                  style={{ ["--nrx-path" as string]: `path('${d}')`, animationDelay: `${i * 0.9}s` }}>
                  <circle r="3" fill={BLUE} />
                </g>
              ))}
              {OUT_PATHS.map((d, i) => (
                <g key={`po-${i}`} className="nrx-pulse"
                  style={{ ["--nrx-path" as string]: `path('${d}')`, animationDelay: `${0.5 + i * 0.9}s` }}>
                  <circle r="3" fill={ORANGE} />
                </g>
              ))}
            </motion.g>

            {/* Source chips */}
            {SOURCES.map((s, i) => (
              <motion.g key={s.label} style={{ opacity: chipIn[i] }}>
                <rect x="32" y={s.y - 24} width="200" height="48" rx="10" fill="#ffffff" stroke="rgba(14,17,22,.16)" strokeWidth="1" />
                <circle cx="54" cy={s.y} r="3" fill={BLUE} />
                <text x="70" y={s.y + 4.5} fontSize="13" fontFamily={mono} fill={INK}>{s.label}</text>
              </motion.g>
            ))}

            {/* Action chips */}
            {ACTIONS.map((a, i) => (
              <motion.g key={a.label} style={{ opacity: chipOut[i] }}>
                <rect x="968" y={a.y - 24} width="200" height="48" rx="10" fill="#ffffff" stroke="rgba(14,17,22,.16)" strokeWidth="1" />
                <circle cx="1146" cy={a.y} r="3" fill={ORANGE} />
                <text x="1130" y={a.y + 4.5} textAnchor="end" fontSize="13" fontFamily={mono} fill={INK}>{a.label}</text>
              </motion.g>
            ))}

            {/* ── The core ── */}
            <motion.g style={{ scale: coreScale, opacity: coreOpacity, transformOrigin: "600px 350px" }}>
              <circle cx="600" cy="350" r="150" fill="url(#ss-halo)" />
              <motion.g style={{ rotate: ringRotate, transformOrigin: "600px 350px" }}>
                <circle cx="600" cy="350" r="86" stroke={BLUE} strokeOpacity=".3" strokeWidth="1" strokeDasharray="5 11" fill="none" />
              </motion.g>
              <circle cx="600" cy="350" r="64" stroke="rgba(14,17,22,.14)" strokeWidth="1" fill="#ffffff" />
              <rect x="566" y="316" width="68" height="68" rx="18" fill="url(#ss-gem)" />
              <text x="600" y="361" textAnchor="middle" fontSize="30" fontWeight="800" fill="#fff" fontFamily="var(--font-geist-sans), sans-serif">N</text>
              {/* Ports */}
              <circle cx="540" cy="350" r="4" fill="#ffffff" stroke={BLUE} strokeWidth="1.4" />
              <circle cx="660" cy="350" r="4" fill="#ffffff" stroke={ORANGE} strokeWidth="1.4" />
            </motion.g>

            {/* Guardrail labels */}
            <motion.text x="600" y="478" textAnchor="middle" fontSize="12" fontFamily={mono} fill="var(--faint)" style={{ opacity: subLabels }}>
              policy · memory · tools · guardrails
            </motion.text>
          </svg>
        </div>

        {/* Progress rail */}
        <div aria-hidden className="absolute right-6 top-1/2 hidden -translate-y-1/2 items-center gap-3 md:flex">
          <div className="relative h-40 w-px overflow-hidden" style={{ background: "rgba(14,17,22,.12)" }}>
            <motion.div
              className="absolute left-0 top-0 w-full origin-top"
              style={{ height: "100%", scaleY: railFill, background: `linear-gradient(180deg, ${BLUE}, ${ORANGE})` }}
            />
          </div>
          <div className="flex h-40 flex-col justify-between font-mono text-[9.5px] uppercase tracking-[.2em]" style={{ color: "var(--faint)" }}>
            <RailTick p={p} at={[0.0, 0.32]} label="signals" />
            <RailTick p={p} at={[0.32, 0.6]} label="reasoning" />
            <RailTick p={p} at={[0.6, 1.01]} label="action" />
          </div>
        </div>
      </div>
    </section>
  );
}
