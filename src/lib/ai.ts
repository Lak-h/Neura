import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import { AGENT_MODELS, type AgentModelId } from "@/lib/constants/plans";
import { features } from "@/lib/env";

export class ModelUnavailableError extends Error {
  constructor(modelId: string, provider: string) {
    super(
      `Model "${modelId}" requires the ${provider} provider — set the matching API key in .env (see .env.example).`
    );
    this.name = "ModelUnavailableError";
  }
}

export function modelMeta(modelId: string) {
  return AGENT_MODELS.find((m) => m.id === modelId);
}

/**
 * Resolves an agent's stored model id to a Vercel AI SDK LanguageModel,
 * enforcing that the provider's API key is actually configured.
 */
export function resolveModel(modelId: AgentModelId | string): LanguageModel {
  const meta = modelMeta(modelId);
  if (!meta) throw new ModelUnavailableError(modelId, "unknown");

  switch (meta.provider) {
    case "anthropic":
      if (!features.ai.anthropic) throw new ModelUnavailableError(modelId, "Anthropic");
      return anthropic(meta.id);
    case "openai":
      if (!features.ai.openai) throw new ModelUnavailableError(modelId, "OpenAI");
      return openai(meta.id);
    case "google":
      if (!features.ai.google) throw new ModelUnavailableError(modelId, "Google");
      return google(meta.id);
    default: {
      const exhausted: never = meta;
      throw new ModelUnavailableError(modelId, String(exhausted));
    }
  }
}

/** Credits charged per assistant message for a given model. */
export function creditsForModel(modelId: string): number {
  return modelMeta(modelId)?.creditsPerMsg ?? 6;
}
