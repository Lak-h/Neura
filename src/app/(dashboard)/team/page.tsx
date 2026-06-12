import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { roleAtLeast, type OrgRole } from "@/lib/validations/enums";
import { InviteForm, RemoveMemberButton } from "./TeamClient";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const ctx = await requireOrg();
  const canManage = roleAtLeast(ctx.role, "admin");

  const [members, invites] = await Promise.all([
    prisma.organisationMember.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true, email: true, lastSeenAt: true, presence: true } } },
    }),
    prisma.organisationInvite.findMany({
      where: { orgId: ctx.orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          {members.length} member{members.length === 1 ? "" : "s"} in {ctx.org.name}.
        </p>
      </div>

      {canManage && (
        <section className="card p-6">
          <h2 className="mb-4 text-sm font-semibold">Invite someone</h2>
          <InviteForm />
        </section>
      )}

      <section className="card p-6">
        <h2 className="mb-4 text-sm font-semibold">Members</h2>
        <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: "rgba(39,66,255,.10)", color: "var(--brand)" }}
                aria-hidden
              >
                {(m.user.name ?? m.user.email)[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 truncate text-sm font-medium">
                  {m.user.name ?? m.user.email}
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background:
                        m.user.presence === "online" ? "var(--success)"
                        : m.user.presence === "away" ? "var(--warning)"
                        : "var(--faint)",
                    }}
                    aria-label={m.user.presence}
                  />
                </p>
                <p className="truncate text-[12px]" style={{ color: "var(--faint)" }}>{m.user.email}</p>
              </div>
              <span className="badge capitalize">{m.role}</span>
              {canManage && m.role !== "owner" && m.userId !== ctx.userId && (
                <RemoveMemberButton memberId={m.id} />
              )}
            </li>
          ))}
        </ul>
      </section>

      {invites.length > 0 && (
        <section className="card p-6">
          <h2 className="mb-4 text-sm font-semibold">Pending invites</h2>
          <ul className="space-y-2">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between text-sm">
                <span style={{ color: "var(--muted)" }}>{i.email}</span>
                <span className="flex items-center gap-3">
                  <span className="badge capitalize">{i.role}</span>
                  <span className="text-[11px]" style={{ color: "var(--faint)" }}>
                    expires {i.expiresAt.toLocaleDateString()}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
