# Neuraxis

**The AI Operating System for Modern Businesses.**

Neuraxis is a multi-tenant B2B SaaS platform that gives mid-market companies a complete AI operations brain: configurable **AI agents** (Claude, GPT, Gemini) with a streaming test playground, **credit-metered usage billing** via Stripe, a **shared AI inbox** with confidence-gated human escalation, **workflow automation**, a **knowledge base**, full **RBAC**, and a tamper-evident **audit trail** — in one Next.js application.

---

## Quick start (local, zero external services)

```bash
npm install --legacy-peer-deps
copy .env.example .env        # then set AUTH_SECRET (openssl rand -base64 32)
npx prisma migrate dev        # creates SQLite db at prisma/dev.db
npx tsx prisma/seed.ts        # seeds the Acme Robotics demo org
npm run dev
```

Open http://localhost:3000 and sign in with the seeded demo account:

| Email | Password | Role |
| --- | --- | --- |
| `olivia@acme.dev` | `password123` | Owner |
| `marcus@acme.dev` | `password123` | Admin |
| `priya@acme.dev` | `password123` | Member |
| `devon@acme.dev` | `password123` | Viewer |

Everything boots with **only** `DATABASE_URL` and `AUTH_SECRET` set. Every integration
degrades gracefully: emails log to the console, rate limiting falls back to in-memory,
billing UI shows a "configure Stripe" notice, and agent chat returns a clear 503 naming
the missing provider key.

To make agents actually answer, set at least one of:

```
ANTHROPIC_API_KEY=…           # Claude Opus 4.7 / Sonnet 4.6 / Haiku 4.5
OPENAI_API_KEY=…              # GPT-4o / GPT-4 Turbo
GOOGLE_GENERATIVE_AI_API_KEY=…# Gemini 2.5 Pro / Flash
```

## Environment variables

See [.env.example](.env.example) — every variable is documented there. Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | SQLite locally (`file:./prisma/dev.db`); Postgres in production |
| `AUTH_SECRET` | ✅ | NextAuth JWT signing secret |
| `NEXT_PUBLIC_APP_URL` | ✅ | Absolute URL base for links/redirects |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | ≥1 for AI | Agent model providers |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` | for billing | Checkout, portal, webhooks, top-ups |
| `RESEND_API_KEY`, `EMAIL_FROM` | for email | Invites, magic links, dunning |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | for prod rate limiting | Distributed sliding-window limits |
| `SECRETS_ENCRYPTION_KEY` | for vault | AES-256-GCM key for the org secrets vault |
| `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_*`, `MICROSOFT_ENTRA_ID_*` | optional | OAuth sign-in providers |

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Marketing landing (RSC, session-aware CTA)
│   ├── changelog/                # DB-driven public changelog
│   ├── (auth)/                   # login / register + server actions
│   ├── onboarding/               # First-org creation flow
│   ├── invite/[token]/           # Invite acceptance
│   ├── (dashboard)/              # Protected app (server-side guard in layout)
│   │   ├── overview/  agents/  workflows/  knowledge/  inbox/
│   │   ├── analytics/ integrations/ team/ billing/ security/ settings/
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth v5 handlers
│       ├── ai/chat/              # Streaming agent chat (Vercel AI SDK v6)
│       └── stripe/webhook/       # Signature-verified billing events
├── components/  (layout/, shared/)
├── lib/
│   ├── auth.ts session.ts        # NextAuth config + requireUser/requireOrg/requireRole
│   ├── prisma.ts                 # Prisma 7 client w/ better-sqlite3 driver adapter
│   ├── ai.ts credits.ts          # Model registry + atomic credit ledger
│   ├── stripe.ts resend.ts ratelimit.ts crypto.ts audit.ts env.ts
│   └── validations/              # Zod schemas — single source of truth for enums
└── prisma/ (schema: 38 models, seed.ts)
```

**Key decisions**

- **RBAC is server-side only.** Every page and server action resolves the caller's
  membership via `requireOrg()` / `requireRole()`; API routes use the non-redirecting
  `getOrgContext()` and return proper 401/403 envelopes.
- **Credits are a ledger, not a counter.** `consumeCredits()` runs balance-check,
  decrement, ledger insert, and usage record in one transaction; Stripe webhook grants
  are idempotent per payment intent.
- **SQLite enum tradeoff.** Local dev uses SQLite (so the repo runs with zero infra),
  which can't express Prisma enums — enum-like columns are `String` validated by Zod
  at every boundary (`src/lib/validations/enums.ts`).
- **Provider-agnostic agent runtime.** Agents store a model id; `resolveModel()` maps
  it to an AI SDK `LanguageModel` and enforces that the provider key exists. Sampling
  params are auto-omitted for `claude-opus-4-7` (which rejects them).

## Production deployment

1. **Database** — switch `prisma/schema.prisma` provider to `postgresql`, swap the
   driver adapter in `src/lib/prisma.ts` to `@prisma/adapter-pg`, set `DATABASE_URL`,
   and re-create the migration (`npx prisma migrate dev --name init-postgres`).
   Re-introduce native enums and pgvector for `KBEmbedding.vector` at the same time.
2. **Stripe** — create the four products/prices, set `STRIPE_PRICE_*`, point a webhook
   at `/api/stripe/webhook` with the events: `checkout.session.completed`,
   `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed`.
3. **Vercel** — `vercel deploy`; set all env vars; Upstash Redis recommended so rate
   limits work across instances.

## Honest status

This is the **foundation pass** of a very large spec. Fully working today: auth
(credentials + conditional OAuth/magic-link), multi-tenant orgs with roles/invites/
audit, Stripe checkout/portal/webhooks/credit ledger, the complete agent builder with
versioning + rollback + streaming playground, and live data pages for inbox, workflows,
knowledge, analytics, team, security, and settings. Explicitly stubbed and labelled
in-app: the visual workflow *editor*, KB rich-text editor + embeddings pipeline,
integration OAuth flows, 2FA, and the public agent widget. The Prisma schema already
models all of these so the next passes are UI + route work, not migrations.
"# Neura" 
"# Neura" 
