/**
 * The database handle.
 *
 * One pool per process, built from `DATABASE_URL`. Route handlers take `db` from
 * Hono's context (`c.get("db")`) rather than importing it, so a request-scoped
 * client or a test transaction can be swapped in later without touching them.
 */

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../env.ts";
import * as schema from "./schema/index.ts";

export type Database = NodePgDatabase<typeof schema>;

export function createPool(connectionString: string = env.databaseUrl) {
  return new Pool({ connectionString, max: 10 });
}

export function createDatabase(pool: Pool): Database {
  return drizzle(pool, { schema });
}

export { schema };
