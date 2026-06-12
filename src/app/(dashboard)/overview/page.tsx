import Link from "next/link";
import { Bot, Workflow as WorkflowIcon, MessageSquare, Zap } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Reveal, CountUpValue } from "@/components/dashboard/anim";

export const metadata = { title: "Overview" };

export default async function OverviewPage() {
  const ctx = await requireOrg();

  const [agentCount, activeWorkflows, openConversations, recentAudit, recentRuns] =
    await Promise.all([
      prisma.aIAgent.count({ where: { orgId: ctx.orgId, deletedAt: null } }),
      prisma.workflow.count({ where: { orgId: ctx.orgId, status: "active", deletedAt: null } }),
      prisma.conversation.count({ where: { orgId: ctx.orgId, status: "open" } }),
      prisma.auditLog.findMany({
        where: { orgId: ctx.orgId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.workflowRun.findMany({
        where: { workflow: { orgId: ctx.orgId } },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { workflow: { select: { name: true } } },
      }),
    ]);

  const stats = [
    { label: "AI Agents", value: agentCount, icon: Bot, href: "/agents", color: "var(--brand)" },
    { label: "Active Workflows", value: activeWorkflows, icon: WorkflowIcon, href: "/workflows", color: "var(--accent)" },
    { label: "Open Conversations", value: openConversations, icon: MessageSquare, href: "/inbox", color: "var(--warning)" },
    { label: "Credits Remaining", value: ctx.org.aiCredits, icon: Zap, href: "/billing", color: "var(--brand)", compact: true },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Reveal y={14}>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[.28em]" style={{ color: "var(--brand)" }}>
          {ctx.org.name} <span style={{ color: "var(--faint)" }}>//</span> live
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          What your AI operation is doing right now.
        </p>
      </Reveal>

      {/* Stat cards — values count up on load */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href, color, compact }, i) => (
          <Reveal key={label} delay={i * 0.07} y={20}>
            <Link
              href={href}
              className="card group flex h-full flex-col p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(39,66,255,.4)] hover:shadow-[0_8px_24px_rgba(39,66,255,.08)]"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[.2em]" style={{ color: "var(--faint)" }}>
                  {label}
                </span>
                <Icon size={15} style={{ color }} aria-hidden />
              </div>
              <p className="text-3xl font-bold tracking-tight">
                <CountUpValue value={value} compact={compact} />
              </p>
            </Link>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Activity feed */}
        <Reveal delay={0.15} className="lg:col-span-3">
          <section className="card h-full p-6">
            <h2 className="mb-4 text-sm font-semibold">Recent activity</h2>
            {recentAudit.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--faint)" }}>
                No activity yet — create your first agent to get started.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentAudit.map((a) => (
                  <li key={a.id} className="flex items-baseline gap-3 text-sm">
                    <span
                      className="rounded px-1.5 py-0.5 font-mono text-[11px]"
                      style={{ background: "rgba(39,66,255,.07)", color: "var(--brand)" }}
                    >
                      {a.action}
                    </span>
                    <span style={{ color: "var(--muted)" }}>
                      {a.user?.name ?? a.user?.email ?? "System"}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[11px]" style={{ color: "var(--faint)" }}>
                      {a.createdAt.toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>

        {/* Recent workflow runs */}
        <Reveal delay={0.22} className="lg:col-span-2">
          <section className="card h-full p-6">
            <h2 className="mb-4 text-sm font-semibold">Latest workflow runs</h2>
            {recentRuns.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--faint)" }}>No runs yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentRuns.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 text-sm">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{
                        background:
                          r.status === "success" ? "var(--success)"
                          : r.status === "failed" ? "var(--danger)"
                          : "var(--warning)",
                      }}
                      aria-label={r.status}
                    />
                    <span className="truncate" style={{ color: "var(--muted)" }}>{r.workflow.name}</span>
                    <span className="ml-auto shrink-0 font-mono text-[11px] capitalize" style={{ color: "var(--faint)" }}>
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </Reveal>
      </div>
    </div>
  );
}
