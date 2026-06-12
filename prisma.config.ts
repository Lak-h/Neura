import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 config — connection URLs no longer live in schema.prisma.
 * Local dev defaults to SQLite at prisma/dev.db; production overrides via
 * DATABASE_URL (switch datasource provider to postgresql, see README).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
});
