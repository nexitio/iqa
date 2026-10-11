/**
 * Request context.
 *
 * `db` is created once for the process and injected per request, so handlers
 * never import a global client. `identity` is whoever the session cookie names —
 * resolved once per request in `app.ts` from `src/auth/session.ts`, which is the
 * only place a caller is read from.
 *
 * Handlers never reassemble an identity themselves: `requireIdentity` and
 * `requireRole` below are the whole surface, so replacing how a caller is
 * authenticated never reaches a route module.
 */

import type { Context } from "hono";
import type { Role } from "@/lib/types";
import type { Database } from "./db/index.ts";
import type { users } from "./db/schema/people.ts";
import { forbidden, unauthorized } from "./http/errors.ts";

/** The account standing column, so `users.status === "suspended"` stays checked. */
export type UserStatus = (typeof users)["$inferSelect"]["status"];

export interface Identity {
  userId: string;
  role: Role;
  status: UserStatus;
  /** The session row's id (the token hash), not the token itself. */
  sessionId: string;
}

export interface AppBindings {
  Variables: {
    db: Database;
    identity: Identity | null;
  };
}

export type AppContext = Context<AppBindings>;

/** The signed-in user, or 401. Used by every `/me` route. */
export function requireIdentity(c: AppContext): Identity {
  const identity = c.get("identity");
  if (!identity) throw unauthorized("Sign in to continue.");
  // A suspension that lands mid-session takes effect on the next request,
  // because the status is read from the account, not carried in the cookie.
  if (identity.status !== "active") {
    throw forbidden("This account is suspended. Contact the administration.");
  }
  return identity;
}

/** A write that only staff may make. */
export function requireRole(c: AppContext, ...allowed: Role[]): Identity {
  const identity = requireIdentity(c);
  if (!allowed.includes(identity.role)) {
    throw forbidden(`Requires one of: ${allowed.join(", ")}`);
  }
  return identity;
}
