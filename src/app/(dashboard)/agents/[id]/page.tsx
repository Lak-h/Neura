import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FlaskConical, History, RotateCcw, Trash2 } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AGENT_MODELS } from "@/lib/constants/plans";
import { AgentForm } from "../AgentForm";
import { updateAgentAction, rollbackAgentAction, deleteAgentAction } from "../actions";

export const metadata = { title: "Agent settings" };

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireOrg();

  const agent = await prisma.aIAgent.findFirst({
    where: { id, orgId: ctx.orgId, deletedAt: null },
    include: {
      versions: { orderBy: { version: "desc" }, take: 10 },
      deployments: true,
      _count: { select: { conversations: true } },
    },
  });
  if (!agent) notFound();

  const model = AGENT_MODELS.find((m) => m.id === agent.model);
  const updateAction = updateAgentAction.bind(null, agent.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link href="/agents" className="btn-ghost -ml-3 text-[13px]">
        <ArrowLeft size={14} aria-hidden /> All agents
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{agent.name}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}>
            <span className="badge font-mono">{model?.label ?? agent.model}</span>
            <span className="capitalize">{agent.status}</span>
            <span>·</span>
            <span>{agent._count.conversations} conversations</span>
          </p>
        </div>
        <Link href={`/agents/${agent.id}/playground`} className="btn-primary">
          <FlaskConical size={15} aria-hidden /> Open playground
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings form */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-5 text-sm font-semibold">Configuration</h2>
          <AgentForm
            action={updateAction}
            submitLabel="Save changes"
            showChangelog
            initial={{
              name: agent.name,
              description: agent.description ?? "",
              systemPrompt: agent.systemPrompt,
              model: agent.model,
              temperature: agent.temperature,
              maxTokens: agent.maxTokens,
              persona: agent.persona,
              status: agent.status,
            }}
          />
        </div>

        <div className="space-y-6">
          {/* Version history */}
          <div className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <History size={14} aria-hidden /> Version history
            </h2>
            <ul className="space-y-3">
              {agent.versions.map((v, idx) => (
                <li key={v.id} className="flex items-start gap-3 text-[13px]">
                  <span
                    className="mt-0.5 rounded px-1.5 py-0.5 font-mono text-[11px] font-bold"
                    style={{
                      background: idx === 0 ? "rgba(2,122,72,.08)" : "rgba(14,17,22,.05)",
                      color: idx === 0 ? "var(--success)" : "var(--faint)",
                    }}
                  >
                    v{v.version}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate" style={{ color: "var(--muted)" }}>
                      {v.changelog ?? "No note"}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--faint)" }}>
                      {v.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  {idx !== 0 && (
                    <form
                      action={async () => {
                        "use server";
                        await rollbackAgentAction(agent.id, v.version);
                      }}
                    >
                      <button
                        type="submit"
                        className="btn-ghost px-2 py-1 text-[11px]"
                        title={`Roll back to v${v.version}`}
                      >
                        <RotateCcw size={12} aria-hidden /> Restore
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Deployments */}
          <div className="card p-6">
            <h2 className="mb-4 text-sm font-semibold">Deployments</h2>
            {agent.deployments.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--faint)" }}>
                Not deployed yet. Activate the agent, then deploy it to a channel.
              </p>
            ) : (
              <ul className="space-y-2">
                {agent.deployments.map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-[13px]">
                    <span className="capitalize" style={{ color: "var(--muted)" }}>{d.channel}</span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: d.isActive ? "var(--success)" : "var(--faint)" }}
                      aria-label={d.isActive ? "active" : "inactive"}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Danger zone */}
          <div className="card p-6" style={{ borderColor: "rgba(248,113,113,.25)" }}>
            <h2 className="mb-2 text-sm font-semibold" style={{ color: "var(--danger)" }}>Danger zone</h2>
            <p className="mb-4 text-[13px]" style={{ color: "var(--muted)" }}>
              Archives the agent and removes it from all channels. Conversations are retained.
            </p>
            <form
              action={async () => {
                "use server";
                await deleteAgentAction(agent.id);
              }}
            >
              <button
                type="submit"
                className="btn-secondary text-[13px]"
                style={{ borderColor: "rgba(248,113,113,.35)", color: "var(--danger)" }}
              >
                <Trash2 size={14} aria-hidden /> Delete agent
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
