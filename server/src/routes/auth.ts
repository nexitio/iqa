/**
 * Authentication.
 *
 * Four routes: create an account, sign in, sign out, and ask who the caller is.
 * Signing in issues a session cookie (see `src/auth/session.ts`); every other
 * route in the API reads the caller from that cookie and nothing else.
 *
 * Three rules hold throughout:
 *
 *  - **No user enumeration.** A wrong password and an unknown address produce
 *    the same 401 with the same message, and an unknown address still pays for a
 *    password verification, so response time does not reveal which addresses are
 *    registered.
 *  - **No privilege from the client.** Registration always creates a `user`;
 *    a `role` in the request body is ignored, never validated. Becoming a
 *    scholar or an admin is a decision for the admin console.
 *  - **Hashes never leave the database.** Credentials live in their own table
 *    and are only ever read by the login lookup.
 */

import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { AppBindings } from "../context.ts";
import { issueSession } from "../auth/login.ts";
import { assertPasswordPolicy } from "../auth/credentials.ts";
import { avatarColorFor, defaultDistrictId } from "../users/defaults.ts";
import { hashPassword, verifyPassword } from "../auth/password.ts";
import {
  clearSessionCookie,
  readSessionToken,
  resolveSession,
  revokeSession,
} from "../auth/session.ts";
import {
  createPendingLogin,
  factorsForLogin,
  purgeExpiredChallenges,
  recoveryCodesRemaining,
  verifiedFactors,
} from "../mfa/service.ts";
import { userFollowing } from "../db/relations.ts";
import * as schema from "../db/schema/index.ts";
import { readJsonBody } from "../http/body.ts";
import { badRequest, forbidden, HttpError, unauthorized } from "../http/errors.ts";
import { callerKey, rateLimit, rateLimitReset } from "../http/rate-limit.ts";
import { toUser } from "../present/dto.ts";

export const authRoutes = new Hono<AppBindings>();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const BAD_CREDENTIALS = "Email or password is incorrect";

/**
 * A real hash of a throwaway string, verified against when the email matches no
 * account — so the failing branch costs the same as the succeeding one.
 */
const decoyHash = hashPassword(randomBytes(24).toString("base64url"));

/** See the note in `http/rate-limit.ts` about in-process counters. */
const LOGIN_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
/**
 * A backstop against a sign-up flood, not a defence — and `server:smoke` spends
 * two of these per run from one address, so it has to leave room for a re-run.
 */
const REGISTER_ATTEMPTS = 20;
const REGISTER_WINDOW_MS = 60 * 60 * 1000;

function tooManyRequests(retryAfterSeconds: number): HttpError {
  return new HttpError(
    429,
    `Too many attempts. Try again in ${retryAfterSeconds} second(s).`,
  );
}

/** Every answer from here is specific to one caller. */
authRoutes.use("*", async (c, next) => {
  await next();
  c.header("cache-control", "private, no-store");
});

authRoutes.post("/auth/register", async (c) => {
  const db = c.get("db");
  const body = await readJsonBody<{
    name?: string;
    email?: string;
    password?: string;
    district?: string;
  }>(c);

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const requestedDistrict = body.district?.trim();

  if (!name || name.length < 2 || name.length > 80) {
    throw badRequest("name must be between 2 and 80 characters");
  }
  if (!email || !EMAIL_PATTERN.test(email) || email.length > 200) {
    throw badRequest("A valid email address is required");
  }
  assertPasswordPolicy(password);

  // Counted after the shape check on purpose: a request that is rejected for
  // being malformed has done no work, and charging it against the budget would
  // let a typo lock a real person out of signing up.
  const limit = rateLimit(`register:${callerKey(c)}`, REGISTER_ATTEMPTS, REGISTER_WINDOW_MS);
  if (!limit.allowed) throw tooManyRequests(limit.retryAfterSeconds);

  // A chosen district has to exist; when none is chosen, the shared default is
  // resolved the same way social sign-in resolves it.
  if (requestedDistrict) {
    const [knownDistrict] = await db
      .select({ id: schema.districts.id })
      .from(schema.districts)
      .where(eq(schema.districts.id, requestedDistrict))
      .limit(1);
    if (!knownDistrict) throw badRequest(`Unknown district "${requestedDistrict}"`);
  }
  const district = requestedDistrict ?? (await defaultDistrictId(db));

  const [existing] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  if (existing) throw new HttpError(409, "That email is already registered");

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const userId = `user-${randomBytes(6).toString("hex")}`;
  const avatarColor = avatarColorFor(userId);

  // One transaction: an account whose credentials failed to insert could never
  // sign in, which is worse than the request failing outright.
  await db.transaction(async (tx) => {
    await tx.insert(schema.users).values({
      id: userId,
      name,
      email,
      // Fixed, never read from the body: see the note at the top of the file.
      role: "user",
      avatarColor,
      district,
      joinedAt: now,
      scholarId: null,
      interests: [],
      isVerified: false,
      status: "active",
      contributions: 0,
    });

    await tx.insert(schema.authCredentials).values({
      userId,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  });

  return c.json({ data: await issueSession(c, userId) }, 201);
});

authRoutes.post("/auth/login", async (c) => {
  const db = c.get("db");
  const body = await readJsonBody<{ email?: string; password?: string }>(c);

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) throw badRequest("email and password are required");

  // Keyed on the account under attack, not on the caller: this is the budget
  // that actually protects a password, and it does not depend on forwarding
  // headers being set correctly.
  const limit = rateLimit(`login:${email}`, LOGIN_ATTEMPTS, LOGIN_WINDOW_MS);
  if (!limit.allowed) throw tooManyRequests(limit.retryAfterSeconds);

  const [row] = await db
    .select({ user: schema.users, passwordHash: schema.authCredentials.passwordHash })
    .from(schema.users)
    .leftJoin(schema.authCredentials, eq(schema.authCredentials.userId, schema.users.id))
    .where(eq(schema.users.email, email))
    .limit(1);

  const ok = await verifyPassword(password, row?.passwordHash ?? (await decoyHash));
  if (!row || !row.passwordHash || !ok) throw unauthorized(BAD_CREDENTIALS);

  if (row.user.status !== "active") {
    throw forbidden("This account is suspended. Contact the administration.");
  }

  rateLimitReset(`login:${email}`);

  /**
   * A correct password only *starts* a sign-in when a second factor is enrolled.
   * What comes back is a five-minute pending token, not a session cookie, so a
   * stolen password reaches nothing on its own.
   */
  const factors = await verifiedFactors(db, row.user.id);
  if (factors.length > 0) {
    await purgeExpiredChallenges(db);
    const pending = await createPendingLogin(db, row.user.id);

    return c.json({
      data: {
        mfaRequired: true,
        pendingToken: pending.token,
        expiresAt: pending.expiresAt,
        factors: factorsForLogin(factors),
        recoveryCodesRemaining: await recoveryCodesRemaining(db, row.user.id),
      },
    });
  }

  return c.json({ data: await issueSession(c, row.user.id) });
});

authRoutes.post("/auth/logout", async (c) => {
  const db = c.get("db");
  const token = readSessionToken(c);

  // Idempotent on purpose: signing out twice, or with a stale cookie, succeeds.
  if (token) await revokeSession(db, token);
  clearSessionCookie(c);

  return c.json({ data: { signedOut: true } });
});

/**
 * Who the caller is, without the 401 `/me` answers with — the shape a page needs
 * to render either signed-in or signed-out.
 */
authRoutes.get("/auth/session", async (c) => {
  const db = c.get("db");
  const token = readSessionToken(c);
  const identity = token ? await resolveSession(db, token) : null;

  if (!identity) return c.json({ data: { user: null } });

  const [row] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, identity.userId))
    .limit(1);

  if (!row) return c.json({ data: { user: null } });

  return c.json({ data: { user: toUser(row, await userFollowing(db, row.id)) } });
});
