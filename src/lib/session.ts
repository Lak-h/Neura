import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roleAtLeast, type OrgRole } from "@/lib/validations/enums";

/**
 * Server-side session guards. All dashboard pages and server actions go
 * through these — there is no client-side-only protection anywhere.
 */

export const requireUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user;
});

export type OrgContext = {
  userId: string;
  orgId: string;
  role: OrgRole;
  org: { id: string; name: string; slug: string; plan: string; aiCredits: number; logoUrl: string | null };
};

/**
 * Resolves the current user's active organisation (first membership for now;
 * multi-org switching stores a cookie later). Redirects to onboarding when
 * the user has no org yet.
 */
export const requireOrg = cache(async (): Promise<OrgContext> => {
  const user = await requireUser();
  const membership = await prisma.organisationMember.findFirst({
    where: { userId: user.id, org: { deletedAt: null } },
    orderBy: { createdAt: "asc" },
    include: {
      org: { select: { id: true, name: true, slug: true, plan: true, aiCredits: true, logoUrl: true } },
    },
  });
  if (!membership) redirect("/onboarding");
  return {
    userId: user.id,
    orgId: membership.orgId,
    role: membership.role as OrgRole,
    org: membership.org,
  };
});

/** Throws (404-safe) unless the current member holds at least `required` role. */
export async function requireRole(required: OrgRole): Promise<OrgContext> {
  const ctx = await requireOrg();
  if (!roleAtLeast(ctx.role, required)) {
    throw new Error(`Forbidden: requires ${required} role or above`);
  }
  return ctx;
}

/**
 * Non-redirecting variant for API route handlers — returns null so callers
 * can respond with proper 401/403 JSON instead of HTML redirects.
 */
export async function getOrgContext(): Promise<OrgContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const membership = await prisma.organisationMember.findFirst({
    where: { userId: session.user.id, org: { deletedAt: null } },
    orderBy: { createdAt: "asc" },
    include: {
      org: { select: { id: true, name: true, slug: true, plan: true, aiCredits: true, logoUrl: true } },
    },
  });
  if (!membership) return null;
  return {
    userId: session.user.id,
    orgId: membership.orgId,
    role: membership.role as OrgRole,
    org: membership.org,
  };
}
