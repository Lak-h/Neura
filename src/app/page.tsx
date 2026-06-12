import Link from "next/link";
import {
  Bot, Workflow, BookOpen, Inbox, BarChart3, ShieldCheck, ArrowRight, Check,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/shared/Logo";
import { PLANS, type PlanId } from "@/lib/constants/plans";
import { formatCurrency } from "@/lib/utils";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroCircuit } from "@/components/marketing/HeroCircuit";
import { SectionConnector } from "@/components/marketing/SectionConnector";
import { ScrollScene } from "@/components/marketing/ScrollScene";
import { Reveal } from "@/components/marketing/Reveal";
import { Corners } from "@/components/marketing/Corners";

const MODULES = [
  { icon: Bot, tag: "agents", title: "AI Agents", desc: "AI workers with a job description. Pick the model, set the rules, test in the playground, deploy to chat, Slack, or email." },
  { icon: Workflow, tag: "workflows", title: "Workflows", desc: "Automation with AI steps native — classify, summarise, extract, branch, and act on every event in your business." },
  { icon: BookOpen, tag: "knowledge", title: "Knowledge", desc: "One source of truth your agents actually read. Answers stay grounded in your documents, not the model's imagination." },
  { icon: Inbox, tag: "inbox", title: "Shared AI Inbox", desc: "Every customer conversation in one queue. AI answers first; humans step in the moment confidence drops." },
  { icon: BarChart3, tag: "analytics", title: "Intelligence", desc: "Volume, latency, satisfaction, credit burn — live, per agent, per workflow. Know where automation pays off." },
  { icon: ShieldCheck, tag: "security", title: "Trust Layer", desc: "RBAC, a full audit trail, an encrypted secrets vault, and metered usage — built into the core, not bolted on." },
];

const TESTIMONIALS = [
  { quote: "We replaced four point tools and our first-response time dropped 83%. The agents actually know our product.", name: "Sarah Okafor", role: "VP Operations, Meridian Freight" },
  { quote: "Confidence-threshold escalation is the feature nobody else has. Our AI never confidently lies to a customer.", name: "James Liu", role: "Head of CX, BluePeak Health" },
  { quote: "Lead routing alone saves us 30 hours a week. The Scale plan paid for itself in the first month.", name: "Ana Reyes", role: "CRO, SwiftShip Logistics" },
];

export default async function LandingPage() {
  const session = await auth();
  const authed = Boolean(session?.user);
  const ctaHref = authed ? "/overview" : "/register";

  return (
    <div className="relative overflow-x-clip">
      <MarketingNav authed={authed} />

      <main>
        {/* ─────────────── HERO ─────────────── */}
        <section className="relative">
          {/* Graph paper, faded at the edges */}
          <div
            aria-hidden
            className="grid-paper pointer-events-none absolute inset-0"
            style={{
              maskImage: "radial-gradient(ellipse 75% 80% at 50% 38%, #000 30%, transparent 74%)",
              WebkitMaskImage: "radial-gradient(ellipse 75% 80% at 50% 38%, #000 30%, transparent 74%)",
            }}
          />
          <HeroCircuit />

          <div className="relative z-10 mx-auto flex min-h-[84vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[.3em]" style={{ color: "var(--brand)" }}>
              Neuraxis <span style={{ color: "var(--faint)" }}>//</span> AI operations platform
            </p>

            <h1
              className="font-bold leading-[1.01] tracking-[-0.035em]"
              style={{ fontSize: "clamp(2.9rem, 7vw, 5.6rem)" }}
            >
              Wire your business
              <br />
              into{" "}
              <span
                style={{
                  backgroundImage: "linear-gradient(95deg, #2742ff 0%, #1f36d8 55%, #ff5c1a 130%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                one intelligent system
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Agents that work. Workflows that run themselves. Knowledge that answers.
              The AI Operating System for modern businesses — owned entirely by yours.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href={ctaHref} className="btn-primary px-7 py-3 text-[15px]">
                {authed ? "Open dashboard" : "Start free trial"} <ArrowRight size={16} aria-hidden />
              </Link>
              <a href="#system" className="btn-secondary px-7 py-3 text-[15px]">Watch it think</a>
            </div>

            <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[.18em]" style={{ color: "var(--faint)" }}>
              No credit card · 14-day trial · cancel anytime
            </p>
          </div>
        </section>

        <SectionConnector label="01 / the system" />

        {/* ─────────────── PINNED SCROLL SCENE ─────────────── */}
        <ScrollScene />

        {/* Proof stats directly after the story */}
        <section className="mx-auto max-w-3xl px-6 pb-8">
          <Reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-xl sm:grid-cols-3" delay={0.05}>
            {[
              { k: "−83%", v: "first-response time" },
              { k: "30 hrs", v: "saved weekly on routing" },
              { k: "0", v: "confident hallucinations shipped" },
            ].map((s) => (
              <div key={s.v} className="flex flex-col items-center gap-1 px-6 py-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <span className="font-mono text-2xl font-bold" style={{ color: "var(--brand)" }}>{s.k}</span>
                <span className="text-center text-[12px]" style={{ color: "var(--faint)" }}>{s.v}</span>
              </div>
            ))}
          </Reveal>
        </section>

        <SectionConnector label="02 / modules" />

        {/* ─────────────── MODULES ─────────────── */}
        <section id="modules" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16">
          <Reveal className="mb-12 max-w-xl">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[.3em]" style={{ color: "var(--brand)" }}>Modules</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">One brain. Six lobes.</h2>
            <p className="mt-4 text-[15.5px] leading-relaxed" style={{ color: "var(--muted)" }}>
              Every module shares context, credits, and a single audit trail — because a
              brain that can&apos;t talk to itself is just a pile of tools.
            </p>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map(({ icon: Icon, tag, title, desc }, i) => (
              <Reveal key={tag} delay={i * 0.07}>
                <div className="card group relative h-full p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(39,66,255,.45)] hover:shadow-[0_8px_30px_rgba(39,66,255,.10)]">
                  <Corners />
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ background: "rgba(39,66,255,.08)", color: "var(--brand)" }}
                      aria-hidden
                    >
                      <Icon size={18} />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[.2em]" style={{ color: "var(--faint)" }}>
                      /{tag}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-semibold">{title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--muted)" }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <SectionConnector label="03 / pricing" />

        {/* ─────────────── PRICING ─────────────── */}
        <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16">
          <Reveal className="mb-12 text-center">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[.3em]" style={{ color: "var(--brand)" }}>Pricing</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Pay for seats, agents, and credits.</h2>
            <p className="mx-auto mt-4 max-w-md text-[15.5px]" style={{ color: "var(--muted)" }}>
              Every plan includes the full platform — nothing is paywalled behind &ldquo;contact us&rdquo; except scale itself.
            </p>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {(Object.keys(PLANS) as PlanId[]).map((id, i) => {
              const plan = PLANS[id];
              return (
                <Reveal key={id} delay={i * 0.08}>
                  <div
                    className="card relative flex h-full flex-col p-6"
                    style={plan.highlighted ? { borderColor: "rgba(39,66,255,.45)", boxShadow: "0 12px 44px rgba(39,66,255,.12)" } : undefined}
                  >
                    <Corners />
                    {plan.highlighted && (
                      <span
                        className="absolute -top-2.5 left-6 rounded-full px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[.18em] text-white"
                        style={{ background: "linear-gradient(135deg, #2742ff, #1f36d8)" }}
                      >
                        most popular
                      </span>
                    )}
                    <p className="font-mono text-[11px] uppercase tracking-[.2em]" style={{ color: "var(--faint)" }}>{plan.name}</p>
                    <p className="mt-3 text-3xl font-bold tracking-tight">
                      {plan.priceMonthly === null ? "Custom" : formatCurrency(plan.priceMonthly)}
                      {plan.priceMonthly !== null && (
                        <span className="text-sm font-normal" style={{ color: "var(--faint)" }}> /mo</span>
                      )}
                    </p>
                    <ul className="mt-5 flex-1 space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--muted)" }}>
                          <Check size={14} className="mt-0.5 shrink-0" style={{ color: "var(--brand)" }} aria-hidden />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={id === "enterprise" ? "mailto:sales@neuraxis.ai" : "/register"}
                      className={`${plan.highlighted ? "btn-primary" : "btn-secondary"} mt-6 w-full`}
                    >
                      {id === "enterprise" ? "Contact sales" : "Get started"}
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ─────────────── TESTIMONIALS ─────────────── */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <figure
                  className="h-full border-l-2 py-1 pl-5"
                  style={{ borderColor: i === 1 ? "var(--accent)" : "var(--brand)" }}
                >
                  <blockquote className="text-[14.5px] leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4 font-mono text-[11.5px]">
                    <span style={{ color: "var(--brand)" }}>{t.name}</span>
                    <span style={{ color: "var(--faint)" }}> — {t.role}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </section>

        <SectionConnector label="04 / boot" height={120} />

        {/* ─────────────── TERMINAL CTA ─────────────── */}
        <section className="mx-auto max-w-3xl px-6 pb-28 pt-4">
          <Reveal>
            <div
              className="relative overflow-hidden rounded-xl"
              style={{ background: "#0e1116", border: "1px solid rgba(14,17,22,.9)", boxShadow: "0 24px 60px rgba(14,17,22,.25)" }}
            >
              {/* Title bar */}
              <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,.08)" }}>
                {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                  <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} aria-hidden />
                ))}
                <span className="ml-3 font-mono text-[11px]" style={{ color: "rgba(255,255,255,.4)" }}>neuraxis — onboarding</span>
              </div>
              {/* Body */}
              <div className="space-y-2 px-6 py-6 font-mono text-[13px] leading-relaxed">
                <p style={{ color: "rgba(255,255,255,.45)" }}>$ neuraxis init</p>
                <p style={{ color: "rgba(255,255,255,.75)" }}><span style={{ color: "#28c840" }}>✓</span> workspace created</p>
                <p style={{ color: "rgba(255,255,255,.75)" }}><span style={{ color: "#28c840" }}>✓</span> first agent deployed — answering in 4m12s</p>
                <p style={{ color: "rgba(255,255,255,.75)" }}><span style={{ color: "#28c840" }}>✓</span> 14-day trial active, no card required</p>
                <p>
                  <span style={{ color: "#6e83ff" }}>$ </span>
                  <span className="nrx-caret inline-block h-[14px] w-[8px] translate-y-[2px]" style={{ background: "#6e83ff" }} aria-hidden />
                </p>
              </div>
              {/* Footer CTA */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
                <p className="text-[15px] font-semibold text-white">Give your business a brain.</p>
                <Link href={ctaHref} className="btn-primary">
                  {authed ? "Open dashboard" : "Start free trial"} <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ─────────────── FOOTER ─────────────── */}
      <footer className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-[13px]" style={{ color: "var(--faint)" }}>
          <Logo size="sm" />
          <nav className="flex gap-6" aria-label="Footer">
            <a href="#system" className="transition-colors hover:text-[#0e1116]">The system</a>
            <a href="#modules" className="transition-colors hover:text-[#0e1116]">Modules</a>
            <a href="#pricing" className="transition-colors hover:text-[#0e1116]">Pricing</a>
            <Link href="/changelog" className="transition-colors hover:text-[#0e1116]">Changelog</Link>
            <Link href="/login" className="transition-colors hover:text-[#0e1116]">Sign in</Link>
          </nav>
          <p className="font-mono text-[11px]">© {new Date().getFullYear()} neuraxis, inc. // end of line</p>
        </div>
      </footer>
    </div>
  );
}
