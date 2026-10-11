/**
 * Sessions.
 *
 * A session is a 32-byte random token the caller holds in an HttpOnly cookie.
 * The database stores only its SHA-256, so the table is a list of *claims* and
 * nothing in it can be replayed against the API.
 *
 * Everything a request needs to know about the caller comes from
 * `resolveSession`, and everything that ends a session goes through
 * `revokeSession` — so signing out everywhere later is one call, not an audit.
 */

import { createHash, randomBytes } from "node:crypto";
import { and, desc, eq, gt, lt, ne } from "drizzle-orm";
import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import type { Role } from "@/lib/types";
import type { Database } from "../db/index.ts";
import * as schema from "../db/schema/index.ts";
import { env } from "../env.ts";
import { describeUserAgent } from "./device.ts";

export const SESSION_COOKIE = "ilm_session";

/** Thirty days. A reader should not be signed out mid-journey. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

/** At most one `last_seen_at` write per session per five minutes. */
const TOUCH_INTERVAL_MS = 5 * 60 * 1000;

/** Cookies are written in exactly one place, so attributes cannot drift apart. */
const SAME_SITE: Record<"lax" | "strict" | "none", "Lax" | "Strict" | "None"> = {
  lax: "Lax",
  strict: "Strict",
  none: "None",
};

const COOKIE_ATTRIBUTES: CookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: SAME_SITE[env.cookieSameSite],
  secure: env.cookieSecure,
};

export interface SessionIdentity {
  userId: string;
  role: Role;
  status: (typeof schema.users.$inferSelect)["status"];
  /**
   * The session's own public id — what a device list shows, and what "this is the
   * device you are using" is decided by. Never the token, and never its hash.
   */
  sessionId: string;
}

/** One signed-in device, as the account screen sees it. */
export interface SessionSummary {
  id: string;
  /** The raw header, for a client that wants its own parsing. */
  userAgent: string | null;
  /** A coarse label derived from that header — a hint, not an identification. */
  device: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  /** True for the session making the request. */
  current: boolean;
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Random and unrelated to the token, so publishing it gives nothing away. */
function createSessionId(): string {
  return `sess-${randomBytes(8).toString("hex")}`;
}

/** The raw token from the request cookie, if the caller sent one. */
export function readSessionToken(c: Context): string | undefined {
  return getCookie(c, SESSION_COOKIE) || undefined;
}

export function setSessionCookie(c: Context, token: string): void {
  setCookie(c, SESSION_COOKIE, token, { ...COOKIE_ATTRIBUTES, maxAge: SESSION_TTL_SECONDS });
}

export function clearSessionCookie(c: Context): void {
  // Same attributes, so the expiry actually matches the cookie being removed.
  deleteCookie(c, SESSION_COOKIE, COOKIE_ATTRIBUTES);
}

/** Records a new session row and returns the token to hand to the caller. */
export async function openSession(
  db: Database,
  userId: string,
  userAgent?: string,
): Promise<string> {
  const token = createSessionToken();
  const now = Date.now();

  await db.insert(schema.sessions).values({
    id: createSessionId(),
    tokenHash: hashSessionToken(token),
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_SECONDS * 1000).toISOString(),
    lastSeenAt: new Date(now).toISOString(),
    userAgent: userAgent?.slice(0, 300) ?? null,
  });

  return token;
}

/**
 * The session a token names, or null when it is unknown, expired, or its user is
 * gone. Role and status come from the `users` row, so an account demoted or
 * suspended mid-session takes effect on the very next request.
 */
export async function resolveSession(
  db: Database,
  token: string,
): Promise<SessionIdentity | null> {
  const now = new Date().toISOString();

  const [row] = await db
    .select({
      id: schema.sessions.id,
      lastSeenAt: schema.sessions.lastSeenAt,
      user: schema.users,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(
      and(
        eq(schema.sessions.tokenHash, hashSessionToken(token)),
        gt(schema.sessions.expiresAt, now),
      ),
    )
    .limit(1);

  if (!row) return null;

  // Refreshed lazily rather than on every request: the comparison is in memory,
  // so a reader browsing the site pays nothing for it.
  if (Date.now() - Date.parse(row.lastSeenAt) > TOUCH_INTERVAL_MS) {
    await db
      .update(schema.sessions)
      .set({ lastSeenAt: now })
      .where(eq(schema.sessions.id, row.id));
  }

  return {
    userId: row.user.id,
    role: row.user.role,
    status: row.user.status,
    sessionId: row.id,
  };
}

/**
 * Every live session on an account, the caller's own first.
 *
 * Expired rows are filtered out rather than swept, so the screen never shows a
 * device the reader cannot actually still be signed in on.
 */
export async function listSessions(
  db: Database,
  userId: string,
  currentSessionId: string,
): Promise<SessionSummary[]> {
  const rows = await db
    .select()
    .from(schema.sessions)
    .where(
      and(eq(schema.sessions.userId, userId), gt(schema.sessions.expiresAt, new Date().toISOString())),
    )
    .orderBy(desc(schema.sessions.lastSeenAt));

  return rows
    .map((row) => ({
      id: row.id,
      userAgent: row.userAgent,
      device: describeUserAgent(row.userAgent),
      createdAt: row.createdAt,
      lastSeenAt: row.lastSeenAt,
      expiresAt: row.expiresAt,
      current: row.id === currentSessionId,
    }))
    // `sort` is stable, so the most-recent-first order above survives.
    .sort((a, b) => Number(b.current) - Number(a.current));
}

/** Ends one session, scoped to its owner. False when it was not theirs. */
export async function revokeSessionById(
  db: Database,
  userId: string,
  sessionId: string,
): Promise<boolean> {
  const removed = await db
    .delete(schema.sessions)
    .where(and(eq(schema.sessions.userId, userId), eq(schema.sessions.id, sessionId)))
    .returning();
  return removed.length > 0;
}

/**
 * Ends everything except one session, and reports how many were ended.
 *
 * One statement rather than a read-then-delete, so two requests cannot interleave
 * into leaving a session the caller meant to end.
 */
export async function revokeOtherSessions(
  db: Database,
  userId: string,
  keepSessionId: string,
): Promise<number> {
  const removed = await db
    .delete(schema.sessions)
    .where(and(eq(schema.sessions.userId, userId), ne(schema.sessions.id, keepSessionId)))
    .returning();
  return removed.length;
}

/** Ends one session. Signing out twice is not an error. */
export async function revokeSession(db: Database, token: string): Promise<void> {
  await db.delete(schema.sessions).where(eq(schema.sessions.tokenHash, hashSessionToken(token)));
}

/** Housekeeping, run on sign-in so the table does not accumulate dead rows. */
export async function purgeExpiredSessions(db: Database): Promise<void> {
  await db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date().toISOString()));
}
