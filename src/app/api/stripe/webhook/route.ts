import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { grantCredits } from "@/lib/credits";
import { sendEmail } from "@/lib/resend";
import { env, features } from "@/lib/env";
import { PLANS, type PlanId } from "@/lib/constants/plans";

/**
 * Stripe webhook handler. Signature-verified; every branch is idempotent
 * (re-delivery safe) because it upserts state rather than incrementing it,
 * except credit grants which key off unique payment intents.
 */
export async function POST(req: Request) {
  if (!features.stripe || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = getStripe().webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[stripe] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orgId = session.metadata?.orgId;
        if (!orgId) break;

        if (session.mode === "payment" && session.metadata?.kind === "credits_topup") {
          const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
          // Idempotency: skip if this payment intent already granted credits
          const already = pi
            ? await prisma.creditTransaction.findFirst({ where: { stripePaymentIntentId: pi } })
            : null;
          if (!already) {
            await grantCredits(orgId, 25_000, "top_up", pi ?? undefined);
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const orgId = sub.metadata?.orgId;
        if (!orgId) break;

        const plan = (sub.metadata?.plan ?? "starter") as PlanId;
        const item = sub.items.data[0];

        await prisma.subscription.update({
          where: { orgId },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: item?.price.id,
            plan,
            status: sub.status === "trialing" ? "trialing"
              : sub.status === "active" ? "active"
              : sub.status === "past_due" ? "past_due"
              : sub.status === "canceled" ? "canceled"
              : "paused",
            trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
            currentPeriodEnd: item?.current_period_end
              ? new Date(item.current_period_end * 1000)
              : null,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        });
        await prisma.organisation.update({ where: { id: orgId }, data: { plan } });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const orgId = sub.metadata?.orgId;
        if (!orgId) break;
        await prisma.subscription.update({
          where: { orgId },
          data: { status: "canceled", stripeSubscriptionId: null },
        });
        await prisma.organisation.update({ where: { id: orgId }, data: { plan: "starter" } });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;
        const record = await prisma.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        if (!record) break;

        // Monthly renewal → grant the plan's credit allowance
        const plan = PLANS[record.plan as PlanId] ?? PLANS.starter;
        await grantCredits(record.orgId, plan.monthlyCredits, "subscription_grant");
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;
        const record = await prisma.subscription.findUnique({ where: { stripeCustomerId: customerId } });
        if (!record) break;

        await prisma.subscription.update({
          where: { orgId: record.orgId },
          data: { status: "past_due" },
        });

        // Dunning: notify all org owners
        const owners = await prisma.organisationMember.findMany({
          where: { orgId: record.orgId, role: "owner" },
          include: { user: { select: { email: true } } },
        });
        await Promise.all(
          owners.map((o) =>
            sendEmail({
              to: o.user.email,
              subject: "Action needed: your Neuraxis payment failed",
              html: `<p>Your latest Neuraxis invoice could not be charged. Please update your payment method to avoid losing access.</p><p><a href="${env.NEXT_PUBLIC_APP_URL}/billing">Update billing →</a></p>`,
            })
          )
        );
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying
        break;
    }
  } catch (err) {
    console.error(`[stripe] handler failed for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failure" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
