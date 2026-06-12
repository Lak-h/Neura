import { KeyRound, ScrollText } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Security" };

export default async function SecurityPage() {
  const ctx = await requireOrg();

  const [apiKeys, auditLogs] = await Promise.all([
    prisma.aPIKey.findMany({
      where: { orgId: ctx.orgId, revokedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Security</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          API keys, audit trail, and compliance controls for {ctx.org.name}.
        </p>
      </div>

      <section className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <KeyRound size={14} aria-hidden /> API keys
        </h2>
        {apiKeys.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--faint)" }}>No API keys yet.</p>
        ) : (
          <ul className="space-y-3">
            {apiKeys.map((k) => (
              <li key={k.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{k.name}</p>
                  <p className="font-mono text-[12px]" style={{ color: "var(--faint)" }}>{k.keyPrefix}…</p>
                </div>
                <span className="text-[12px]" style={{ color: "var(--faint)" }}>
                  {k.lastUsedAt ? `last used ${k.lastUsedAt.toLocaleDateString()}` : "never used"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <ScrollText size={14} aria-hidden /> Audit log
        </h2>
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr style={{ color: "var(--faint)" }}>
              <th className="pb-3 font-medium">Action</th>
              <th className="pb-3 font-medium">Actor</th>
              <th className="pb-3 text-right font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((a) => (
              <tr key={a.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="py-2.5">
                  <span className="rounded px-1.5 py-0.5 font-mono text-[11px]" style={{ background: "rgba(39,66,255,.07)", color: "var(--brand)" }}>
                    {a.action}
                  </span>
                </td>
                <td className="py-2.5" style={{ color: "var(--muted)" }}>
                  {a.user?.name ?? a.user?.email ?? "System"}
                </td>
                <td className="py-2.5 text-right" style={{ color: "var(--faint)" }}>
                  {a.createdAt.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
