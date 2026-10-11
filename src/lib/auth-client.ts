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

import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import type { Localized, User } from "./types";

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

/**
 * One request to this app's own `/api/*`, with the API's envelope unwrapped.
 *
 * Shared with `./social-client`: the console and the credential forms deal with
 * the same `{ ok, data } | { ok: false, message }` shape, and a second copy of
 * this would be a second place for the envelope to be read differently.
 */
export async function request<T>(
  path: string,
  init: { method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown },
): Promise<AuthResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: init.method,
      // A bodyless call sends no content-type either: a GET with a JSON header and
      // nothing in it is a lie some proxies act on.
      headers: init.body === undefined ? undefined : { "content-type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
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

/** Every credential call is a POST; the account surface below names its method. */
async function call<T>(path: string, body: unknown): Promise<AuthResult<T>> {
  return request<T>(path, { method: "POST", body });
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

/** The assertion options a passkey sign-in must answer, and the challenge they belong to. */
export interface PasskeyChallenge {
  challengeId: string;
  options: PublicKeyCredentialRequestOptionsJSON;
}

/**
 * Begins a passkey sign-in. Keyed by the pending token, like every other step of
 * a half-finished sign-in, so this can only ever continue an attempt whose
 * password was already proved.
 */
export async function startPasskeySignIn(input: {
  pendingToken: string;
}): Promise<AuthResult<PasskeyChallenge>> {
  return call<PasskeyChallenge>("/api/auth/mfa/passkey/options", input);
}

/**
 * Finishes it with the browser's assertion — the same session a code would have
 * issued, because a passkey is not a different kind of signed in.
 */
export async function verifyPasskeySignIn(input: {
  pendingToken: string;
  challengeId: string;
  response: AuthenticationResponseJSON;
}): Promise<AuthResult<User>> {
  return call<User>("/api/auth/mfa/passkey/verify", input);
}

/**
 * Begins a passkey sign-in with nothing to begin from.
 *
 * This is the one credential call with no pending token and no email: it is what
 * the browser's own autofill is answering, on a page where nothing has been typed
 * yet. The challenge that comes back belongs to no account until the assertion
 * names a credential, which is why the pair below is separate from the one above
 * rather than the same function with an optional argument.
 */
export async function startAutofillPasskeySignIn(): Promise<AuthResult<PasskeyChallenge>> {
  return call<PasskeyChallenge>("/api/auth/passkey/options", {});
}

/**
 * Finishes it. The assertion is the only thing naming an account, so there is no
 * token to carry — and the session it issues is the same session every other way
 * in issues.
 */
export async function verifyAutofillPasskeySignIn(input: {
  challengeId: string;
  response: AuthenticationResponseJSON;
}): Promise<AuthResult<User>> {
  return call<User>("/api/auth/passkey/verify", input);
}

/* -------------------------------------------------------------------------- */
/* Managing second factors                                                    */
/* -------------------------------------------------------------------------- */

/**
 * What the account has enrolled, as the management screen reads it.
 *
 * `destination` arrives already masked — the API never echoes a full address or
 * number — so it is a hint for the owner ("the number ending 5678"), not a value
 * to compare against or re-send.
 */
export interface MfaStatus {
  enabled: boolean;
  factors: MfaFactor[];
  recoveryCodesRemaining: number;
}

/** A newly enrolled factor, plus the recovery codes when it was the first one. */
export interface EnrolledFactor {
  factor: MfaFactor;
  /** Issued with the *first* factor only, and shown exactly once. */
  recoveryCodes?: string[];
}

/** The server's registration options, paired with the challenge they answer. */
export interface PasskeyEnrollment {
  challengeId: string;
  options: PublicKeyCredentialCreationOptionsJSON;
}

export async function fetchMfaStatus(): Promise<AuthResult<MfaStatus>> {
  return request<MfaStatus>("/api/account/mfa", { method: "GET" });
}

export async function startEmailFactor(input: {
  password: string;
  email: string;
}): Promise<AuthResult<Challenge>> {
  return call<Challenge>("/api/account/mfa/email/start", input);
}

export async function confirmEmailFactor(input: {
  challengeId: string;
  code: string;
}): Promise<AuthResult<EnrolledFactor>> {
  return call<EnrolledFactor>("/api/account/mfa/email/confirm", input);
}

export async function startSmsFactor(input: {
  password: string;
  phone: string;
}): Promise<AuthResult<Challenge>> {
  return call<Challenge>("/api/account/mfa/sms/start", input);
}

export async function confirmSmsFactor(input: {
  challengeId: string;
  code: string;
}): Promise<AuthResult<EnrolledFactor>> {
  return call<EnrolledFactor>("/api/account/mfa/sms/confirm", input);
}

export async function startPasskeyEnrollment(input: {
  password: string;
}): Promise<AuthResult<PasskeyEnrollment>> {
  return call<PasskeyEnrollment>("/api/account/mfa/passkey/start", input);
}

export async function confirmPasskeyEnrollment(input: {
  challengeId: string;
  /** The browser's attestation, produced by `startRegistration` in the component. */
  response: RegistrationResponseJSON;
  label?: string;
}): Promise<AuthResult<EnrolledFactor>> {
  return call<EnrolledFactor>("/api/account/mfa/passkey/confirm", input);
}

/** Removing a factor re-asks for the password: a session alone must not be enough. */
export async function removeMfaFactor(input: {
  factorId: string;
  password: string;
}): Promise<AuthResult<{ id: string; removed: boolean; factorsRemaining: number }>> {
  return request(`/api/account/mfa/${encodeURIComponent(input.factorId)}`, {
    method: "DELETE",
    body: { password: input.password },
  });
}

export async function regenerateRecoveryCodes(input: {
  password: string;
}): Promise<AuthResult<{ recoveryCodes: string[] }>> {
  return call<{ recoveryCodes: string[] }>("/api/account/mfa/recovery-codes", input);
}

/** One device signed in to this account. */
export interface SessionSummary {
  id: string;
  /** The raw header, for a client that wants its own parsing. */
  userAgent: string | null;
  /** A coarse label derived from that header — a hint, not an identification. */
  device: string;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  /** True for the session making the request, which this surface cannot end. */
  current: boolean;
}

/** One provider attached to this account. */
export interface LinkedIdentity {
  id: string;
  provider: { slug: string; name: Localized };
  /** The provider's own key for this person, which is what a sign-in matches on. */
  subject: string;
  email: string | null;
  displayName: string | null;
  picture: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

/**
 * The account-security surface: the devices a session is open on, the password, and
 * the providers attached to the account.
 *
 * None of these rules are here — the API verifies the password, refuses to revoke
 * the session making the request, and decides whether an unlink needs a password at
 * all. This module's job is to name the calls and type their answers, so a page can
 * ask rather than reimplement.
 */
export async function fetchSessions(): Promise<AuthResult<SessionSummary[]>> {
  return request<SessionSummary[]>("/api/account/sessions", { method: "GET" });
}

/** Ends one device. The API answers 400 for the caller's own session. */
export async function revokeSession(id: string): Promise<AuthResult<{ id: string; revoked: boolean }>> {
  return request(`/api/account/sessions/${encodeURIComponent(id)}`, { method: "DELETE" });
}

/** Signs out every device except this one. */
export async function revokeOtherSessions(): Promise<
  AuthResult<{ revoked: number; kept: string }>
> {
  return request("/api/account/sessions", { method: "DELETE" });
}

/**
 * Changing the password signs the other devices out, which is the point of
 * changing it — the answer says how many that was.
 */
export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResult<{ updated: boolean; otherSessionsRevoked: number }>> {
  return call("/api/account/password", input);
}

/** The providers connected to this account. */
export async function fetchIdentities(): Promise<AuthResult<LinkedIdentity[]>> {
  return request<LinkedIdentity[]>("/api/account/identities", { method: "GET" });
}

/**
 * Detaching one provider.
 *
 * The password is sent when the account has one, because the API asks for it: an
 * unlink is the kind of change someone with a borrowed session would otherwise be
 * able to make. An account created by a provider has no password to prove, so the
 * body is simply absent.
 */
export async function unlinkIdentity(input: {
  id: string;
  password?: string;
}): Promise<AuthResult<{ id: string; removed: boolean }>> {
  return request(`/api/account/identities/${encodeURIComponent(input.id)}`, {
    method: "DELETE",
    body: input.password ? { password: input.password } : undefined,
  });
}
