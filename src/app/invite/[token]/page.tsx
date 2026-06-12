import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { Logo } from "@/components/shared/Logo";

export const metadata = { title: "Accept invitation" };

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await requireUser();

  const invite = await prisma.organisationInvite.findUnique({
    where: { token },
    include: { org: { select: { id: true, name: true } } },
  });

  const invalid =
    !invite || invite.acceptedAt !== null || invite.expiresAt < new Date();

  if (!invalid) {
    const me = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { email: true } });
    if (me.email.toLowerCase() === invite.email.toLowerCase()) {
      await prisma.$transaction([
        prisma.organisationMember.upsert({
          where: { orgId_userId: { orgId: invite.orgId, userId: user.id } },
          create: { orgId: invite.orgId, userId: user.id, role: invite.role },
          update: {},
        }),
        prisma.organisationInvite.update({
          where: { id: invite.id },
          data: { acceptedAt: new Date() },
        }),
      ]);
      await logAudit({ orgId: invite.orgId, userId: user.id, action: "member.join", metadata: { via: "invite" } });
      redirect("/overview");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-8"><Logo size="lg" /></div>
      <div className="card-raised w-full max-w-md p-8 text-center">
        <h1 className="text-lg font-semibold">
          {invalid ? "This invitation is no longer valid" : "Wrong account for this invite"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          {invalid
            ? "It may have expired or already been used. Ask your workspace admin to send a new one."
            : `This invitation was sent to ${"" /* avoid leaking */}a different email address. Sign in with the invited account to accept it.`}
        </p>
      </div>
    </div>
  );
}
