import { z } from "zod";

/**
 * SQLite (local dev) can't express Prisma enums, so enum-like columns are
 * plain Strings in the schema. These Zod schemas are the single source of
 * truth — every write path MUST validate through them.
 */

export const orgRoleSchema = z.enum(["owner", "admin", "member", "viewer"]);
export type OrgRole = z.infer<typeof orgRoleSchema>;

export const planSchema = z.enum(["starter", "growth", "scale", "enterprise"]);
export type PlanTier = z.infer<typeof planSchema>;

export const subscriptionStatusSchema = z.enum([
  "trialing", "active", "past_due", "canceled", "paused",
]);

export const agentStatusSchema = z.enum(["draft", "active", "archived"]);
export const agentPersonaSchema = z.enum(["formal", "casual", "technical", "empathetic"]);
export const deployChannelSchema = z.enum(["widget", "slack", "email", "api", "whatsapp"]);

export const workflowStatusSchema = z.enum(["draft", "active", "paused", "archived"]);
export const workflowTriggerSchema = z.enum([
  "webhook", "schedule", "email", "form", "db_change", "stripe_event", "manual",
]);
export const runStatusSchema = z.enum(["running", "success", "failed", "cancelled"]);
export const nodeTypeSchema = z.enum(["trigger", "action", "ai", "condition", "delay", "loop"]);

export const conversationStatusSchema = z.enum(["open", "pending", "resolved", "archived"]);
export const conversationChannelSchema = z.enum([
  "email", "widget", "slack", "whatsapp", "playground",
]);
export const prioritySchema = z.enum(["low", "normal", "high", "urgent"]);
export const sentimentSchema = z.enum(["positive", "neutral", "negative"]);
export const messageRoleSchema = z.enum([
  "user", "assistant", "system", "human_agent", "internal_note",
]);

export const kbVisibilitySchema = z.enum(["org", "team", "private"]);
export const docStatusSchema = z.enum(["processing", "ready", "failed"]);
export const docSourceSchema = z.enum(["editor", "pdf", "docx", "txt", "url", "import"]);

export const integrationStatusSchema = z.enum(["connected", "error", "disconnected"]);
export const dataResidencySchema = z.enum(["US", "EU", "APAC"]);

/** Role hierarchy for RBAC checks: can `actor` act at `required` level? */
const ROLE_RANK: Record<OrgRole, number> = { owner: 3, admin: 2, member: 1, viewer: 0 };

export function roleAtLeast(actor: OrgRole, required: OrgRole): boolean {
  return ROLE_RANK[actor] >= ROLE_RANK[required];
}
