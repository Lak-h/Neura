import Stripe from "stripe";
import { env, features } from "@/lib/env";

let _stripe: Stripe | null = null;

/**
 * Lazy singleton. Billing routes call this and surface a clear 503 when
 * Stripe isn't configured rather than crashing at import time.
 */
export function getStripe(): Stripe {
  if (!features.stripe) {
    throw new StripeNotConfiguredError();
  }
  if (!_stripe) {
    _stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

export class StripeNotConfiguredError extends Error {
  constructor() {
    super("Stripe is not configured. Set STRIPE_SECRET_KEY in .env to enable billing.");
    this.name = "StripeNotConfiguredError";
  }
}

export function planPriceId(plan: "starter" | "growth" | "scale"): string | undefined {
  const map = {
    starter: env.STRIPE_PRICE_STARTER_MONTHLY,
    growth: env.STRIPE_PRICE_GROWTH_MONTHLY,
    scale: env.STRIPE_PRICE_SCALE_MONTHLY,
  } as const;
  return map[plan];
}
