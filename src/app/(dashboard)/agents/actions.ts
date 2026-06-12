"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole, requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { agentSchema } from "@/lib/validations/agents";
import { logAudit } from "@/lib/audit";
import { PLANS, type PlanId } from "@/lib/constants/plans";

export type AgentFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function parseAgentForm(formData: FormData) {
  return agentSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    systemPrompt: formData.get("systemPrompt"),
    model: formData.get("model"),
    temperature: formData.get("temperature"),
    maxTokens: formData.get("maxTokens"),
    persona: formData.get("persona"),
    status: formData.get("status") ?? "draft",
  });
}

export async function createAgentAction(
  _prev: AgentFormState,
  formData: FormData
): Promise<AgentFormState> {
  const ctx = await requireRole("member");

  const parsed = parseAgentForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  // Plan limit enforcement
  const plan = PLANS[ctx.org.plan as PlanId] ?? PLANS.starter;
  if (plan.maxAgents !== null) {
    const count = await prisma.aIAgent.count({ where: { orgId: ctx.orgId, deletedAt: null } });
    if (count >= plan.maxAgents) {
      return { error: `Your ${plan.name} plan allows ${plan.maxAgents} agents. Upgrade to add more.` };
    }
  }

  const agent = await prisma.aIAgent.create({
    data: {
      orgId: ctx.orgId,
      ...parsed.data,
      description: parsed.data.description || null,
      versions: {
        create: { version: 1, snapshot: JSON.stringify(parsed.data), changelog: "Initial configuration" },
      },
    },
  });

  await logAudit({ orgId: ctx.orgId, userId: ctx.userId, action: "agent.create", targetType: "agent", targetId: agent.id });
  redirect(`/agents/${agent.id}`);
}

export async function updateAgentAction(
  agentId: string,
  _prev: AgentFormState,
  formData: FormData
): Promise<AgentFormState> {
  const ctx = await requireRole("member");

  const parsed = parseAgentForm(formData);
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const existing = await prisma.aIAgent.findFirst({
    where: { id: agentId, orgId: ctx.orgId, deletedAt: null },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!existing) return { error: "Agent not found." };

  const nextVersion = (existing.versions[0]?.version ?? 0) + 1;

  await prisma.aIAgent.update({
    where: { id: agentId },
    data: {
      ...parsed.data,
      description: parsed.data.description || null,
      versions: {
        create: {
          version: nextVersion,
          snapshot: JSON.stringify(parsed.data),
          changelog: (formData.get("changelog") as string | null) || `Updated configuration (v${nextVersion})`,
        },
      },
    },
  });

  await logAudit({ orgId: ctx.orgId, userId: ctx.userId, action: "agent.update", targetType: "agent", targetId: agentId });
  revalidatePath(`/agents/${agentId}`);
  revalidatePath("/agents");
  return {};
}

export async function rollbackAgentAction(agentId: string, version: number): Promise<void> {
  const ctx = await requireRole("member");

  const target = await prisma.agentVersion.findFirst({
    where: { agentId, version, agent: { orgId: ctx.orgId, deletedAt: null } },
    include: { agent: { include: { versions: { orderBy: { version: "desc" }, take: 1 } } } },
  });
  if (!target) throw new Error("Version not found");

  const snapshot = JSON.parse(target.snapshot) as Record<string, unknown>;
  const nextVersion = (target.agent.versions[0]?.version ?? 0) + 1;

  await prisma.aIAgent.update({
    where: { id: agentId },
    data: {
      ...snapshot,
      versions: {
        create: {
          version: nextVersion,
          snapshot: target.snapshot,
          changelog: `Rolled back to v${version}`,
        },
      },
    },
  });

  await logAudit({
    orgId: ctx.orgId, userId: ctx.userId,
    action: "agent.rollback", targetType: "agent", targetId: agentId,
    metadata: { toVersion: version },
  });
  revalidatePath(`/agents/${agentId}`);
}

export async function deleteAgentAction(agentId: string): Promise<void> {
  const ctx = await requireRole("admin");

  const agent = await prisma.aIAgent.findFirst({ where: { id: agentId, orgId: ctx.orgId } });
  if (!agent) throw new Error("Agent not found");

  await prisma.aIAgent.update({ where: { id: agentId }, data: { deletedAt: new Date(), status: "archived" } });
  await logAudit({ orgId: ctx.orgId, userId: ctx.userId, action: "agent.delete", targetType: "agent", targetId: agentId });
  redirect("/agents");
}
