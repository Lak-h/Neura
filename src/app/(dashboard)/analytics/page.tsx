import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { Reveal, CountUpValue, GrowBar } from "@/components/dashboard/anim";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const ctx = await requireOrg();
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const [analytics, usage] = await Promise.all([
    prisma.agentAnalytics.findMany({
      where: { agent: { orgId: ctx.orgId }, date: { gte: since } },
      include: { agent: { select: { id: true, name: true } } },
      orderBy: { date: "asc" },
    }),
    prisma.usageRecord.aggregate({
      where: { orgId: ctx.orgId, kind: "ai_credits", createdAt: { gte: since } },
      _sum: { amount: true },
    }),
  ]);

  // Aggregate per agent
  const perAgent = new Map<string, { name: string; messages: number; credits: number; errors: number; avgMs: number; days: number }>();
  for (const row of analytics) {
    const cur = perAgent.get(row.agent.id) ?? { name: row.agent.name, messages: 0, credits: 0, errors: 0, avgMs: 0, days: 0 };
    cur.messages += row.messagesSent;
    cur.credits += row.creditsUsed;
    cur.errors += row.errorCount;
    cur.avgMs += row.avgResponseMs;
    cur.days += 1;
    perAgent.set(row.agent.id, cur);
  }
  const agents = [...perAgent.values()].sort((a, b) => b.messages - a.messages);
  const totals = agents.reduce(
    (acc, a) => ({ messages: acc.messages + a.messages, credits: acc.credits + a.credits, errors: acc.errors + a.errors }),
    { messages: 0, credits: 0, errors: 0 }
  );
  const maxMessages = Math.max(1, ...agents.map((a) => a.messages));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Last 14 days of AI activity. Chart visualisations land next pass — the numbers are live.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Messages handled", value: totals.messages },
          { label: "Credits consumed", value: usage._sum.amount ?? totals.credits },
          { label: "Agent errors", value: totals.errors },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07}>
            <div className="card p-5">
              <p className="font-mono text-[10px] uppercase tracking-[.2em]" style={{ color: "var(--faint)" }}>{s.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                <CountUpValue value={s.value} compact={s.value >= 1000} />
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15}>
        <section className="card p-6">
          <h2 className="mb-5 text-sm font-semibold">Agent leaderboard</h2>
          {agents.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--faint)" }}>No activity recorded yet.</p>
          ) : (
            <ul className="space-y-4">
              {agents.map((a, i) => (
                <li key={a.name}>
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span className="font-medium">{a.name}</span>
                    <span className="font-mono text-[11px]" style={{ color: "var(--faint)" }}>
                      {a.messages.toLocaleString()} msgs · {formatNumber(a.credits)} credits ·{" "}
                      {a.days ? Math.round(a.avgMs / a.days) : 0}ms avg
                    </span>
                  </div>
                  <GrowBar pct={(a.messages / maxMessages) * 100} delay={i * 0.12} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </Reveal>
    </div>
  );
}
