import { z } from "zod";
import { AGENT_MODELS } from "@/lib/constants/plans";
import { agentPersonaSchema, agentStatusSchema } from "@/lib/validations/enums";

const modelIds = AGENT_MODELS.map((m) => m.id) as [string, ...string[]];

export const agentSchema = z.object({
  name: z.string().min(2, "Name is too short").max(60),
  description: z.string().max(280).optional().or(z.literal("")),
  systemPrompt: z.string().min(20, "System prompt should be at least 20 characters").max(20_000),
  model: z.enum(modelIds),
  temperature: z.coerce.number().min(0).max(1),
  maxTokens: z.coerce.number().int().min(256).max(32_000),
  persona: agentPersonaSchema,
  status: agentStatusSchema,
});

export type AgentInput = z.infer<typeof agentSchema>;
