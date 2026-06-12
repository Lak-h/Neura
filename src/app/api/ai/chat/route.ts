import { NextResponse } from "next/server";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { z } from "zod";
import { getOrgContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { resolveModel, creditsForModel, ModelUnavailableError } from "@/lib/ai";
import { consumeCredits, InsufficientCreditsError } from "@/lib/credits";
import { rateLimit } from "@/lib/ratelimit";
import { fail } from "@/lib/utils";

export const maxDuration = 60;

const bodySchema = z.object({
  agentId: z.string().min(1),
  messages: z.array(z.any()).min(1),
});

const PERSONA_HINTS: Record<string, string> = {
  formal: "Maintain a professional, precise tone.",
  casual: "Keep the tone friendly and conversational.",
  technical: "Be exact and detailed; prefer concrete specifics over generalities.",
  empathetic: "Lead with warmth; acknowledge feelings before solving.",
};

export async function POST(req: Request) {
  try {
    const ctx = await getOrgContext();
    if (!ctx) {
      return NextResponse.json(fail("Unauthorized"), { status: 401 });
    }

    const limit = await rateLimit(`chat:${ctx.orgId}`, { limit: 30, windowSec: 60 });
    if (!limit.success) {
      return NextResponse.json(fail("Rate limit exceeded — wait a moment."), { status: 429 });
    }

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(fail("Invalid request body"), { status: 400 });
    }
    const { agentId } = parsed.data;
    const messages = parsed.data.messages as UIMessage[];

    const agent = await prisma.aIAgent.findFirst({
      where: { id: agentId, orgId: ctx.orgId, deletedAt: null },
    });
    if (!agent) {
      return NextResponse.json(fail("Agent not found"), { status: 404 });
    }

    // Charge credits up front — the stream is committed spend
    const credits = creditsForModel(agent.model);
    try {
      await consumeCredits({
        orgId: ctx.orgId,
        amount: credits,
        reason: "agent_usage",
        agentId: agent.id,
        userId: ctx.userId,
        metadata: { channel: "playground" },
      });
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        return NextResponse.json(fail(err.message), { status: 402 });
      }
      throw err;
    }

    const model = resolveModel(agent.model);
    const system = `${agent.systemPrompt}\n\n${PERSONA_HINTS[agent.persona] ?? ""}`.trim();
    const startedAt = Date.now();

    // claude-opus-4-7 removed sampling params entirely — sending temperature
    // or topP returns a 400, so they're only attached for other models.
    const sampling =
      agent.model === "claude-opus-4-7"
        ? {}
        : { temperature: agent.temperature, topP: agent.topP };

    const result = streamText({
      model,
      system,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: agent.maxTokens,
      ...sampling,
      onFinish: async () => {
        // Daily analytics rollup — never let a stats failure break the reply
        try {
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          const latency = Date.now() - startedAt;
          await prisma.agentAnalytics.upsert({
            where: { agentId_date: { agentId: agent.id, date: today } },
            create: {
              agentId: agent.id,
              date: today,
              messagesSent: 1,
              avgResponseMs: latency,
              creditsUsed: credits,
            },
            update: {
              messagesSent: { increment: 1 },
              creditsUsed: { increment: credits },
              avgResponseMs: latency, // last-write latency; fine for a rollup
            },
          });
        } catch (e) {
          console.error("[chat] analytics rollup failed:", e);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    if (err instanceof ModelUnavailableError) {
      return NextResponse.json(fail(err.message), { status: 503 });
    }
    console.error("[chat] unhandled error:", err);
    return NextResponse.json(fail("Something went wrong generating a response."), { status: 500 });
  }
}
