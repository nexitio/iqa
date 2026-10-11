/**
 * Who is signed in, as the app's server sees it.
 *
 * The session itself lives in the API — the app never validates a token and never
 * holds one it can read. What it holds is the API's own cookie, relayed onto this
 * origin by the route handlers under `/api/auth`, and this module's job is to hand
 * that cookie back to the API and believe its answer. There is exactly one place
 * that decides whether a caller is signed in, and it is not here.
 *
 * Two consequences worth stating, because both are deliberate:
 *
 *  - **The app cannot outlive the API's own rules.** A revoked or expired session
 *    answers `user: null` on the next request, because the answer comes from the
 *    row, not from a cookie the app signed.
 *  - **Nothing here touches the token.** It is `HttpOnly` on this origin too, so
 *    no client component can read it and no XSS can steal it from script.
 */

import { cookies } from "next/headers";
import { cache } from "react";
import { serverApiUrl } from "./api-server";
import type { User } from "./types";

/** Mirrors the API's cookie name — see `server/src/auth/session.ts`. */
export const SESSION_COOKIE = "ilm_session";

/** Long enough for a healthy round trip, short enough not to hold a page hostage. */
const SESSION_TIMEOUT_MS = 2500;

/**
 * The signed-in account, or null.
 *
 * Wrapped in React's `cache` so a page that renders a header, a sidebar and a
 * footer still makes one call per request rather than three.
 */
export const getSessionUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(serverApiUrl("/api/v1/auth/session"), {
      headers: { cookie: `${SESSION_COOKIE}=${token}`, accept: "application/json" },
      // Per request, always: a cached "signed in" is how a signed-out tab keeps
      // rendering someone's name.
      cache: "no-store",
      signal: AbortSignal.timeout(SESSION_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error(`Session read failed: the API answered ${response.status}.`);
      return null;
    }

    const payload: unknown = await response.json();
    const user = (payload as { data?: { user?: unknown } }).data?.user;
    return isUser(user) ? user : null;
  } catch (error) {
    // An unreachable API is not a 500 on every page — it is nobody being signed
    // in — but it is reported rather than passed over in silence.
    console.error("Session read failed:", error);
    return null;
  }
});

/**
 * The cookie an authenticated server-side call should carry, or null.
 *
 * Separate from `getSessionUser` so a call can forward the session without
 * paying for the session read first.
 */
export async function sessionCookieHeader(): Promise<string | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? `${SESSION_COOKIE}=${token}` : null;
}

/**
 * The API is the authority on what a user is, but it is still another service:
 * only the fields this app renders are accepted, so a changed or compromised
 * response cannot inject an unexpected shape into the UI.
 */
function isUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;

  const user = value as Record<string, unknown>;
  const strings = ["id", "name", "email", "role", "avatarColor", "district", "joinedAt"];
  if (!strings.every((field) => typeof user[field] === "string" && user[field])) return false;

  const arrays = ["interests", "followingScholarIds", "followingDepartmentSlugs"];
  if (!arrays.every((field) => Array.isArray(user[field]))) return false;

  return typeof user.isVerified === "boolean";
}
