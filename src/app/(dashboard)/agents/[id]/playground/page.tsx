import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AGENT_MODELS } from "@/lib/constants/plans";
import { PlaygroundChat } from "./PlaygroundChat";

export const metadata = { title: "Playground" };

export default async function PlaygroundPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireOrg();

  const agent = await prisma.aIAgent.findFirst({
    where: { id, orgId: ctx.orgId, deletedAt: null },
    select: { id: true, name: true, model: true, persona: true, status: true },
  });
  if (!agent) notFound();

  const model = AGENT_MODELS.find((m) => m.id === agent.model);

  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-4xl flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/agents/${agent.id}`} className="btn-ghost -ml-3 text-[13px]">
            <ArrowLeft size={14} aria-hidden /> {agent.name}
          </Link>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">Playground</h1>
        </div>
        <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--muted)" }}>
          <span className="badge font-mono">{model?.label ?? agent.model}</span>
          <span className="badge">{model?.creditsPerMsg ?? "?"} credits / msg</span>
        </div>
      </div>

      <PlaygroundChat agentId={agent.id} agentName={agent.name} />
    </div>
  );
}
