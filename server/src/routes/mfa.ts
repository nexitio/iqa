/**
 * Two-factor authentication.
 *
 * Two groups of routes share a file because they are two halves of one idea:
 *
 *  - `/auth/mfa/*` continues a sign-in that a password only *started*. These take
 *    a short-lived pending token, never a session, and the token is not an
 *    identity — it can only finish a ceremony.
 *  - `/me/mfa/*` manages an account's factors, and every one of them re-asks for
 *    the account password. A session alone is not enough: if a session cookie is
 *    all an attacker has, adding a factor they control would hand them the
 *    account permanently.
 *
 * The codes themselves are never in a response unless the configured delivery
 * channel is the local `console` driver, which by definition sent nothing. See
 * `src/mfa/delivery.ts` — that property is read from the deliverer rather than
 * from a flag, so it cannot be left on by accident.
 */

import { eq } from "drizzle-orm";
import { Hono } from "hono";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";
import { requireAccountPassword } from "../auth/credentials.ts";
import { issueSession } from "../auth/login.ts";
import { requireIdentity, type AppBindings } from "../context.ts";
import type { Database } from "../db/index.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest, HttpError, unauthorized } from "../http/errors.ts";
import { readJsonBody } from "../http/body.ts";
import { rateLimit } from "../http/rate-limit.ts";
import {
  clearPendingLogins,
  consumePasskeyChallenge,
  consumeRecoveryCode,
  enrollCodeFactor,
  enrollPasskey,
  findFactor,
  issueRecoveryCodes,
  listFactors,
  normaliseEmail,
  normalisePhone,
  passkeyCredentialByCredentialId,
  passkeyCredentials,
  readPendingLogin,
  recoveryCodesRemaining,
  removeFactor,
  startCodeChallenge,
  startPasskeyChallenge,
  touchFactor,
  updatePasskeyCounter,
  verifiedFactors,
  verifyCodeChallenge,
  type FactorRow,
} from "../mfa/service.ts";
import type { MfaChannel } from "../mfa/delivery.ts";
import {
  createAuthenticationOptions,
  createRegistrationOptions,
  maskDestination,
  verifyAuthentication,
  verifyRegistration,
} from "../mfa/webauthn.ts";

export const mfaRoutes = new Hono<AppBindings>();

/**
 * A coarser budget than the per-challenge one: `mfa_challenges.attempts` already
 * caps a single code at five guesses, so this only bounds how often codes can be
 * requested and re-requested against one account.
 */
const VERIFY_ATTEMPTS = 20;
const VERIFY_WINDOW_MS = 10 * 60 * 1000;

function presentFactor(row: FactorRow) {
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    destination: maskDestination(row.destination),
    createdAt: row.createdAt,
  };
}

/** Numbers and addresses in a response are always masked; the owner never needs the echo. */
function presentChallenge(input: {
  challengeId: string;
  kind: string;
  destination: string | null;
  expiresAt: string;
  minutes: number;
  devCode: string | null;
}) {
  return {
    challengeId: input.challengeId,
    kind: input.kind,
    destination: maskDestination(input.destination),
    expiresAt: input.expiresAt,
    minutes: input.minutes,
    // Present only when nothing was actually sent — see the note at the top.
    ...(input.devCode ? { devCode: input.devCode } : {}),
  };
}

/* -------------------------------------------------------------------------- */
/* Continuing a sign-in                                                       */
/* -------------------------------------------------------------------------- */

async function pendingUser(db: Database, token: unknown) {
  if (typeof token !== "string" || !token) {
    throw badRequest("pendingToken is required");
  }
  const pending = await readPendingLogin(db, token);
  if (!pending) throw unauthorized("This sign-in attempt has expired. Sign in again.");
  return pending;
}

/**
 * Codes and assertions are guessed through these endpoints, so they carry the
 * same budget a password does — and it is spent per account, not per caller, so
 * forwarding headers cannot be used to dodge it.
 */
function guardAttempts(key: string): void {
  const limit = rateLimit(`mfa:${key}`, VERIFY_ATTEMPTS, VERIFY_WINDOW_MS);
  if (!limit.allowed) {
    throw new HttpError(
      429,
      `Too many attempts. Try again in ${limit.retryAfterSeconds} second(s).`,
    );
  }
}

/** Which of the account's factors the caller wants a code sent to. */
async function chooseCodeFactor(
  db: Database,
  userId: string,
  channel: MfaChannel,
  factorId: string | undefined,
) {
  const factors = (await verifiedFactors(db, userId)).filter((row) => row.kind === channel);
  const factor = factorId ? factors.find((row) => row.id === factorId) : factors[0];
  if (!factor || !factor.destination) {
    throw badRequest(`No ${channel} second factor is enrolled for this account`);
  }
  return factor;
}

mfaRoutes.post("/auth/mfa/challenge", async (c) => {
  const db = c.get("db");
  const body = await readJsonBody<{
    pendingToken?: string;
    kind?: MfaChannel;
    factorId?: string;
  }>(c);

  const pending = await pendingUser(db, body.pendingToken);
  guardAttempts(pending.userId);

  const channel: MfaChannel = body.kind === "sms" ? "sms" : "email";
  const factor = await chooseCodeFactor(db, pending.userId, channel, body.factorId);

  const issued = await startCodeChallenge(db, {
    userId: pending.userId,
    purpose: "login",
    channel,
    destination: factor.destination!,
    factorId: factor.id,
  });

  return c.json({
    data: presentChallenge({
      challengeId: issued.challenge.id,
      kind: channel,
      destination: factor.destination,
      expiresAt: issued.challenge.expiresAt,
      minutes: 10,
      devCode: issued.devCode,
    }),
  });
});

mfaRoutes.post("/auth/mfa/verify", async (c) => {
  const db = c.get("db");
  const body = await readJsonBody<{
    pendingToken?: string;
    challengeId?: string;
    code?: string;
  }>(c);

  const pending = await pendingUser(db, body.pendingToken);
  guardAttempts(pending.userId);

  if (!body.code?.trim()) throw badRequest("code is required");

  const challenge = await verifyCodeChallenge(db, {
    userId: pending.userId,
    purpose: "login",
    kinds: ["email", "sms"],
    challengeId: body.challengeId,
    code: body.code,
  });

  if (challenge.factorId) await touchFactor(db, challenge.factorId);
  await clearPendingLogins(db, pending.userId);

  return c.json({ data: await issueSession(c, pending.userId) });
});

mfaRoutes.post("/auth/mfa/passkey/options", async (c) => {
  const db = c.get("db");
  const body = await readJsonBody<{ pendingToken?: string }>(c);

  const pending = await pendingUser(db, body.pendingToken);
  guardAttempts(pending.userId);

  const credentials = passkeyCredentials(await verifiedFactors(db, pending.userId));
  if (credentials.length === 0) {
    throw badRequest("No passkey is enrolled for this account");
  }

  const options = await createAuthenticationOptions(credentials);
  const challenge = await startPasskeyChallenge(db, {
    userId: pending.userId,
    purpose: "login",
    challenge: options.challenge,
  });

  return c.json({ data: { challengeId: challenge.id, options } });
});

mfaRoutes.post("/auth/mfa/passkey/verify", async (c) => {
  const db = c.get("db");
  const body = await readJsonBody<{
    pendingToken?: string;
    challengeId?: string;
    response?: AuthenticationResponseJSON;
  }>(c);

  const pending = await pendingUser(db, body.pendingToken);
  guardAttempts(pending.userId);

  if (!body.challengeId || !body.response?.id) {
    throw badRequest("challengeId and response are required");
  }

  const challenge = await consumePasskeyChallenge(db, {
    userId: pending.userId,
    purpose: "login",
    challengeId: body.challengeId,
  });

  // The credential is looked up globally by its id because that is what the
  // assertion carries; ownership is then checked against the pending account, so
  // one account's passkey can never complete another account's sign-in.
  const factor = await passkeyCredentialByCredentialId(db, body.response.id);
  if (!factor || factor.userId !== pending.userId) {
    throw unauthorized("That passkey is not enrolled for this account.");
  }

  const verified = await verifyAuthentication({
    response: body.response,
    expectedChallenge: challenge.webauthnChallenge!,
    credential: {
      credentialId: factor.credentialId!,
      publicKey: factor.publicKey!,
      counter: factor.counter,
      transports: factor.transports,
    },
  });
  if (!verified) throw unauthorized("That passkey could not be verified.");

  await updatePasskeyCounter(db, factor.id, verified.newCounter);
  await clearPendingLogins(db, pending.userId);

  return c.json({ data: await issueSession(c, pending.userId) });
});

mfaRoutes.post("/auth/mfa/recovery", async (c) => {
  const db = c.get("db");
  const body = await readJsonBody<{ pendingToken?: string; code?: string }>(c);

  const pending = await pendingUser(db, body.pendingToken);
  guardAttempts(pending.userId);

  if (!body.code?.trim()) throw badRequest("code is required");

  const accepted = await consumeRecoveryCode(db, pending.userId, body.code);
  if (!accepted) throw unauthorized("That recovery code is not valid.");

  await clearPendingLogins(db, pending.userId);
  return c.json({ data: await issueSession(c, pending.userId) });
});

/* -------------------------------------------------------------------------- */
/* Managing factors                                                           */
/* -------------------------------------------------------------------------- */

/** The recovery codes are issued with the *first* factor and never shown again. */
async function recoveryCodesIfFirst(
  db: Database,
  userId: string,
  hadFactor: boolean,
): Promise<string[] | undefined> {
  if (hadFactor) return undefined;
  return issueRecoveryCodes(db, userId);
}

mfaRoutes.get("/me/mfa", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  const [factors, remaining] = await Promise.all([
    listFactors(db, identity.userId),
    recoveryCodesRemaining(db, identity.userId),
  ]);

  return c.json({
    data: {
      enabled: factors.length > 0,
      factors,
      recoveryCodesRemaining: remaining,
    },
  });
});

mfaRoutes.post("/me/mfa/email/start", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await readJsonBody<{ password?: string; email?: string }>(c);

  await requireAccountPassword(db, identity.userId, body.password);
  if (!body.email) throw badRequest("email is required");
  const destination = normaliseEmail(body.email);

  const issued = await startCodeChallenge(db, {
    userId: identity.userId,
    purpose: "enroll",
    channel: "email",
    destination,
    factorId: null,
  });

  return c.json({
    data: presentChallenge({
      challengeId: issued.challenge.id,
      kind: "email",
      destination,
      expiresAt: issued.challenge.expiresAt,
      minutes: 10,
      devCode: issued.devCode,
    }),
  });
});

mfaRoutes.post("/me/mfa/email/confirm", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await readJsonBody<{ challengeId?: string; code?: string }>(c);

  if (!body.code?.trim()) throw badRequest("code is required");

  const before = await verifiedFactors(db, identity.userId);
  const challenge = await verifyCodeChallenge(db, {
    userId: identity.userId,
    purpose: "enroll",
    kinds: ["email"],
    challengeId: body.challengeId,
    code: body.code,
  });

  const factor = await enrollCodeFactor(db, {
    userId: identity.userId,
    channel: "email",
    destination: challenge.destination!,
  });
  const recoveryCodes = await recoveryCodesIfFirst(db, identity.userId, before.length > 0);

  return c.json({ data: { factor: presentFactor(factor), recoveryCodes } }, 201);
});

mfaRoutes.post("/me/mfa/sms/start", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await readJsonBody<{ password?: string; phone?: string }>(c);

  await requireAccountPassword(db, identity.userId, body.password);
  if (!body.phone) throw badRequest("phone is required");
  const destination = normalisePhone(body.phone);

  const issued = await startCodeChallenge(db, {
    userId: identity.userId,
    purpose: "enroll",
    channel: "sms",
    destination,
    factorId: null,
  });

  return c.json({
    data: presentChallenge({
      challengeId: issued.challenge.id,
      kind: "sms",
      destination,
      expiresAt: issued.challenge.expiresAt,
      minutes: 10,
      devCode: issued.devCode,
    }),
  });
});

mfaRoutes.post("/me/mfa/sms/confirm", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await readJsonBody<{ challengeId?: string; code?: string }>(c);

  if (!body.code?.trim()) throw badRequest("code is required");

  const before = await verifiedFactors(db, identity.userId);
  const challenge = await verifyCodeChallenge(db, {
    userId: identity.userId,
    purpose: "enroll",
    kinds: ["sms"],
    challengeId: body.challengeId,
    code: body.code,
  });

  const factor = await enrollCodeFactor(db, {
    userId: identity.userId,
    channel: "sms",
    destination: challenge.destination!,
  });
  const recoveryCodes = await recoveryCodesIfFirst(db, identity.userId, before.length > 0);

  return c.json({ data: { factor: presentFactor(factor), recoveryCodes } }, 201);
});

mfaRoutes.post("/me/mfa/passkey/start", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await readJsonBody<{ password?: string }>(c);

  await requireAccountPassword(db, identity.userId, body.password);

  const [account] = await db
    .select({ name: schema.users.name, email: schema.users.email })
    .from(schema.users)
    .where(eq(schema.users.id, identity.userId))
    .limit(1);

  const factors = await verifiedFactors(db, identity.userId);
  const options = await createRegistrationOptions({
    userId: identity.userId,
    userName: account?.email ?? identity.userId,
    displayName: account?.name ?? identity.userId,
    exclude: passkeyCredentials(factors),
  });

  const challenge = await startPasskeyChallenge(db, {
    userId: identity.userId,
    purpose: "enroll",
    challenge: options.challenge,
  });

  return c.json({ data: { challengeId: challenge.id, options } });
});

mfaRoutes.post("/me/mfa/passkey/confirm", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await readJsonBody<{
    challengeId?: string;
    response?: RegistrationResponseJSON;
    label?: string;
  }>(c);

  if (!body.challengeId || !body.response?.id) {
    throw badRequest("challengeId and response are required");
  }

  const before = await verifiedFactors(db, identity.userId);

  const challenge = await consumePasskeyChallenge(db, {
    userId: identity.userId,
    purpose: "enroll",
    challengeId: body.challengeId,
  });

  const credential = await verifyRegistration(body.response, challenge.webauthnChallenge!);
  if (!credential) throw unauthorized("That passkey could not be verified.");

  // A credential id is globally unique to the authenticator: if it is already
  // enrolled anywhere, this is the same passkey being offered twice.
  const existing = await passkeyCredentialByCredentialId(db, credential.credentialId);
  if (existing) throw badRequest("That passkey is already enrolled.");

  const factor = await enrollPasskey(db, {
    userId: identity.userId,
    credential,
    label: body.label,
  });
  const recoveryCodes = await recoveryCodesIfFirst(db, identity.userId, before.length > 0);

  return c.json({ data: { factor: presentFactor(factor), recoveryCodes } }, 201);
});

mfaRoutes.delete("/me/mfa/:factorId", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await readJsonBody<{ password?: string }>(c);

  await requireAccountPassword(db, identity.userId, body.password);

  const factor = await findFactor(db, identity.userId, c.req.param("factorId"));
  if (!factor) throw badRequest("No such second factor");

  const removed = await removeFactor(db, identity.userId, factor.id);
  if (!removed) throw badRequest("No such second factor");

  // Recovery codes are only meaningful while a second factor exists.
  const remaining = await verifiedFactors(db, identity.userId);
  if (remaining.length === 0) {
    await db.delete(schema.recoveryCodes).where(eq(schema.recoveryCodes.userId, identity.userId));
  }

  return c.json({
    data: { id: factor.id, removed: true, factorsRemaining: remaining.length },
  });
});

mfaRoutes.post("/me/mfa/recovery-codes", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await readJsonBody<{ password?: string }>(c);

  await requireAccountPassword(db, identity.userId, body.password);

  const factors = await verifiedFactors(db, identity.userId);
  if (factors.length === 0) {
    throw badRequest("Enrol a second factor before generating recovery codes");
  }

  return c.json({ data: { recoveryCodes: await issueRecoveryCodes(db, identity.userId) } });
});
