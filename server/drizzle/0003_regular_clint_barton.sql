-- A session gains a public id, and the token hash becomes a unique credential
-- rather than the primary key. Hand-written where drizzle-kit's version was not
-- safe: it emitted `ADD COLUMN "id" text PRIMARY KEY NOT NULL` in one statement,
-- which fails on a table that already holds a signed-in browser. Adding the
-- column nullable, backfilling, then requiring it works on any database.
ALTER TABLE "sessions" ADD COLUMN "id" text;--> statement-breakpoint
UPDATE "sessions"
SET "id" = 'sess-' || substr(md5(random()::text || "token_hash"), 1, 16)
WHERE "id" IS NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_pkey";--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions" USING btree ("token_hash");
