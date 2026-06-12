import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Consistent API envelope used by every /api/v1 endpoint. */
export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: string;
  meta?: { page?: number; total?: number; limit?: number; cursor?: string | null };
};

export function ok<T>(data: T, meta?: ApiEnvelope<T>["meta"]): ApiEnvelope<T> {
  return { success: true, data, ...(meta ? { meta } : {}) };
}

export function fail(error: string): ApiEnvelope<never> {
  return { success: false, error };
}
