"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Logo } from "@/components/shared/Logo";

export function MarketingNav({ authed }: { authed: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(246,246,242,.82)" : "transparent",
        backdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--border)" : "transparent"}`,
      }}
    >
      {/* Scroll progress wire */}
      <motion.div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[1.5px] origin-left"
        style={{
          scaleX: progress,
          background: "linear-gradient(90deg, #2742ff, #ff5c1a)",
          opacity: scrolled ? 1 : 0,
        }}
      />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="hidden items-center gap-6 whitespace-nowrap text-[13.5px] lg:flex" style={{ color: "var(--muted)" }} aria-label="Marketing">
          <a href="#system" className="transition-colors hover:text-[#0e1116]">The system</a>
          <a href="#modules" className="transition-colors hover:text-[#0e1116]">Modules</a>
          <a href="#pricing" className="transition-colors hover:text-[#0e1116]">Pricing</a>
          <Link href="/changelog" className="transition-colors hover:text-[#0e1116]">Changelog</Link>
        </nav>
        <div className="flex items-center gap-3 whitespace-nowrap">
          {!authed && <Link href="/login" className="btn-ghost hidden text-sm sm:inline-flex">Sign in</Link>}
          <Link href={authed ? "/overview" : "/register"} className="btn-primary text-sm">
            {authed ? "Open dashboard" : "Start free trial"}
          </Link>
        </div>
      </div>
    </header>
  );
}
