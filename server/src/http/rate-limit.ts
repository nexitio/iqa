/**
 * A fixed-window rate limiter for the credential endpoints.
 *
 * Deliberately in-process and small: it exists to make password guessing and
 * sign-up floods expensive on this deployment, not to be a shared quota.
 *
 * Limitation worth knowing: the counters live in this process's memory, so with
 * more than one API instance each holds its own window, and a restart clears
 * them. A real deployment swaps the `Map` for Redis; nothing outside this module
 * needs to change.
 */

import type { Context } from "hono";

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

/** Above this many keys, expired windows are swept so the map cannot grow forever. */
const SWEEP_THRESHOLD = 5_000;

function sweep(now: number): void {
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Counts one attempt against `key`. Call it only when the attempt is about to be
 * acted on, so a successful sign-in still costs an attempt.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();

  if (windows.size > SWEEP_THRESHOLD) sweep(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

/** Clears a key after a successful sign-in, so a valid login resets the budget. */
export function rateLimitReset(key: string): void {
  windows.delete(key);
}

/**
 * The key a credential endpoint is budgeted against before it knows who is asking.
 *
 * A forwarded address is preferred when a proxy sets one, because a single origin
 * can front many people; the `Origin` header is the fallback a browser always
 * sends on a write, and it is what the dev server's calls carry. Shared here so the
 * password routes and the passkey routes cannot key the same person differently.
 */
export function callerKey(c: Context): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("origin") || "local"
  );
}
