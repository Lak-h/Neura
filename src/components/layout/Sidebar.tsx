"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Bot, Workflow, BookOpen, Inbox, BarChart3,
  Plug, Users, CreditCard, ShieldCheck, Settings,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/workflows", label: "Workflows", icon: Workflow },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/team", label: "Team", icon: Users },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/security", label: "Security", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar({ orgName, plan }: { orgName: string; plan: string }) {
  const pathname = usePathname();
  const activeIndex = NAV.findIndex(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`)
  );

  return (
    <aside
      className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r md:flex"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <div className="px-5 py-5">
        <Logo size="sm" href="/overview" />
      </div>

      <div
        className="mx-5 mb-5 rounded-lg px-3 py-2.5"
        style={{ background: "var(--background)", border: "1px solid var(--border)" }}
      >
        <p className="truncate text-[13px] font-semibold">{orgName}</p>
        <p className="font-mono text-[10px] uppercase tracking-[.18em]" style={{ color: "var(--faint)" }}>
          {plan} plan
        </p>
      </div>

      <p className="mb-2 px-8 font-mono text-[9.5px] uppercase tracking-[.25em]" style={{ color: "var(--faint)" }}>
        Modules
      </p>

      {/* Nav with a wire rail: the vertical trace runs the list; the node
          glides to the active route. */}
      <nav className="relative flex-1 overflow-y-auto px-3 pb-6" aria-label="Main">
        <span
          aria-hidden
          className="absolute bottom-2 left-[22px] top-1 w-px"
          style={{ background: "linear-gradient(180deg, rgba(39,66,255,.30), rgba(255,92,26,.25))" }}
        />
        {/* Active node — translates along the rail */}
        {activeIndex >= 0 && (
          <span
            aria-hidden
            className="absolute left-[18px] z-10 h-[9px] w-[9px] rounded-full transition-transform duration-300"
            style={{
              top: 14,
              transform: `translateY(${activeIndex * 38}px)`,
              background: "#ffffff",
              border: "1.5px solid var(--brand)",
              boxShadow: "0 0 0 3px rgba(39,66,255,.14)",
            }}
          />
        )}

        <ul className="space-y-1">
          {NAV.map(({ href, label, icon: Icon }, i) => {
            const active = i === activeIndex;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-[34px] items-center gap-3 rounded-lg pl-7 pr-3 text-[13px] font-medium transition-colors",
                    !active && "hover:bg-black/[.04]"
                  )}
                  style={{
                    background: active ? "rgba(39,66,255,.08)" : undefined,
                    color: active ? "var(--brand)" : "var(--muted)",
                    boxShadow: active ? "inset 0 0 0 1px rgba(39,66,255,.22)" : undefined,
                  }}
                >
                  <Icon size={15} strokeWidth={2} aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t px-5 py-4" style={{ borderColor: "var(--border)" }}>
        <p className="font-mono text-[10px]" style={{ color: "var(--faint)" }}>
          neuraxis v1.0 · <Link href="/changelog" className="hover:underline">changelog</Link>
        </p>
      </div>
    </aside>
  );
}
