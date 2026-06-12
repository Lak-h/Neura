export type PlanId = "starter" | "growth" | "scale" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number | null; // cents; null = custom
  maxUsers: number | null;     // null = unlimited
  maxAgents: number | null;
  monthlyCredits: number;
  features: string[];
  highlighted?: boolean;
  stripePriceEnvKey?: string;
};

export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 7900,
    maxUsers: 3,
    maxAgents: 5,
    monthlyCredits: 10_000,
    stripePriceEnvKey: "STRIPE_PRICE_STARTER_MONTHLY",
    features: [
      "3 team members",
      "5 AI agents",
      "10k AI credits / month",
      "Knowledge base (1 GB)",
      "Email support",
    ],
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 29900,
    maxUsers: 15,
    maxAgents: 25,
    monthlyCredits: 100_000,
    highlighted: true,
    stripePriceEnvKey: "STRIPE_PRICE_GROWTH_MONTHLY",
    features: [
      "15 team members",
      "25 AI agents",
      "100k AI credits / month",
      "Workflow automation",
      "All integrations",
      "14-day free trial",
      "Priority support",
    ],
  },
  scale: {
    id: "scale",
    name: "Scale",
    priceMonthly: 89900,
    maxUsers: 75,
    maxAgents: null,
    monthlyCredits: 500_000,
    stripePriceEnvKey: "STRIPE_PRICE_SCALE_MONTHLY",
    features: [
      "75 team members",
      "Unlimited AI agents",
      "500k AI credits / month",
      "Advanced analytics",
      "Audit log export",
      "SLA monitoring",
      "Dedicated success manager",
    ],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: null,
    maxUsers: null,
    maxAgents: null,
    monthlyCredits: 2_000_000,
    features: [
      "Unlimited everything",
      "SSO / SAML",
      "Dedicated infrastructure",
      "Custom data residency",
      "99.9% uptime SLA",
      "Custom contracts & invoicing",
    ],
  },
};

export const TRIAL_DAYS = 14;
export const REFERRAL_CREDIT_CENTS = 5000; // $50

/**
 * Models selectable per-agent. IDs are current as of mid-2026 — the spec's
 * "Claude 3.5 Sonnet / Claude 3 Opus / Gemini 1.5" names are retired models,
 * replaced here with their live successors.
 */
export const AGENT_MODELS = [
  { id: "claude-opus-4-7",    label: "Claude Opus 4.7",   provider: "anthropic", creditsPerMsg: 12 },
  { id: "claude-sonnet-4-6",  label: "Claude Sonnet 4.6", provider: "anthropic", creditsPerMsg: 6 },
  { id: "claude-haiku-4-5",   label: "Claude Haiku 4.5",  provider: "anthropic", creditsPerMsg: 2 },
  { id: "gpt-4o",             label: "GPT-4o",            provider: "openai",    creditsPerMsg: 6 },
  { id: "gpt-4-turbo",        label: "GPT-4 Turbo",       provider: "openai",    creditsPerMsg: 8 },
  { id: "gemini-2.5-pro",     label: "Gemini 2.5 Pro",    provider: "google",    creditsPerMsg: 6 },
  { id: "gemini-2.5-flash",   label: "Gemini 2.5 Flash",  provider: "google",    creditsPerMsg: 1 },
] as const;

export type AgentModelId = (typeof AGENT_MODELS)[number]["id"];
