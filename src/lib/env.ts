import { z } from "zod";

/**
 * Zod-validated environment. Imported by server code only.
 * Fails fast at boot with a readable list of problems instead of
 * undefined-at-runtime surprises deep inside a request.
 */
const serverSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 chars"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // OAuth — optional, provider enabled only when both halves present
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_ENTRA_ID_CLIENT_ID: z.string().optional(),
  MICROSOFT_ENTRA_ID_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_ENTRA_ID_ISSUER: z.string().optional(),

  // AI
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_STARTER_MONTHLY: z.string().optional(),
  STRIPE_PRICE_GROWTH_MONTHLY: z.string().optional(),
  STRIPE_PRICE_SCALE_MONTHLY: z.string().optional(),
  STRIPE_PRICE_CREDITS_TOPUP: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Neuraxis <noreply@localhost>"),

  // Redis
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Uploads
  UPLOADTHING_TOKEN: z.string().optional(),

  // Vault
  SECRETS_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-f]{64}$/i, "must be 32 bytes hex (openssl rand -hex 32)")
    .optional(),

  // Observability
  SENTRY_DSN: z.string().optional(),

  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = serverSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`❌ Invalid environment configuration:\n${issues}\nSee .env.example.`);
}

export const env = parsed.data;

/** Feature flags derived from which secrets are present. */
export const features = {
  stripe: Boolean(env.STRIPE_SECRET_KEY),
  resend: Boolean(env.RESEND_API_KEY),
  redis: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  uploads: Boolean(env.UPLOADTHING_TOKEN),
  vault: Boolean(env.SECRETS_ENCRYPTION_KEY),
  ai: {
    anthropic: Boolean(env.ANTHROPIC_API_KEY),
    openai: Boolean(env.OPENAI_API_KEY),
    google: Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY),
    any: Boolean(env.ANTHROPIC_API_KEY || env.OPENAI_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY),
  },
  oauth: {
    google: Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    github: Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    microsoft: Boolean(env.MICROSOFT_ENTRA_ID_CLIENT_ID && env.MICROSOFT_ENTRA_ID_CLIENT_SECRET),
  },
} as const;
