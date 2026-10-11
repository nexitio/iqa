/**
 * Apply every pending migration in `server/drizzle`.
 *
 * Drizzle's migrator is idempotent — it records applied migrations in
 * `drizzle.__drizzle_migrations` — so this is safe to run on every boot.
 */

import { fileURLToPath } from "node:url";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDatabase, createPool } from "../src/db/index.ts";

const migrationsFolder = fileURLToPath(new URL("../drizzle", import.meta.url));
const pool = createPool();

try {
  await migrate(createDatabase(pool), { migrationsFolder });
  console.log("migrations applied");
} finally {
  await pool.end();
}
