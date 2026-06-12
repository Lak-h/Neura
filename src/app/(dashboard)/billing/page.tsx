import { Zap } from "lucide-react";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PLANS, type PlanId } from "@/lib/constants/plans";
import { formatNumber } from "@/lib/utils";
import { features } from "@/lib/env";
import { BillingActions, PlanCard } from "./BillingClient";
import { Reveal } from "@/components/dashboard/anim";

export const metadata = { title: "Billing" };

export default async function BillingPage() {
  const ctx = await requireOrg();

  const [subscription, ledger] = await Promise.all([
    prisma.subscription.findUnique({ where: { orgId: ctx.orgId } }),
    prisma.creditTransaction.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const currentPlan = (ctx.org.plan as PlanId) in PLANS ? (ctx.org.plan as PlanId) : "starter";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
          Plan, credits, and invoices for {ctx.org.name}.
        </p>
      </div>

      {!features.stripe && (
        <div
          className="rounded-xl px-5 py-4 text-sm"
          style={{ background: "rgba(251,191,36,.07)", border: "1px solid rgba(251,191,36,.25)", color: "var(--warning)" }}
        >
          Stripe isn&apos;t configured yet — checkout and the customer portal are disabled.
          Set <code className="font-mono">STRIPE_SECRET_KEY</code> (plus price IDs) in <code className="font-mono">.env</code> to enable live billing.
        </div>
      )}

      {/* Current state */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--faint)" }}>Current plan</p>
          <p className="mt-2 text-2xl font-bold capitalize">{currentPlan}</p>
          <p className="mt-1 text-[13px] capitalize" style={{ color: "var(--muted)" }}>
            {subscription?.status ?? "no subscription"}
            {subscription?.trialEndsAt && subscription.status === "trialing" && (
              <> · trial ends {subscription.trialEndsAt.toLocaleDateString()}</>
            )}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--faint)" }}>Credits remaining</p>
          <p className="mt-2 flex items-center gap-2 text-2xl font-bold" style={{ color: "var(--accent)" }}>
            <Zap size={20} aria-hidden /> {formatNumber(ctx.org.aiCredits)}
          </p>
          <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
            {PLANS[currentPlan].monthlyCredits.toLocaleString()} granted monthly
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--faint)" }}>Renews</p>
          <p className="mt-2 text-2xl font-bold">
            {subscription?.currentPeriodEnd ? subscription.currentPeriodEnd.toLocaleDateString() : "—"}
          </p>
          <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
            {subscription?.cancelAtPeriodEnd ? "Cancels at period end" : "Auto-renews"}
          </p>
        </div>
      </div>

      <BillingActions stripeEnabled={features.stripe} />

      {/* Plans */}
      <section>
        <h2 className="mb-4 text-sm font-semibold">Plans</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(Object.keys(PLANS) as PlanId[]).map((id, i) => (
            <Reveal key={id} delay={i * 0.07}>
              <PlanCard
                plan={PLANS[id]}
                isCurrent={id === currentPlan}
                stripeEnabled={features.stripe}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Credit ledger */}
      <section className="card p-6">
        <h2 className="mb-4 text-sm font-semibold">Credit ledger</h2>
        {ledger.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--faint)" }}>No transactions yet.</p>
        ) : (
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr style={{ color: "var(--faint)" }}>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Reason</th>
                <th className="pb-3 text-right font-medium">Change</th>
                <th className="pb-3 text-right font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((t) => (
                <tr key={t.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="py-2.5" style={{ color: "var(--muted)" }}>{t.createdAt.toLocaleDateString()}</td>
                  <td className="py-2.5">
                    <span className="badge font-mono text-[10px]">{t.reason}</span>
                  </td>
                  <td
                    className="py-2.5 text-right font-mono font-semibold"
                    style={{ color: t.delta > 0 ? "var(--success)" : "var(--muted)" }}
                  >
                    {t.delta > 0 ? "+" : ""}{t.delta.toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right font-mono" style={{ color: "var(--faint)" }}>
                    {t.balanceAfter.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
