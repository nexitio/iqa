/**
 * Entry point.
 *
 * Verifies the database is reachable before it starts listening — a server that
 * answers requests it cannot serve is worse than one that refuses to boot — and
 * closes the pool on SIGINT/SIGTERM so `tsx watch` restarts cleanly.
 */

import { serve } from "@hono/node-server";
import { sql } from "drizzle-orm";
import { createApp } from "./app.ts";
import { createDatabase, createPool } from "./db/index.ts";
import { env } from "./env.ts";

const pool = createPool();
const db = createDatabase(pool);

try {
  await db.execute(sql`select 1`);
} catch (error) {
  console.error(`Cannot reach the database at ${env.databaseUrl.replace(/:[^:@/]+@/, ":****@")}`);
  console.error("Run `pnpm --filter @ilm/server db:setup` to create and seed it.");
  throw error;
}

const app = createApp({
  db,
  allowedOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
});

const server = serve({ fetch: app.fetch, port: env.port, hostname: "127.0.0.1" }, (info) => {
  console.log(`Ilm API listening on http://127.0.0.1:${info.port} (${env.nodeEnv})`);
});

let closing = false;
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    if (closing) return;
    closing = true;
    console.log(`\n${signal} received, shutting down`);
    server.close(() => {
      void pool.end().then(() => process.exit(0));
    });
  });
}
