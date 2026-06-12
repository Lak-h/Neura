"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { inviteMemberSchema } from "@/lib/validations/auth";
import { sendEmail } from "@/lib/resend";
import { logAudit } from "@/lib/audit";
import { absoluteUrl } from "@/lib/utils";
import { PLANS, type PlanId } from "@/lib/constants/plans";

export type InviteState = { error?: string; success?: string };

export async function inviteMemberAction(
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  const ctx = await requireRole("admin");

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { email, role } = parsed.data;

  // Plan seat limit
  const plan = PLANS[ctx.org.plan as PlanId] ?? PLANS.starter;
  if (plan.maxUsers !== null) {
    const seats = await prisma.organisationMember.count({ where: { orgId: ctx.orgId } });
    if (seats >= plan.maxUsers) {
      return { error: `Your ${plan.name} plan allows ${plan.maxUsers} seats. Upgrade to invite more people.` };
    }
  }

  const existingMember = await prisma.organisationMember.findFirst({
    where: { orgId: ctx.orgId, user: { email } },
  });
  if (existingMember) return { error: "That person is already a member." };

  const invite = await prisma.organisationInvite.upsert({
    where: { orgId_email: { orgId: ctx.orgId, email } },
    create: {
      orgId: ctx.orgId,
      email,
      role,
      invitedById: ctx.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    update: {
      role,
      acceptedAt: null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await sendEmail({
    to: email,
    subject: `You're invited to ${ctx.org.name} on Neuraxis`,
    html: `<p>${ctx.org.name} invited you to their Neuraxis workspace as a ${role}.</p><p><a href="${absoluteUrl(`/invite/${invite.token}`)}">Accept invitation →</a></p><p>This link expires in 7 days.</p>`,
  });

  await logAudit({ orgId: ctx.orgId, userId: ctx.userId, action: "member.invite", metadata: { email, role } });
  revalidatePath("/team");
  return { success: `Invitation sent to ${email}.` };
}

export async function removeMemberAction(memberId: string): Promise<void> {
  const ctx = await requireRole("admin");
  const member = await prisma.organisationMember.findFirst({
    where: { id: memberId, orgId: ctx.orgId },
  });
  if (!member) throw new Error("Member not found");
  if (member.role === "owner") throw new Error("Owners cannot be removed");
  if (member.userId === ctx.userId) throw new Error("You cannot remove yourself");

  await prisma.organisationMember.delete({ where: { id: memberId } });
  await logAudit({ orgId: ctx.orgId, userId: ctx.userId, action: "member.remove", targetType: "member", targetId: memberId });
  revalidatePath("/team");
}
