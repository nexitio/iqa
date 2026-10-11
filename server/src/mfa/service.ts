/**
 * The second-factor flows.
 *
 * Everything stateful about 2FA lives here, so the routes stay a thin mapping
 * from HTTP to these functions and the rules that matter are in one place:
 *
 *  - **One live code per purpose and channel.** Requesting a new code burns the
 *    previous one, so N outstanding codes never means N valid codes.
 *  - **Attempts are counted on the row.** Five wrong codes exhaust a challenge
 *    rather than letting a six-digit space be walked.
 *  - **A challenge is single-use.** Successful verification consumes it, so a
 *    captured request cannot be replayed.
 *  - **Secrets are hashed at rest** with the same scrypt used for passwords —
 *    the code, whatever its length, is never stored in a form that verifies.
 */

import { randomBytes, randomInt } from "node:crypto";
import { and, asc, desc, eq, gt, inArray, isNotNull, isNull, lt, sql } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../auth/password.ts";
import { hashSessionToken } from "../auth/session.ts";
import type { Database } from "../db/index.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest, HttpError, unauthorized } from "../http/errors.ts";
import { delivererFor, type Deliverer, type MfaChannel } from "./delivery.ts";
import { maskDestination, type StoredCredential, type VerifiedCredential } from "./webauthn.ts";

export type FactorRow = typeof schema.mfaFactors.$inferSelect;
export type ChallengeRow = typeof schema.mfaChallenges.$inferSelect;

export type FactorKind = "passkey" | "email" | "sms";
export type ChallengePurpose = "login" | "enroll";

export const CODE_TTL_MINUTES = 10;
export const PASSKEY_TTL_MINUTES = 5;
/**
 * Longer than the second-factor one, because nobody is waiting on anything yet.
 *
 * An unattributed challenge is single-use and only verifies against a private key
 * the caller would have to hold, so its lifetime is not a window an attacker can
 * widen — while the visitor it belongs to may have opened the sign-in page and
 * walked away before choosing the passkey in autofill.
 */
const ANONYMOUS_PASSKEY_TTL_MINUTES = 15;
export const PENDING_LOGIN_TTL_MINUTES = 5;
const MAX_CODE_ATTEMPTS = 5;
export const RECOVERY_CODE_COUNT = 10;

const nowIso = () => new Date().toISOString();
const inMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();
const id = (prefix: string) => `${prefix}-${randomBytes(8).toString("hex")}`;

/* -------------------------------------------------------------------------- */
/* Targets                                                                    */
/* -------------------------------------------------------------------------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normaliseEmail(value: string): string {
  const email = value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > 200) {
    throw badRequest("A valid email address is required");
  }
  return email;
}

/**
 * Accepts what a Bangladeshi user actually types — `01712345678`, `+8801712345678`,
 * `8801712345678` — and stores one canonical E.164 form, because the same number
 * written two ways must not become two factors.
 */
export function normalisePhone(value: string): string {
  const cleaned = value.replace(/[\s()\-.]/g, "");
  if (!/^\+?\d+$/.test(cleaned)) throw badRequest("A phone number may only contain digits");

  let number = cleaned;
  if (number.startsWith("+")) number = number.slice(1);
  else if (number.startsWith("880")) number = number; // already country-coded
  else if (number.startsWith("0")) number = `88${number}`;
  else throw badRequest("Include the country code, e.g. +8801712345678");

  if (!/^8801\d{9}$/.test(number)) {
    throw badRequest("Use a Bangladeshi mobile number, e.g. 01712345678 or +8801712345678");
  }
  return `+${number}`;
}

/* -------------------------------------------------------------------------- */
/* Factors                                                                    */
/* -------------------------------------------------------------------------- */

function toPublicFactor(row: FactorRow) {
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    destination: maskDestination(row.destination),
    createdAt: row.createdAt,
    lastUsedAt: row.lastUsedAt,
  };
}

/** What the sign-in step tells the client it can offer. */
function toFactorSummary(row: FactorRow) {
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    destination: maskDestination(row.destination),
  };
}

export async function listFactors(db: Database, userId: string) {
  const rows = await db
    .select()
    .from(schema.mfaFactors)
    .where(eq(schema.mfaFactors.userId, userId))
    .orderBy(asc(schema.mfaFactors.createdAt));

  return rows.map(toPublicFactor);
}

/** Only verified factors count: an address that was never confirmed cannot prove anything. */
export async function verifiedFactors(db: Database, userId: string): Promise<FactorRow[]> {
  return db
    .select()
    .from(schema.mfaFactors)
    .where(
      and(eq(schema.mfaFactors.userId, userId), isNotNull(schema.mfaFactors.verifiedAt)),
    )
    .orderBy(asc(schema.mfaFactors.createdAt));
}

export function factorsForLogin(rows: FactorRow[]) {
  return rows.map(toFactorSummary);
}

export async function findFactor(db: Database, userId: string, factorId: string) {
  const [row] = await db
    .select()
    .from(schema.mfaFactors)
    .where(and(eq(schema.mfaFactors.userId, userId), eq(schema.mfaFactors.id, factorId)))
    .limit(1);
  return row ?? null;
}

/** The stored credential a passkey assertion is verified against. */
function credentialOf(row: FactorRow): StoredCredential | null {
  if (!row.credentialId || !row.publicKey) return null;
  return {
    credentialId: row.credentialId,
    publicKey: row.publicKey,
    counter: row.counter,
    transports: row.transports,
  };
}

export function passkeyCredentials(rows: FactorRow[]): StoredCredential[] {
  return rows
    .map(credentialOf)
    .filter((credential): credential is StoredCredential => credential !== null);
}

export async function passkeyCredentialByCredentialId(db: Database, credentialId: string) {
  const [row] = await db
    .select()
    .from(schema.mfaFactors)
    .where(eq(schema.mfaFactors.credentialId, credentialId))
    .limit(1);
  return row ?? null;
}

export async function enrollPasskey(
  db: Database,
  input: { userId: string; credential: VerifiedCredential; label?: string },
): Promise<FactorRow> {
  const [row] = await db
    .insert(schema.mfaFactors)
    .values({
      id: id("mfa"),
      userId: input.userId,
      kind: "passkey",
      destination: null,
      label: input.label?.trim() || "পাসকি",
      credentialId: input.credential.credentialId,
      publicKey: input.credential.publicKey,
      counter: input.credential.counter,
      transports: input.credential.transports ?? [],
      deviceType: input.credential.deviceType,
      backedUp: input.credential.backedUp,
      createdAt: nowIso(),
      // A passkey is verified by the ceremony itself: the signature proves the
      // device holds the private key, so there is nothing left to confirm.
      verifiedAt: nowIso(),
      lastUsedAt: null,
    })
    .returning();
  return row!;
}

export async function enrollCodeFactor(
  db: Database,
  input: { userId: string; channel: MfaChannel; destination: string },
): Promise<FactorRow> {
  // Re-enrolling the same address reuses the row rather than tripping the unique
  // index, which is also what makes "lost my number, same address" work.
  const [existing] = await db
    .select()
    .from(schema.mfaFactors)
    .where(
      and(eq(schema.mfaFactors.userId, input.userId), eq(schema.mfaFactors.destination, input.destination)),
    )
    .limit(1);

  if (existing) {
    const [row] = await db
      .update(schema.mfaFactors)
      .set({ kind: input.channel, verifiedAt: nowIso() })
      .where(eq(schema.mfaFactors.id, existing.id))
      .returning();
    return row!;
  }

  const [row] = await db
    .insert(schema.mfaFactors)
    .values({
      id: id("mfa"),
      userId: input.userId,
      kind: input.channel,
      destination: input.destination,
      label: input.destination,
      createdAt: nowIso(),
      verifiedAt: nowIso(),
      lastUsedAt: null,
    })
    .returning();
  return row!;
}

export async function removeFactor(db: Database, userId: string, factorId: string): Promise<boolean> {
  const deleted = await db
    .delete(schema.mfaFactors)
    .where(and(eq(schema.mfaFactors.userId, userId), eq(schema.mfaFactors.id, factorId)))
    .returning();
  return deleted.length > 0;
}

export async function touchFactor(db: Database, factorId: string): Promise<void> {
  await db
    .update(schema.mfaFactors)
    .set({ lastUsedAt: nowIso() })
    .where(eq(schema.mfaFactors.id, factorId));
}

export async function updatePasskeyCounter(
  db: Database,
  factorId: string,
  counter: number,
): Promise<void> {
  await db
    .update(schema.mfaFactors)
    .set({ counter, lastUsedAt: nowIso() })
    .where(eq(schema.mfaFactors.id, factorId));
}

/* -------------------------------------------------------------------------- */
/* Code challenges                                                            */
/* -------------------------------------------------------------------------- */

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export interface IssuedChallenge {
  challenge: ChallengeRow;
  /** Only present when the deliverer is local — nothing was actually sent. */
  devCode: string | null;
  deliverer: Deliverer;
}

/** Burns every outstanding code challenge of the same purpose and channel. */
async function retireLiveCodes(
  db: Database,
  userId: string,
  purpose: ChallengePurpose,
  kinds: FactorKind[],
): Promise<void> {
  await db
    .update(schema.mfaChallenges)
    .set({ consumedAt: nowIso() })
    .where(
      and(
        eq(schema.mfaChallenges.userId, userId),
        eq(schema.mfaChallenges.purpose, purpose),
        inArray(schema.mfaChallenges.kind, kinds),
        isNull(schema.mfaChallenges.consumedAt),
        gt(schema.mfaChallenges.expiresAt, nowIso()),
      ),
    );
}

export async function startCodeChallenge(
  db: Database,
  input: {
    userId: string;
    purpose: ChallengePurpose;
    channel: MfaChannel;
    destination: string;
    factorId: string | null;
  },
): Promise<IssuedChallenge> {
  await retireLiveCodes(db, input.userId, input.purpose, [input.channel]);

  const code = generateCode();
  const [challenge] = await db
    .insert(schema.mfaChallenges)
    .values({
      id: id("mfc"),
      userId: input.userId,
      purpose: input.purpose,
      kind: input.channel,
      factorId: input.factorId,
      destination: input.destination,
      codeHash: await hashPassword(code),
      webauthnChallenge: null,
      attempts: 0,
      createdAt: nowIso(),
      expiresAt: inMinutes(CODE_TTL_MINUTES),
      consumedAt: null,
    })
    .returning();

  const deliverer = delivererFor(input.channel);
  await deliverer.send({
    to: input.destination,
    code,
    purpose: input.purpose,
    minutes: CODE_TTL_MINUTES,
  });

  return { challenge: challenge!, devCode: deliverer.local ? code : null, deliverer };
}

async function activeChallenge(
  db: Database,
  input: {
    userId: string;
    purpose: ChallengePurpose;
    kinds: FactorKind[];
    challengeId?: string;
  },
): Promise<ChallengeRow | null> {
  const conditions = [
    eq(schema.mfaChallenges.userId, input.userId),
    eq(schema.mfaChallenges.purpose, input.purpose),
    inArray(schema.mfaChallenges.kind, input.kinds),
    isNull(schema.mfaChallenges.consumedAt),
    gt(schema.mfaChallenges.expiresAt, nowIso()),
  ];
  if (input.challengeId) conditions.push(eq(schema.mfaChallenges.id, input.challengeId));

  const [row] = await db
    .select()
    .from(schema.mfaChallenges)
    .where(and(...conditions))
    .orderBy(desc(schema.mfaChallenges.createdAt))
    .limit(1);
  return row ?? null;
}

/**
 * Checks a code against the caller's live challenge and consumes it.
 *
 * The three failures are deliberately distinct, because they need different
 * actions from the reader: request a new code, retype it, or wait.
 */
export async function verifyCodeChallenge(
  db: Database,
  input: {
    userId: string;
    purpose: ChallengePurpose;
    kinds: FactorKind[];
    challengeId?: string;
    code: string;
  },
): Promise<ChallengeRow> {
  const challenge = await activeChallenge(db, input);
  if (!challenge || !challenge.codeHash) {
    throw unauthorized("That code is no longer valid. Request a new one.");
  }

  if (challenge.attempts >= MAX_CODE_ATTEMPTS) {
    throw new HttpError(429, "Too many incorrect codes. Request a new one.");
  }

  const matches = await verifyPassword(input.code.trim(), challenge.codeHash);
  const attempts = challenge.attempts + 1;

  if (!matches) {
    const exhausted = attempts >= MAX_CODE_ATTEMPTS;
    await db
      .update(schema.mfaChallenges)
      .set({ attempts, ...(exhausted ? { consumedAt: nowIso() } : {}) })
      .where(eq(schema.mfaChallenges.id, challenge.id));

    if (exhausted) throw new HttpError(429, "Too many incorrect codes. Request a new one.");
    throw unauthorized("That code is not correct.");
  }

  await db
    .update(schema.mfaChallenges)
    .set({ attempts, consumedAt: nowIso() })
    .where(eq(schema.mfaChallenges.id, challenge.id));

  return challenge;
}

/** Housekeeping, run at sign-in so the table does not accumulate dead rows. */
export async function purgeExpiredChallenges(db: Database): Promise<void> {
  await db.delete(schema.mfaChallenges).where(lt(schema.mfaChallenges.expiresAt, nowIso()));
}

/* -------------------------------------------------------------------------- */
/* Passkey challenges                                                         */
/* -------------------------------------------------------------------------- */

export async function startPasskeyChallenge(
  db: Database,
  input: {
    userId: string;
    purpose: ChallengePurpose;
    /** The base64url challenge generated by WebAuthn, stored server-side. */
    challenge: string;
  },
): Promise<ChallengeRow> {
  // A passkey challenge supersedes any earlier one: only the newest ceremony can
  // be completed, so an attacker who obtained an old challenge gains nothing.
  await retireLiveCodes(db, input.userId, input.purpose, ["passkey"]);

  const [row] = await db
    .insert(schema.mfaChallenges)
    .values({
      id: id("mfc"),
      userId: input.userId,
      purpose: input.purpose,
      kind: "passkey",
      factorId: null,
      destination: null,
      codeHash: null,
      webauthnChallenge: input.challenge,
      attempts: 0,
      createdAt: nowIso(),
      expiresAt: inMinutes(PASSKEY_TTL_MINUTES),
      consumedAt: null,
    })
    .returning();
  return row!;
}

/** Reads and consumes the challenge a passkey response must answer. */
export async function consumePasskeyChallenge(
  db: Database,
  input: { userId: string; purpose: ChallengePurpose; challengeId: string },
): Promise<ChallengeRow> {
  const challenge = await activeChallenge(db, {
    userId: input.userId,
    purpose: input.purpose,
    kinds: ["passkey"],
    challengeId: input.challengeId,
  });

  if (!challenge || !challenge.webauthnChallenge) {
    throw unauthorized("That passkey request has expired. Try again.");
  }

  await db
    .update(schema.mfaChallenges)
    .set({ consumedAt: nowIso() })
    .where(eq(schema.mfaChallenges.id, challenge.id));

  return challenge;
}

/* -------------------------------------------------------------------------- */
/* Credential-first passkeys                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Starts a passkey challenge that belongs to no account yet.
 *
 * This is the one ceremony that begins before anything is known about the caller:
 * conditional UI offers the passkey in the browser's password autofill, on the
 * sign-in page, where no password has been typed and so no `pendingToken` exists.
 * The row is written with a null `user_id`, and *verification* is what gives it an
 * owner — the credential id in the assertion names the factor, and the factor
 * names the account.
 *
 * Nothing is retired here on purpose. There is no account whose earlier challenges
 * it should supersede, and an unattributed row can only ever authorise the account
 * that its own assertion proves, so leaving older ones to expire is safe.
 */
export async function startAnonymousPasskeyChallenge(
  db: Database,
  input: { challenge: string },
): Promise<ChallengeRow> {
  const [row] = await db
    .insert(schema.mfaChallenges)
    .values({
      id: id("mfc"),
      userId: null,
      purpose: "login",
      kind: "passkey",
      factorId: null,
      destination: null,
      codeHash: null,
      webauthnChallenge: input.challenge,
      attempts: 0,
      createdAt: nowIso(),
      expiresAt: inMinutes(ANONYMOUS_PASSKEY_TTL_MINUTES),
      consumedAt: null,
    })
    .returning();
  return row!;
}

/**
 * Reads and consumes an unattributed passkey challenge.
 *
 * `user_id IS NULL` is part of the lookup rather than a nicety: it keeps this from
 * ever consuming a challenge that belongs to an account's own second-factor step,
 * where the promise that the account already proved its password must hold.
 */
export async function consumeAnonymousPasskeyChallenge(
  db: Database,
  challengeId: string,
): Promise<ChallengeRow> {
  const [row] = await db
    .select()
    .from(schema.mfaChallenges)
    .where(
      and(
        eq(schema.mfaChallenges.id, challengeId),
        isNull(schema.mfaChallenges.userId),
        eq(schema.mfaChallenges.kind, "passkey"),
        isNull(schema.mfaChallenges.consumedAt),
        gt(schema.mfaChallenges.expiresAt, nowIso()),
      ),
    )
    .limit(1);

  if (!row || !row.webauthnChallenge) {
    throw unauthorized("That sign-in attempt has expired. Start again.");
  }

  await db
    .update(schema.mfaChallenges)
    .set({ consumedAt: nowIso() })
    .where(eq(schema.mfaChallenges.id, row.id));

  return row;
}

/* -------------------------------------------------------------------------- */
/* Pending logins                                                             */
/* -------------------------------------------------------------------------- */

/**
 * A password that was correct but is not a session yet.
 *
 * Nothing reads a pending token as an identity: only `/auth/mfa/*` accepts it, and
 * only to complete a ceremony.
 */
export async function createPendingLogin(
  db: Database,
  userId: string,
): Promise<{ token: string; expiresAt: string }> {
  // One outstanding attempt per account, so a second sign-in cannot leave two
  // half-finished logins alive.
  await db.delete(schema.mfaPendingLogins).where(eq(schema.mfaPendingLogins.userId, userId));

  const token = randomBytes(32).toString("base64url");
  const expiresAt = inMinutes(PENDING_LOGIN_TTL_MINUTES);

  await db.insert(schema.mfaPendingLogins).values({
    tokenHash: hashSessionToken(token),
    userId,
    createdAt: nowIso(),
    expiresAt,
  });

  return { token, expiresAt };
}

export async function readPendingLogin(db: Database, token: string) {
  const [row] = await db
    .select()
    .from(schema.mfaPendingLogins)
    .where(
      and(
        eq(schema.mfaPendingLogins.tokenHash, hashSessionToken(token)),
        gt(schema.mfaPendingLogins.expiresAt, nowIso()),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function clearPendingLogins(db: Database, userId: string): Promise<void> {
  await db.delete(schema.mfaPendingLogins).where(eq(schema.mfaPendingLogins.userId, userId));
}

/* -------------------------------------------------------------------------- */
/* Recovery codes                                                             */
/* -------------------------------------------------------------------------- */

/** 64 bits of hex, grouped for a human to copy down. */
function generateRecoveryCode(): string {
  const raw = randomBytes(8).toString("hex");
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
}

/** Formatting is not a secret: the dashed and undashed spellings must both work. */
const normaliseRecoveryCode = (code: string) => code.replace(/[\s-]/g, "").toLowerCase();

/** Replaces every existing code and returns the plaintext, once. */
export async function issueRecoveryCodes(db: Database, userId: string): Promise<string[]> {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, generateRecoveryCode);
  const createdAt = nowIso();

  const rows = await Promise.all(
    codes.map(async (code) => ({
      id: id("rc"),
      userId,
      codeHash: await hashPassword(normaliseRecoveryCode(code)),
      createdAt,
      usedAt: null,
    })),
  );

  await db.transaction(async (tx) => {
    await tx.delete(schema.recoveryCodes).where(eq(schema.recoveryCodes.userId, userId));
    await tx.insert(schema.recoveryCodes).values(rows);
  });

  return codes;
}

export async function recoveryCodesRemaining(db: Database, userId: string): Promise<number> {
  const [row] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(schema.recoveryCodes)
    .where(and(eq(schema.recoveryCodes.userId, userId), isNull(schema.recoveryCodes.usedAt)));
  return row?.value ?? 0;
}

/**
 * Redeems one. Marks it used, so a recovery code is as single-use as any other.
 *
 * Every unused code is hashed with scrypt, so a wrong guess costs a few hundred
 * milliseconds — which is the point: the space is small enough that a cheap
 * comparison would be worth attacking.
 */
export async function consumeRecoveryCode(
  db: Database,
  userId: string,
  code: string,
): Promise<boolean> {
  const candidates = await db
    .select()
    .from(schema.recoveryCodes)
    .where(and(eq(schema.recoveryCodes.userId, userId), isNull(schema.recoveryCodes.usedAt)));

  const normalised = normaliseRecoveryCode(code);
  if (!normalised) return false;

  for (const candidate of candidates) {
    if (await verifyPassword(normalised, candidate.codeHash)) {
      await db
        .update(schema.recoveryCodes)
        .set({ usedAt: nowIso() })
        .where(eq(schema.recoveryCodes.id, candidate.id));
      return true;
    }
  }
  return false;
}
