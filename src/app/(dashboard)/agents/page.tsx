import Link from "next/link";
import { Bot, Plus } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AGENT_MODELS } from "@/lib/constants/plans";
import { Reveal } from "@/components/dashboard/anim";

export const metadata = { title: "Agents" };

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  active: { bg: "rgba(2,122,72,.08)", fg: "var(--success)" },
  draft: { bg: "rgba(181,71,8,.08)", fg: "var(--warning)" },
  archived: { bg: "rgba(14,17,22,.05)", fg: "var(--faint)" },
};

export default async function AgentsPage() {
  const ctx = await requireOrg();

  const agents = await prisma.aIAgent.findMany({
    where: { orgId: ctx.orgId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { conversations: true, deployments: true } },
      analytics: { orderBy: { date: "desc" }, take: 7 },
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Your AI workforce — {agents.length} agent{agents.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link href="/agents/new" className="btn-primary">
          <Plus size={15} aria-hidden /> New agent
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="card flex flex-col items-center justify-center px-6 py-20 text-center">
          <Bot size={36} style={{ color: "var(--faint)" }} aria-hidden />
          <h2 className="mt-4 text-base font-semibold">No agents yet</h2>
          <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--muted)" }}>
            Agents are AI workers with a job description. Create your first one — a support
            triage agent is a great place to start.
          </p>
          <Link href="/agents/new" className="btn-primary mt-6">
            <Plus size={15} aria-hidden /> Create your first agent
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => {
            const model = AGENT_MODELS.find((m) => m.id === agent.model);
            const weekMessages = agent.analytics.reduce((s, a) => s + a.messagesSent, 0);
            const status = STATUS_STYLE[agent.status] ?? STATUS_STYLE.draft;
            return (
              <Reveal key={agent.id} delay={(agents.indexOf(agent) % 6) * 0.06}>
              <Link
                href={`/agents/${agent.id}`}
                className="card group flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-[rgba(39,66,255,.4)] hover:shadow-[0_8px_24px_rgba(39,66,255,.08)]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "rgba(39,66,255,.08)", color: "var(--brand)" }}
                  >
                    <Bot size={18} aria-hidden />
                  </span>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize"
                    style={{ background: status.bg, color: status.fg }}
                  >
                    {agent.status}
                  </span>
                </div>

                <h2 className="text-[15px] font-semibold leading-snug">{agent.name}</h2>
                {agent.description && (
                  <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
                    {agent.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4 text-[11px]" style={{ borderColor: "var(--border)", color: "var(--faint)" }}>
                  <span className="badge font-mono">{model?.label ?? agent.model}</span>
                  <span>{weekMessages} msgs / 7d</span>
                  <span>·</span>
                  <span>{agent._count.deployments} deployment{agent._count.deployments === 1 ? "" : "s"}</span>
                </div>
              </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
