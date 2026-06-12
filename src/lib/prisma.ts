import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Prisma 7 requires a driver adapter — the client no longer reads
 * DATABASE_URL itself. Local dev uses better-sqlite3; the production
 * Postgres path swaps this for @prisma/adapter-pg (see README).
 *
 * On Vercel the function filesystem is read-only and better-sqlite3 opens
 * read-write, so the seeded demo db is copied to /tmp on cold start.
 * Writes are ephemeral there — the demo resets whenever the function
 * recycles, which is fine until the Postgres switch (see README).
 */
function databaseUrl(): string {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (!process.env.VERCEL || !url.startsWith("file:")) return url;

  const source = path.join(process.cwd(), url.slice("file:".length));
  const writable = "/tmp/neuraxis-demo.db";
  if (!fs.existsSync(writable)) fs.copyFileSync(source, writable);
  return `file:${writable}`;
}

const adapter = new PrismaBetterSqlite3({
  url: databaseUrl(),
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
