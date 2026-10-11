/**
 * Account security: the password, and the devices signed in with it.
 *
 * Both routes exist because a session is a *capability* — anything holding one can
 * use the account until it expires. Changing the password and ending other devices
 * are how a reader takes that back, so neither is allowed to be a no-op:
 *
 *  - A password change signs every other device out, not just the one that asked.
 *  - The device list is scoped to the account from the session, never from the
 *    request, and the session in use cannot be revoked through it — that is what
 *    `POST /auth/logout` is for, and it can also clear the cookie.
 */

import { Hono } from "hono";
import {
  assertPasswordPolicy,
  credentialHash,
  requireAccountPassword,
  setPassword,
} from "../auth/credentials.ts";
import { verifyPassword } from "../auth/password.ts";
import {
  listSessions,
  revokeOtherSessions,
  revokeSessionById,
} from "../auth/session.ts";
import { requireIdentity, type AppBindings } from "../context.ts";
import { readJsonBody } from "../http/body.ts";
import { badRequest, HttpError, notFound } from "../http/errors.ts";
import { rateLimit, rateLimitReset } from "../http/rate-limit.ts";
import { clearPendingLogins } from "../mfa/service.ts";

export const accountRoutes = new Hono<AppBindings>();

/** Changing a password verifies the current one, so it is guessing surface too. */
const PASSWORD_ATTEMPTS = 10;
const PASSWORD_WINDOW_MS = 15 * 60 * 1000;

accountRoutes.use("*", async (c, next) => {
  await next();
  // The device list and the password are not for any cache to hold.
  c.header("cache-control", "private, no-store");
});

accountRoutes.post("/me/password", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await readJsonBody<{ currentPassword?: string; newPassword?: string }>(c);

  const limit = rateLimit(
    `password:${identity.userId}`,
    PASSWORD_ATTEMPTS,
    PASSWORD_WINDOW_MS,
  );
  if (!limit.allowed) {
    throw new HttpError(
      429,
      `Too many attempts. Try again in ${limit.retryAfterSeconds} second(s).`,
    );
  }

  if (typeof body.newPassword !== "string") throw badRequest("newPassword is required");
  assertPasswordPolicy(body.newPassword);
  await requireAccountPassword(db, identity.userId, body.currentPassword);

  // A "change" that changes nothing keeps a leaked password alive while looking
  // like it was dealt with, so it is refused rather than silently accepted.
  const current = await credentialHash(db, identity.userId);
  if (current && (await verifyPassword(body.newPassword, current))) {
    throw badRequest("The new password must be different from the current one");
  }

  await setPassword(db, identity.userId, body.newPassword);
  // A change that worked clears the budget, so typos before it cannot leave a
  // reader locked out of their own security settings.
  rateLimitReset(`password:${identity.userId}`);

  // The point of the change: everything signed in with the old password loses
  // access now. The device that asked, and proved it knows the old password,
  // stays signed in.
  const otherSessionsRevoked = await revokeOtherSessions(db, identity.userId, identity.sessionId);
  await clearPendingLogins(db, identity.userId);

  return c.json({ data: { updated: true, otherSessionsRevoked } });
});

accountRoutes.get("/me/sessions", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  return c.json({ data: await listSessions(db, identity.userId, identity.sessionId) });
});

/**
 * Sign out everywhere else. Declared before the `:id` route for the sake of
 * readers; Hono matches the two patterns distinctly either way.
 */
accountRoutes.delete("/me/sessions", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  const revoked = await revokeOtherSessions(db, identity.userId, identity.sessionId);
  return c.json({ data: { revoked, kept: identity.sessionId } });
});

accountRoutes.delete("/me/sessions/:id", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const id = c.req.param("id");

  // Revoking the session in use would leave the browser holding a cookie for a
  // session that no longer exists — signed out, but with no way to say why.
  if (id === identity.sessionId) {
    throw badRequest(
      "This is the device you are using. Use POST /auth/logout to sign out of it.",
    );
  }

  const removed = await revokeSessionById(db, identity.userId, id);
  // Scoped to the session's owner, so another account's session id is a 404 and
  // never a hint that it exists.
  if (!removed) throw notFound("No such session");

  return c.json({ data: { id, revoked: true } });
});
