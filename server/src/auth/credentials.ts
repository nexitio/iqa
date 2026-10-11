/**
 * Account passwords: one policy and one verification.
 *
 * Registration, a password change and every second-factor change all have to agree
 * on what a password must be and on what "the current password is correct" means.
 * Holding both here is what stops the rules from drifting apart — a change route
 * that accepted a shorter password than registration would quietly be the weakest
 * door in the product.
 */

import { eq } from "drizzle-orm";
import type { Database } from "../db/index.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest, unauthorized } from "../http/errors.ts";
import { hashPassword, verifyPassword } from "./password.ts";

export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 200;

export function assertPasswordPolicy(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw badRequest(
      `password must be between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters`,
    );
  }
}

/** The stored digest, or null when the account has no credentials row. */
export async function credentialHash(db: Database, userId: string): Promise<string | null> {
  const [row] = await db
    .select({ passwordHash: schema.authCredentials.passwordHash })
    .from(schema.authCredentials)
    .where(eq(schema.authCredentials.userId, userId))
    .limit(1);
  return row?.passwordHash ?? null;
}

/**
 * Proves the caller knows the account's password, or throws.
 *
 * Every route that changes how an account is protected goes through this, because
 * a session cookie alone is not consent: someone holding a stolen session must not
 * be able to add a factor or change the password underneath the real owner.
 */
export async function requireAccountPassword(
  db: Database,
  userId: string,
  password: unknown,
): Promise<void> {
  if (typeof password !== "string" || password.length === 0) {
    throw badRequest("Your current password is required");
  }

  const hash = await credentialHash(db, userId);
  const matches = hash ? await verifyPassword(password, hash) : false;
  if (!matches) throw unauthorized("That password is not correct.");
}

/** Sets or replaces the password. Upsert, so an account without one still works. */
export async function setPassword(
  db: Database,
  userId: string,
  password: string,
): Promise<void> {
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);

  await db
    .insert(schema.authCredentials)
    .values({ userId, passwordHash, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({
      target: schema.authCredentials.userId,
      set: { passwordHash, updatedAt: now },
    });
}
