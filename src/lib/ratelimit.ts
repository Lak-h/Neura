import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env, features } from "@/lib/env";

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number; // epoch ms
};

/**
 * Tiered rate limiting: Upstash sliding-window in production, an in-memory
 * sliding window locally so dev needs zero external services. The in-memory
 * fallback is per-process only — fine for dev, never for multi-instance prod.
 */

const upstash = features.redis
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL!, token: env.UPSTASH_REDIS_REST_TOKEN! })
  : null;

const limiters = new Map<string, Ratelimit>();

function upstashLimiter(limit: number, windowSec: number): Ratelimit {
  const key = `${limit}:${windowSec}`;
  let l = limiters.get(key);
  if (!l) {
    l = new Ratelimit({
      redis: upstash!,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: "nrx:rl",
    });
    limiters.set(key, l);
  }
  return l;
}

// ── In-memory fallback ──
const memory = new Map<string, number[]>();

function memoryLimit(key: string, limit: number, windowSec: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const hits = (memory.get(key) ?? []).filter((t) => now - t < windowMs);
  const success = hits.length < limit;
  if (success) hits.push(now);
  memory.set(key, hits);
  // Opportunistic GC so the map doesn't grow unbounded in long dev sessions
  if (memory.size > 10_000) {
    for (const [k, v] of memory) {
      if (v.every((t) => now - t >= windowMs)) memory.delete(k);
    }
  }
  return {
    success,
    limit,
    remaining: Math.max(0, limit - hits.length),
    resetAt: (hits[0] ?? now) + windowMs,
  };
}

export async function rateLimit(
  key: string,
  { limit = 60, windowSec = 60 }: { limit?: number; windowSec?: number } = {}
): Promise<RateLimitResult> {
  if (upstash) {
    const r = await upstashLimiter(limit, windowSec).limit(key);
    return { success: r.success, limit: r.limit, remaining: r.remaining, resetAt: r.reset };
  }
  return memoryLimit(key, limit, windowSec);
}

/** Per-plan API rate limits (requests / minute). */
export const PLAN_RATE_LIMITS: Record<string, number> = {
  starter: 60,
  growth: 300,
  scale: 1200,
  enterprise: 6000,
};
