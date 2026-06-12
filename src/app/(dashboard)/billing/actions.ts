"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStripe, planPriceId, StripeNotConfiguredError } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { TRIAL_DAYS } from "@/lib/constants/plans";
import { env } from "@/lib/env";

export type BillingState = { error?: string };

async function ensureStripeCustomer(orgId: string, orgName: string, email: string): Promise<string> {
  const existing = await prisma.subscription.findUnique({ where: { orgId } });
  if (existing) return existing.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    name: orgName,
    email,
    metadata: { orgId },
  });
  await prisma.subscription.create({
    data: { orgId, stripeCustomerId: customer.id, plan: "starter", status: "active" },
  });
  return customer.id;
}

export async function checkoutAction(
  plan: "starter" | "growth" | "scale",
  _prev: BillingState,
  _formData: FormData
): Promise<BillingState> {
  let url: string;
  try {
    const ctx = await requireRole("admin");
    const priceId = planPriceId(plan);
    if (!priceId) {
      return { error: `No Stripe price configured for the ${plan} plan — set ${`STRIPE_PRICE_${plan.toUpperCase()}_MONTHLY`} in .env.` };
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: ctx.userId }, select: { email: true } });
    const customerId = await ensureStripeCustomer(ctx.orgId, ctx.org.name, user.email);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: absoluteUrl("/billing?status=success"),
      cancel_url: absoluteUrl("/billing?status=cancelled"),
      metadata: { orgId: ctx.orgId, plan },
      subscription_data: {
        metadata: { orgId: ctx.orgId, plan },
        ...(plan === "growth" ? { trial_period_days: TRIAL_DAYS } : {}),
      },
    });
    if (!session.url) return { error: "Stripe did not return a checkout URL." };

    await logAudit({ orgId: ctx.orgId, userId: ctx.userId, action: "billing.checkout_started", metadata: { plan } });
    url = session.url;
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) return { error: err.message };
    console.error("[billing] checkout failed:", err);
    return { error: "Could not start checkout — try again." };
  }
  redirect(url);
}

export async function portalAction(_prev: BillingState, _formData: FormData): Promise<BillingState> {
  let url: string;
  try {
    const ctx = await requireRole("admin");
    const sub = await prisma.subscription.findUnique({ where: { orgId: ctx.orgId } });
    if (!sub) return { error: "No billing account yet — subscribe to a plan first." };

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripeCustomerId,
      return_url: absoluteUrl("/billing"),
    });
    url = session.url;
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) return { error: err.message };
    console.error("[billing] portal failed:", err);
    return { error: "Could not open the billing portal — try again." };
  }
  redirect(url);
}

export async function topupAction(_prev: BillingState, _formData: FormData): Promise<BillingState> {
  let url: string;
  try {
    const ctx = await requireRole("admin");
    if (!env.STRIPE_PRICE_CREDITS_TOPUP) {
      return { error: "No top-up price configured — set STRIPE_PRICE_CREDITS_TOPUP in .env." };
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: ctx.userId }, select: { email: true } });
    const customerId = await ensureStripeCustomer(ctx.orgId, ctx.org.name, user.email);

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price: env.STRIPE_PRICE_CREDITS_TOPUP, quantity: 1 }],
      success_url: absoluteUrl("/billing?status=topup-success"),
      cancel_url: absoluteUrl("/billing?status=cancelled"),
      metadata: { orgId: ctx.orgId, kind: "credits_topup" },
    });
    if (!session.url) return { error: "Stripe did not return a checkout URL." };
    url = session.url;
  } catch (err) {
    if (err instanceof StripeNotConfiguredError) return { error: err.message };
    console.error("[billing] topup failed:", err);
    return { error: "Could not start the top-up — try again." };
  }
  redirect(url);
}
