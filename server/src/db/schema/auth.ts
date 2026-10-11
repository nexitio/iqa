/**
 * Credentials and sessions.
 *
 * Two tables, deliberately *not* columns on `users`:
 *
 *  - `auth_credentials` holds the password hash. It is its own table so that
 *    `select().from(users)` — which a dozen DTO mappers do — cannot pull a hash
 *    into a response by accident. There is no column to forget to strip, and the
 *    `User` type `src/lib/types.ts` declares has nowhere to put one.
 *  - `sessions` holds one row per signed-in device, keyed by the SHA-256 of the
 *    bearer token. The token itself only ever exists in the caller's cookie, so
 *    a leaked database dump cannot be replayed against the API.
 */

import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { textArray } from "./columns.ts";
import { mfaChallengePurposeEnum, mfaFactorKindEnum } from "./enums.ts";
import { users } from "./people.ts";

export const authCredentials = pgTable("auth_credentials", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  /** `scrypt$N$r$p$salt$hash` — see src/auth/password.ts for the parameters. */
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
});

/* -------------------------------------------------------------------------- */
/* Second factors                                                             */
/* -------------------------------------------------------------------------- */

/**
 * One enrolled second factor: a passkey, or an email address / phone number that
 * codes are sent to.
 *
 * All three live in one table because they answer the same question — "what can
 * this account prove?" — and because the login step needs to list every option
 * in one query. The passkey columns are simply null for the code channels.
 */
export const mfaFactors = pgTable(
  "mfa_factors",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: mfaFactorKindEnum("kind").notNull(),
    /**
     * Where a code is sent: an email address or an E.164 phone number. Null for a
     * passkey, which has no destination to deliver to.
     */
    destination: text("destination"),
    /** What the owner calls it, e.g. "iPhone" or "office number". */
    label: text("label").notNull(),
    /* --- passkey only -------------------------------------------------- */
    /** Base64url credential id, as WebAuthn spells it. */
    credentialId: text("credential_id"),
    /** The COSE public key, base64url — this is the secret that verifies a login. */
    publicKey: text("public_key"),
    /** Signature counter, to detect a cloned authenticator. */
    counter: integer("counter").notNull().default(0),
    transports: textArray("transports"),
    deviceType: text("device_type"),
    backedUp: boolean("backed_up").notNull().default(false),
    /* --- shared --------------------------------------------------------- */
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "string" }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true, mode: "string" }),
  },
  (t) => [
    index("mfa_factors_user_idx").on(t.userId),
    // Postgres treats NULLs as distinct, so the many passkey rows (no destination)
    // coexist with this, while one address or number is enrolled only once.
    uniqueIndex("mfa_factors_user_destination_key").on(t.userId, t.destination),
    uniqueIndex("mfa_factors_credential_key").on(t.credentialId),
  ],
);

/**
 * A single in-flight verification.
 *
 * One row holds either a hashed one-time code (email, SMS, recovery) or the
 * WebAuthn challenge (passkey) — never both — together with the attempt counter
 * and expiry that make guessing bounded.
 */
export const mfaChallenges = pgTable(
  "mfa_challenges",
  {
    id: text("id").primaryKey(),
    /**
     * The account this verification belongs to.
     *
     * Nullable for exactly one case: the credential-first passkey sign-in that
     * conditional UI starts before anything has been typed, where there is no
     * account to name yet. It gains an owner at verification, when the assertion
     * names a credential and that row says whose it is. Every other challenge is
     * still written with an account.
     */
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
    purpose: mfaChallengePurposeEnum("purpose").notNull(),
    kind: mfaFactorKindEnum("kind").notNull(),
    /** Set once the factor exists; null while a new address is being enrolled. */
    factorId: text("factor_id").references(() => mfaFactors.id, { onDelete: "cascade" }),
    destination: text("destination"),
    codeHash: text("code_hash"),
    webauthnChallenge: text("webauthn_challenge"),
    attempts: integer("attempts").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true, mode: "string" }),
  },
  (t) => [
    index("mfa_challenges_user_idx").on(t.userId),
    index("mfa_challenges_expires_idx").on(t.expiresAt),
  ],
);

/**
 * A password that was correct but is not yet a session.
 *
 * When an account has a second factor, a valid password earns this token instead
 * of a session cookie, so a stolen password alone reaches nothing. Stored hashed,
 * like a session token, and short-lived.
 */
export const mfaPendingLogins = pgTable(
  "mfa_pending_logins",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
  },
  (t) => [index("mfa_pending_logins_user_idx").on(t.userId)],
);

/**
 * Single-use codes for a lost device.
 *
 * Without these, a reader whose phone is gone is locked out of their own account
 * with no way back — which is why they are issued the moment a first factor is
 * enrolled, and why the response that carries them is the only one that ever
 * will.
 */
export const recoveryCodes = pgTable(
  "recovery_codes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true, mode: "string" }),
  },
  (t) => [index("recovery_codes_user_idx").on(t.userId)],
);

export const sessions = pgTable(
  "sessions",
  {
    /**
     * The public id of one signed-in device — what a device list shows and what a
     * reader revokes by. Deliberately *not* derived from the token: nothing that
     * leaves the server should be a step towards recreating a credential.
     */
    id: text("id").primaryKey(),
    /** SHA-256 of the token, hex-encoded. The token itself is never stored. */
    tokenHash: text("token_hash").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    /** Refreshed at most every few minutes; drives "last active" on that screen. */
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true, mode: "string" }).notNull(),
    /** Truncated at write time — a header is attacker-controlled input. */
    userAgent: text("user_agent"),
  },
  (t) => [
    // The lookup every authenticated request makes, so it must be indexed.
    uniqueIndex("sessions_token_hash_key").on(t.tokenHash),
    index("sessions_user_idx").on(t.userId),
    // Expiry sweeps and the `expires_at > now()` check both read this.
    index("sessions_expires_idx").on(t.expiresAt),
  ],
);
