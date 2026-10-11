/** Liveness and a quick sense of what the database holds. */

import { sql } from "drizzle-orm";
import { Hono } from "hono";
import type { AppBindings } from "../context.ts";

export const healthRoutes = new Hono<AppBindings>();

healthRoutes.get("/health", async (c) => {
  const db = c.get("db");
  const startedAt = Date.now();
  await db.execute(sql`select 1`);

  return c.json({
    ok: true,
    database: { status: "up", latencyMs: Date.now() - startedAt },
    uptimeSeconds: Math.round(process.uptime()),
    version: "v1",
  });
});

/** Row counts per domain — the quickest way to tell a bad seed from a bad query. */
healthRoutes.get("/status", async (c) => {
  const db = c.get("db");
  const counts = await db.execute<{
    surahs: number;
    ayahs: number;
    hadiths: number;
    duas: number;
    articles: number;
    fatwas: number;
    questions: number;
    answers: number;
    scholars: number;
    users: number;
  }>(sql`
    select
      (select count(*)::int from quran_surahs) as surahs,
      (select count(*)::int from quran_ayahs) as ayahs,
      (select count(*)::int from hadiths) as hadiths,
      (select count(*)::int from duas) as duas,
      (select count(*)::int from articles) as articles,
      (select count(*)::int from fatwas) as fatwas,
      (select count(*)::int from questions) as questions,
      (select count(*)::int from answers) as answers,
      (select count(*)::int from scholars) as scholars,
      (select count(*)::int from users) as users
  `);

  return c.json({ ok: true, counts: counts.rows[0] });
});
