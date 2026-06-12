import { prisma } from "@/lib/prisma";

export type AuditInput = {
  orgId: string;
  userId?: string | null;
  action: string; // dot-namespaced: "agent.create", "member.invite", "billing.upgrade"
  targetType?: string;
  targetId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Fire-and-forget audit trail. Failures are logged, never thrown — an audit
 * write must not take down the action it documents.
 */
export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        orgId: input.orgId,
        userId: input.userId ?? undefined,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        ipAddress: input.ipAddress ?? undefined,
        userAgent: input.userAgent ?? undefined,
        metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
      },
    });
  } catch (err) {
    console.error("[audit] failed to write audit log:", err);
  }
}
