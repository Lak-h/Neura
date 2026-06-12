"use client";

import { useActionState } from "react";
import { Check, ExternalLink, Zap } from "lucide-react";
import type { Plan } from "@/lib/constants/plans";
import { formatCurrency } from "@/lib/utils";
import { checkoutAction, portalAction, topupAction, type BillingState } from "./actions";

export function BillingActions({ stripeEnabled }: { stripeEnabled: boolean }) {
  const [portalState, portal, portalPending] = useActionState<BillingState, FormData>(portalAction, {});
  const [topupState, topup, topupPending] = useActionState<BillingState, FormData>(topupAction, {});
  const error = portalState.error ?? topupState.error;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form action={portal}>
        <button type="submit" disabled={!stripeEnabled || portalPending} className="btn-secondary">
          <ExternalLink size={14} aria-hidden />
          {portalPending ? "Opening…" : "Manage billing"}
        </button>
      </form>
      <form action={topup}>
        <button type="submit" disabled={!stripeEnabled || topupPending} className="btn-secondary">
          <Zap size={14} aria-hidden />
          {topupPending ? "Opening…" : "Buy 25k credits"}
        </button>
      </form>
      {error && <p className="text-[13px]" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );
}

export function PlanCard({
  plan,
  isCurrent,
  stripeEnabled,
}: {
  plan: Plan;
  isCurrent: boolean;
  stripeEnabled: boolean;
}) {
  const boundCheckout = checkoutAction.bind(null, plan.id as "starter" | "growth" | "scale");
  const [state, action, pending] = useActionState<BillingState, FormData>(boundCheckout, {});

  return (
    <div
      className="card relative flex flex-col p-5"
      style={plan.highlighted ? { borderColor: "rgba(39,66,255,.45)", boxShadow: "0 12px 40px rgba(39,66,255,.12)" } : undefined}
    >
      {plan.highlighted && (
        <span
          className="absolute -top-2.5 left-5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ background: "linear-gradient(135deg, #2742ff, #1f36d8)" }}
        >
          Most popular
        </span>
      )}

      <h3 className="text-base font-semibold">{plan.name}</h3>
      <p className="mt-2 text-2xl font-bold">
        {plan.priceMonthly === null ? "Custom" : formatCurrency(plan.priceMonthly)}
        {plan.priceMonthly !== null && (
          <span className="text-sm font-normal" style={{ color: "var(--faint)" }}> /mo</span>
        )}
      </p>

      <ul className="mt-4 flex-1 space-y-2">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[13px]" style={{ color: "var(--muted)" }}>
            <Check size={14} className="mt-0.5 shrink-0" style={{ color: "var(--success)" }} aria-hidden />
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        {isCurrent ? (
          <span className="badge w-full justify-center py-2" style={{ color: "var(--success)" }}>
            Current plan
          </span>
        ) : plan.id === "enterprise" ? (
          <a href="mailto:sales@neuraxis.ai" className="btn-secondary w-full">Contact sales</a>
        ) : (
          <form action={action}>
            <button type="submit" disabled={!stripeEnabled || pending} className={plan.highlighted ? "btn-primary w-full" : "btn-secondary w-full"}>
              {pending ? "Redirecting…" : `Switch to ${plan.name}`}
            </button>
            {state.error && <p className="field-error mt-2">{state.error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
