/**
 * Print the row count of every table in the database.
 *
 * There is no `psql` on this machine, so this is the quick way to see what the
 * last migration and seed actually did. Run it after `db:seed` and compare with
 * the mock dataset in `src/lib/data`.
 */

import { sql } from "drizzle-orm";
import { createDatabase, createPool } from "../src/db/index.ts";

const pool = createPool();
const db = createDatabase(pool);

try {
  const tables = await db.execute<{ table_name: string }>(sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `);

  let total = 0;
  for (const { table_name } of tables.rows) {
    const counted = await db.execute<{ n: number }>(
      sql`select count(*)::int as n from ${sql.identifier(table_name)}`,
    );
    const n = counted.rows[0]?.n ?? 0;
    total += n;
    console.log(`${String(n).padStart(6)}  ${table_name}`);
  }
  console.log(`${String(total).padStart(6)}  TOTAL across ${tables.rows.length} tables`);
} finally {
  await pool.end();
}
