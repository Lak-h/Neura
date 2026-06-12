import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The SQLite demo db is only referenced via an env-var string at runtime,
  // so the file tracer can't see it — include it in every server function.
  outputFileTracingIncludes: {
    "/*": ["prisma/dev.db"],
  },
};

export default nextConfig;
