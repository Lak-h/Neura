"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { createOrgSchema } from "@/lib/validations/auth";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { PLANS } from "@/lib/constants/plans";

export type OnboardingState = { error?: string };

export async function createOrgAction(
  _prev: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const user = await requireUser();

  const parsed = createOrgSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid organisation name" };
  }

  const base = slugify(parsed.data.name) || "workspace";
  // Find a free slug: acme, acme-2, acme-3 …
  let slug = base;
  for (let i = 2; await prisma.organisation.findUnique({ where: { slug } }); i++) {
    slug = `${base}-${i}`;
    if (i > 50) return { error: "Could not generate a unique workspace URL — try another name." };
  }

  const starterCredits = PLANS.starter.monthlyCredits;

  const org = await prisma.organisation.create({
    data: {
      name: parsed.data.name,
      slug,
      plan: "starter",
      aiCredits: starterCredits,
      members: { create: { userId: user.id, role: "owner" } },
      creditTransactions: {
        create: { delta: starterCredits, reason: "subscription_grant", balanceAfter: starterCredits },
      },
    },
  });

  await logAudit({ orgId: org.id, userId: user.id, action: "org.create", targetType: "organisation", targetId: org.id });

  redirect("/overview");
}
