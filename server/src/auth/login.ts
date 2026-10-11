/**
 * Handing out a session.
 *
 * One function so that every way of finishing a login — password alone, a code, a
 * passkey, a recovery code — ends in exactly the same state: the account is
 * re-read, a suspended one is refused, expired sessions are swept, and the cookie
 * is set. A second implementation of this is how one path quietly stops checking
 * something.
 */

import { eq } from "drizzle-orm";
import type { User } from "@/lib/types";
import type { AppContext } from "../context.ts";
import * as schema from "../db/schema/index.ts";
import { userFollowing } from "../db/relations.ts";
import { forbidden, unauthorized } from "../http/errors.ts";
import { toUser } from "../present/dto.ts";
import {
  openSession,
  purgeExpiredSessions,
  setSessionCookie,
} from "./session.ts";

export async function issueSession(c: AppContext, userId: string): Promise<User> {
  const db = c.get("db");

  const [row] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1);

  if (!row) throw unauthorized("This account no longer exists.");
  if (row.status !== "active") {
    throw forbidden("This account is suspended. Contact the administration.");
  }

  await purgeExpiredSessions(db);

  const token = await openSession(db, userId, c.req.header("user-agent"));
  setSessionCookie(c, token);

  return toUser(row, await userFollowing(db, row.id));
}
