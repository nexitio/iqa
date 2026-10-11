/**
 * Signing in with a passkey, before anything has been typed.
 *
 * Every other sign-in in this API starts from something the caller already
 * proved: a password, a pending token, a session. These two routes are the
 * exception, and that is the point of them. Conditional UI offers the passkey in
 * the browser's own autofill, on the sign-in page, where no password has been
 * entered yet and so there is no account to name. The first call therefore
 * generates a challenge that belongs to nobody, and *verification* is what gives
 * it an owner: the assertion carries a credential id, and the credential id names
 * the factor, which names the account.
 *
 * Two things keep that from being a way in for anyone who is not the account
 * holder:
 *
 *  - An empty allow list only lets the browser offer credentials it already has
 *    for this site, and the assertion still has to verify against the public key
 *    stored on the server. Holding nothing means proving nothing.
 *  - A challenge is single-use, short-lived and unattributed, so it can only ever
 *    authorise the account its own assertion proves — never a challenge that an
 *    account's own second-factor step created, which is what the `user_id IS NULL`
 *    lookup in `consumeAnonymousPasskeyChallenge` guarantees.
 *
 * The session is issued by the same `issueSession` as every other path, so a
 * suspended account is refused here exactly as it is there.
 */

import { Hono } from "hono";
import type { AuthenticationResponseJSON } from "@simplewebauthn/server";
import { issueSession } from "../auth/login.ts";
import type { AppBindings } from "../context.ts";
import { readJsonBody } from "../http/body.ts";
import { badRequest, HttpError, unauthorized } from "../http/errors.ts";
import { callerKey, rateLimit } from "../http/rate-limit.ts";
import {
  consumeAnonymousPasskeyChallenge,
  passkeyCredentialByCredentialId,
  purgeExpiredChallenges,
  startAnonymousPasskeyChallenge,
  updatePasskeyCounter,
} from "../mfa/service.ts";
import { createAuthenticationOptions, verifyAuthentication } from "../mfa/webauthn.ts";

export const passkeyRoutes = new Hono<AppBindings>();

/** See the note in `http/rate-limit.ts` about in-process counters. */
const OPTIONS_ATTEMPTS = 120;
const VERIFY_ATTEMPTS = 20;
const WINDOW_MS = 10 * 60 * 1000;

/**
 * Keyed on the caller rather than the account, because there is no account yet.
 *
 * That is weaker than the per-account budgets elsewhere — one address can front
 * many people, and the key falls back to the `Origin` header when no proxy sets a
 * forwarded address — so the budget is deliberately generous on the options side,
 * where an honest page left open spends one call every few minutes. Exhausting it
 * costs a visitor the autofill hint, not their way in: the password and the
 * second-factor step are untouched.
 */
function guard(key: string, attempts: number): void {
  const limit = rateLimit(`passkey:${key}`, attempts, WINDOW_MS);
  if (!limit.allowed) {
    throw new HttpError(
      429,
      `Too many attempts. Try again in ${limit.retryAfterSeconds} second(s).`,
    );
  }
}

/** Every answer from here is specific to one caller. */
passkeyRoutes.use("*", async (c, next) => {
  await next();
  c.header("cache-control", "private, no-store");
});

passkeyRoutes.post("/auth/passkey/options", async (c) => {
  const db = c.get("db");
  guard(`options:${callerKey(c)}`, OPTIONS_ATTEMPTS);

  // Housekeeping, for the same reason the password route does it: an
  // unattributed challenge is never consumed by anything but its own ceremony, so
  // one a visitor abandons would otherwise sit in the table until it expired.
  await purgeExpiredChallenges(db);

  /**
   * An empty allow list is what makes this the credential-first flow: the browser
   * offers whichever passkeys it holds for this site, and the server learns which
   * one was chosen only when the assertion comes back.
   */
  const options = await createAuthenticationOptions([]);
  const challenge = await startAnonymousPasskeyChallenge(db, { challenge: options.challenge });

  return c.json({ data: { challengeId: challenge.id, options } });
});

passkeyRoutes.post("/auth/passkey/verify", async (c) => {
  const db = c.get("db");
  const body = await readJsonBody<{
    challengeId?: string;
    response?: AuthenticationResponseJSON;
  }>(c);
  guard(`verify:${callerKey(c)}`, VERIFY_ATTEMPTS);

  if (!body.challengeId || !body.response?.id) {
    throw badRequest("challengeId and response are required");
  }

  const challenge = await consumeAnonymousPasskeyChallenge(db, body.challengeId);

  // The credential is looked up by the id the assertion carries, because that is
  // the only thing that names an account here. An unknown credential and a
  // signature that does not verify answer identically, so a caller learns nothing
  // about which passkeys exist without holding the private key for one.
  const factor = await passkeyCredentialByCredentialId(db, body.response.id);
  if (!factor?.credentialId || !factor.publicKey || !factor.verifiedAt) {
    throw unauthorized("That passkey could not be verified.");
  }

  const verified = await verifyAuthentication({
    response: body.response,
    expectedChallenge: challenge.webauthnChallenge!,
    credential: {
      credentialId: factor.credentialId,
      publicKey: factor.publicKey,
      counter: factor.counter,
      transports: factor.transports,
    },
  });
  if (!verified) throw unauthorized("That passkey could not be verified.");

  // The counter is stored before the session is issued: a signature counter that
  // never goes backwards is what tells a cloned authenticator apart from the real
  // one, and it has to be current for the next sign-in to mean anything.
  await updatePasskeyCounter(db, factor.id, verified.newCounter);

  return c.json({ data: await issueSession(c, factor.userId) });
});
