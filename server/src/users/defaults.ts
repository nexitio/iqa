/**
 * What a new account is filled in with.
 *
 * Registration and social sign-in both create accounts, and both need the same
 * two arbitrary-but-required values: an avatar colour and a district. Two copies
 * of that list would drift, and a district that is not in the table is a foreign
 * key violation rather than a cosmetic problem, so the lookup lives here too.
 */

import { asc, eq } from "drizzle-orm";
import type { Database } from "../db/index.ts";
import * as schema from "../db/schema/index.ts";
import { HttpError } from "../http/errors.ts";

/** Drawn from the palette the frontend already renders. */
export const AVATAR_COLORS = [
  "#0d6b4f",
  "#1f6f9e",
  "#a3405f",
  "#8a5a1f",
  "#4a3f8f",
  "#1f7a6a",
];

/** Any stable function of the id will do; it only has to be consistent. */
export function avatarColorFor(seed: string): string {
  let hash = 0;
  for (const character of seed) hash = (hash * 31 + character.charCodeAt(0)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]!;
}

/**
 * The district an account is filed under when it did not choose one.
 *
 * Prefers Dhaka, falls back to whatever exists, and refuses to guess if the
 * districts table is empty — a missing seed is a setup problem worth reporting,
 * not something to paper over with an invalid id.
 */
export async function defaultDistrictId(db: Database): Promise<string> {
  const [dhaka] = await db
    .select({ id: schema.districts.id })
    .from(schema.districts)
    .where(eq(schema.districts.id, "dhaka"))
    .limit(1);
  if (dhaka) return dhaka.id;

  const [any] = await db
    .select({ id: schema.districts.id })
    .from(schema.districts)
    .orderBy(asc(schema.districts.id))
    .limit(1);
  if (any) return any.id;

  throw new HttpError(500, "No districts are seeded, so an account cannot be created.");
}
