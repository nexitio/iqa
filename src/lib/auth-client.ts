/**
 * The browser's side of signing in.
 *
 * Every call goes to this app's own `/api/auth/*`, never to the API directly: the
 * session cookie belongs to this origin, and a page that reached across origins
 * for it would be back to depending on `SameSite` and CORS to be right.
 *
 * The API's answer envelope is unwrapped here and nowhere else, so a form deals
 * with `{ ok: true, data }` or `{ ok: false, message }` rather than with status
 * codes. What it does not do is translate: the message is the API's own, which is
 * the one that matches the rule that was actually broken.
 */

import type { User } from "./types";

export interface MfaFactor {
  id: string;
  kind: "email" | "sms" | "passkey";
  label: string | null;
  /** Already masked by the API — a hint about which device, not the address itself. */
  destination: string | null;
}

/** A sign-in that proved the password and now needs the second factor. */
export interface PendingSecondFactor {
  pendingToken: string;
  expiresAt: string;
  factors: MfaFactor[];
  recoveryCodesRemaining: number;
}

export interface Challenge {
  challengeId: string;
  kind: "email" | "sms";
  destination: string | null;
  expiresAt: string;
  minutes: number;
  /** Only set in development, where the console driver sends nothing. */
  devCode?: string;
}

export type AuthResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

async function call<T>(path: string, body: unknown): Promise<AuthResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0, message: "Could not reach the server. Check your connection." };
  }

  const payload: unknown = await response.json().catch(() => null);
  const envelope = payload as { data?: T; error?: { message?: string } } | null;

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: envelope?.error?.message ?? "Something went wrong. Try again.",
    };
  }

  return { ok: true, data: envelope?.data as T };
}

/** One outcome for the form: either the account, or the factor still to clear. */
export interface SignInOutcome {
  user: User | null;
  /** The API says a code is needed; the form asks for it instead of redirecting. */
  secondFactor: PendingSecondFactor | null;
}

export async function signIn(input: {
  email: string;
  password: string;
  remember: boolean;
}): Promise<AuthResult<SignInOutcome>> {
  const result = await call<Record<string, unknown>>("/api/auth/login", input);
  if (!result.ok) return result;

  const data = result.data;
  // A correct password only starts a sign-in when a factor is enrolled; the API
  // answers with a five-minute pending token instead of a session.
  if (data.mfaRequired === true && typeof data.pendingToken === "string") {
    return {
      ok: true,
      data: {
        user: null,
        secondFactor: {
          pendingToken: data.pendingToken,
          expiresAt: String(data.expiresAt ?? ""),
          factors: Array.isArray(data.factors) ? (data.factors as MfaFactor[]) : [],
          recoveryCodesRemaining: Number(data.recoveryCodesRemaining ?? 0),
        },
      },
    };
  }

  return { ok: true, data: { user: data as unknown as User, secondFactor: null } };
}

export async function signUp(input: {
  name: string;
  email: string;
  password: string;
  district: string;
}): Promise<AuthResult<User>> {
  return call<User>("/api/auth/register", input);
}

export async function signOut(): Promise<AuthResult<{ signedOut: boolean }>> {
  return call<{ signedOut: boolean }>("/api/auth/logout", {});
}

export async function sendSecondFactorCode(input: {
  pendingToken: string;
  kind: "email" | "sms";
  factorId?: string;
}): Promise<AuthResult<Challenge>> {
  return call<Challenge>("/api/auth/mfa/challenge", input);
}

export async function verifySecondFactorCode(input: {
  pendingToken: string;
  challengeId: string;
  code: string;
}): Promise<AuthResult<User>> {
  return call<User>("/api/auth/mfa/verify", input);
}

/**
 * Named `redeem`, not `use`: a function beginning with "use" is a React hook by
 * convention, and the lint rule that enforces it is right — this is a request.
 */
export async function redeemRecoveryCode(input: {
  pendingToken: string;
  code: string;
}): Promise<AuthResult<User>> {
  return call<User>("/api/auth/mfa/recovery", input);
}
