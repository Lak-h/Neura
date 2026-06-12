import { Workflow as WorkflowIcon, Play, CircleCheck, CircleX } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Workflows" };

export default async function WorkflowsPage() {
  const ctx = await requireOrg();

  const workflows = await prisma.workflow.findMany({
    where: { orgId: ctx.orgId, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { nodes: true, runs: true } },
      runs: { orderBy: { createdAt: "desc" }, take: 10, select: { status: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workflows</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            Automation pipelines triggered by webhooks, schedules, and events.
          </p>
        </div>
        <span className="badge">Visual editor ships in the next build pass</span>
      </div>

      {workflows.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-20 text-center">
          <WorkflowIcon size={36} style={{ color: "var(--faint)" }} aria-hidden />
          <h2 className="mt-4 text-base font-semibold">No workflows yet</h2>
          <p className="mt-1 max-w-sm text-sm" style={{ color: "var(--muted)" }}>
            Workflows chain triggers, AI steps, and actions into automation pipelines.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workflows.map((wf) => {
            const success = wf.runs.filter((r) => r.status === "success").length;
            const failed = wf.runs.filter((r) => r.status === "failed").length;
            return (
              <div key={wf.id} className="card p-5">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold">{wf.name}</h2>
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize"
                    style={{
                      background: wf.status === "active" ? "rgba(2,122,72,.08)" : "rgba(14,17,22,.05)",
                      color: wf.status === "active" ? "var(--success)" : "var(--faint)",
                    }}
                  >
                    {wf.status}
                  </span>
                </div>
                {wf.description && (
                  <p className="mb-4 text-[13px] leading-relaxed" style={{ color: "var(--muted)" }}>
                    {wf.description}
                  </p>
                )}
                <div className="flex items-center gap-4 border-t pt-3 text-[12px]" style={{ borderColor: "var(--border)", color: "var(--faint)" }}>
                  <span className="badge font-mono capitalize">{wf.triggerType}</span>
                  <span>{wf._count.nodes} nodes</span>
                  <span className="flex items-center gap-1">
                    <Play size={11} aria-hidden /> {wf._count.runs}
                  </span>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="flex items-center gap-1" style={{ color: "var(--success)" }}>
                      <CircleCheck size={12} aria-hidden /> {success}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: failed ? "var(--danger)" : "var(--faint)" }}>
                      <CircleX size={12} aria-hidden /> {failed}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
