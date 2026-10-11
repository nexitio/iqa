/**
 * Create the application database if it does not exist.
 *
 * Connects to the server's default `postgres` database (nothing can create a
 * database from inside the database being created), checks `pg_database`, and
 * only then runs `CREATE DATABASE`. Re-running it is a no-op.
 */

import { Client } from "pg";
import { env } from "../src/env.ts";

const databaseName = decodeURIComponent(new URL(env.databaseUrl).pathname.replace(/^\//, ""));

if (!databaseName) {
  throw new Error(`No database name in DATABASE_URL (${env.databaseUrl}).`);
}

const admin = new Client({ connectionString: env.databaseAdminUrl });

try {
  await admin.connect();
  const existing = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [
    databaseName,
  ]);

  if (existing.rowCount === 0) {
    // The name comes from our own env file, not from a request; quote it anyway.
    await admin.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
    console.log(`created database ${databaseName}`);
  } else {
    console.log(`database ${databaseName} already exists`);
  }
} finally {
  await admin.end();
}
