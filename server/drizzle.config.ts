import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config();

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error("Missing DATABASE_URL. Copy server/.env.example to server/.env and fill it in.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema",
  out: "./drizzle",
  dbCredentials: { url },
  verbose: true,
  strict: true,
});
