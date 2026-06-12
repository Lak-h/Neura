import { prisma } from "@/lib/prisma";

export class InsufficientCreditsError extends Error {
  constructor(public required: number, public available: number) {
    super(`Insufficient AI credits: need ${required}, have ${available}.`);
    this.name = "InsufficientCreditsError";
  }
}

export type ConsumeInput = {
  orgId: string;
  amount: number; // positive number of credits to consume
  reason: "agent_usage" | "workflow_usage" | "adjustment";
  agentId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
};

/**
 * Atomically consume credits: decrement the org balance, write the ledger
 * entry, and record usage — all in one transaction so the balance and ledger
 * can never drift.
 */
export async function consumeCredits(input: ConsumeInput): Promise<{ balanceAfter: number }> {
  const { orgId, amount, reason, agentId, userId, metadata } = input;
  if (amount <= 0) throw new Error("consumeCredits amount must be positive");

  return prisma.$transaction(async (tx) => {
    const org = await tx.organisation.findUniqueOrThrow({
      where: { id: orgId },
      select: { aiCredits: true },
    });
    if (org.aiCredits < amount) {
      throw new InsufficientCreditsError(amount, org.aiCredits);
    }
    const updated = await tx.organisation.update({
      where: { id: orgId },
      data: { aiCredits: { decrement: amount } },
      select: { aiCredits: true },
    });
    await tx.creditTransaction.create({
      data: { orgId, delta: -amount, reason, balanceAfter: updated.aiCredits },
    });
    await tx.usageRecord.create({
      data: {
        orgId,
        kind: "ai_credits",
        amount,
        agentId,
        userId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    });
    return { balanceAfter: updated.aiCredits };
  });
}

/** Grant credits (top-up purchase, subscription renewal, referral bonus). */
export async function grantCredits(
  orgId: string,
  amount: number,
  reason: "subscription_grant" | "top_up" | "referral_bonus" | "adjustment",
  stripePaymentIntentId?: string
): Promise<{ balanceAfter: number }> {
  if (amount <= 0) throw new Error("grantCredits amount must be positive");
  return prisma.$transaction(async (tx) => {
    const updated = await tx.organisation.update({
      where: { id: orgId },
      data: { aiCredits: { increment: amount } },
      select: { aiCredits: true },
    });
    await tx.creditTransaction.create({
      data: { orgId, delta: amount, reason, balanceAfter: updated.aiCredits, stripePaymentIntentId },
    });
    return { balanceAfter: updated.aiCredits };
  });
}
