/**
 * Social sign-in, from state to session.
 *
 * The interesting part is what happens when the provider comes back, because that
 * is where an account can be taken over. The rules, in order:
 *
 *  1. **A known identity wins.** `(provider, subject)` identifies an account. The
 *     subject — Google's `sub`, Facebook's `id` — is the key, never the email, so
 *     a changed address does not move an account.
 *  2. **An unknown identity may attach to an existing account only when the
 *     provider says the email is confirmed.** That is what stops someone pointing
 *     a Facebook account at a stranger's email address and inheriting their
 *     account. Facebook asserts nothing of the kind, so a Facebook sign-in whose
 *     address is already in use is refused with instructions to link it from
 *     account settings instead of silently merging.
 *  3. **Otherwise an account is created**, and it needs an email address: the
 *     column is required and unique. A provider that shares no address (Facebook
 *     users may decline the `email` permission) is refused with a message that
 *     says so, rather than inventing a placeholder.
 */

import { randomBytes } from "node:crypto";
import { and, asc, eq, gt, isNotNull, isNull, lt, sql } from "drizzle-orm";
import { credentialHash } from "../auth/credentials.ts";
import { hashSessionToken } from "../auth/session.ts";
import type { Database } from "../db/index.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest, HttpError, notFound } from "../http/errors.ts";
import { avatarColorFor, defaultDistrictId } from "../users/defaults.ts";
import type { SocialProfile } from "./oauth.ts";
import type { ProviderRow } from "./providers.ts";
import { toPublicProvider } from "./providers.ts";

const STATE_TTL_MINUTES = 10;
const MAX_RETURN_TO_LENGTH = 300;

export type IdentityRow = typeof schema.socialIdentities.$inferSelect;

const nowIso = () => new Date().toISOString();
const inMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

/* -------------------------------------------------------------------------- */
/* Round-trip state                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Only a relative path is accepted.
 *
 * The callback sends the browser somewhere afterwards, so an absolute URL here
 * would be an open redirect — the classic way a sign-in page becomes a phishing
 * relay. A path can only ever land back on this site.
 */
export function validateReturnTo(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_RETURN_TO_LENGTH) return null;
  // "//evil.example" is protocol-relative, and still leaves the site.
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  return trimmed;
}

export async function createState(
  db: Database,
  input: {
    providerId: string;
    purpose: "login" | "link";
    linkUserId?: string | null;
    returnTo?: string | null;
  },
): Promise<string> {
  const state = randomBytes(32).toString("base64url");

  await db.insert(schema.socialLoginStates).values({
    stateHash: hashSessionToken(state),
    providerId: input.providerId,
    purpose: input.purpose,
    linkUserId: input.linkUserId ?? null,
    returnTo: validateReturnTo(input.returnTo),
    createdAt: nowIso(),
    expiresAt: inMinutes(STATE_TTL_MINUTES),
    consumedAt: null,
  });

  return state;
}

/** Reads a state and consumes it in one step, so a code cannot be replayed. */
export async function consumeState(db: Database, state: string) {
  const [row] = await db
    .select()
    .from(schema.socialLoginStates)
    .where(
      and(
        eq(schema.socialLoginStates.stateHash, hashSessionToken(state)),
        isNull(schema.socialLoginStates.consumedAt),
        gt(schema.socialLoginStates.expiresAt, nowIso()),
      ),
    )
    .limit(1);

  if (!row) {
    throw badRequest("This sign-in attempt has expired. Start again from the sign-in page.");
  }

  await db
    .update(schema.socialLoginStates)
    .set({ consumedAt: nowIso() })
    .where(eq(schema.socialLoginStates.stateHash, row.stateHash));

  return row;
}

export async function purgeExpiredStates(db: Database): Promise<void> {
  await db.delete(schema.socialLoginStates).where(lt(schema.socialLoginStates.expiresAt, nowIso()));
}

/* -------------------------------------------------------------------------- */
/* Identities                                                                 */
/* -------------------------------------------------------------------------- */

export async function listIdentities(db: Database, userId: string) {
  const rows = await db
    .select({
      identity: schema.socialIdentities,
      provider: schema.socialProviders,
    })
    .from(schema.socialIdentities)
    .innerJoin(
      schema.socialProviders,
      eq(schema.socialProviders.id, schema.socialIdentities.providerId),
    )
    .where(eq(schema.socialIdentities.userId, userId))
    .orderBy(asc(schema.socialProviders.slug));

  return rows.map((row) => ({
    id: row.identity.id,
    provider: toPublicProvider(row.provider),
    subject: row.identity.subject,
    email: row.identity.email,
    displayName: row.identity.displayName,
    picture: row.identity.picture,
    createdAt: row.identity.createdAt,
    lastLoginAt: row.identity.lastLoginAt,
  }));
}

async function findIdentity(db: Database, providerId: string, subject: string) {
  const [row] = await db
    .select()
    .from(schema.socialIdentities)
    .where(
      and(
        eq(schema.socialIdentities.providerId, providerId),
        eq(schema.socialIdentities.subject, subject),
      ),
    )
    .limit(1);
  return row ?? null;
}

async function attachIdentity(
  db: Database,
  input: { userId: string; providerId: string; profile: SocialProfile },
): Promise<IdentityRow> {
  const [row] = await db
    .insert(schema.socialIdentities)
    .values({
      id: `si-${randomBytes(8).toString("hex")}`,
      userId: input.userId,
      providerId: input.providerId,
      subject: input.profile.subject,
      email: input.profile.email,
      displayName: input.profile.displayName,
      picture: input.profile.picture,
      createdAt: nowIso(),
      lastLoginAt: nowIso(),
    })
    .returning();
  return row!;
}

/* -------------------------------------------------------------------------- */
/* Resolving a sign-in                                                        */
/* -------------------------------------------------------------------------- */

export interface ResolvedSignIn {
  userId: string;
  /** True when this sign-in created the account. */
  created: boolean;
  /** True when it attached to an account that already existed. */
  linked: boolean;
}

export async function resolveSignIn(
  db: Database,
  input: { provider: ProviderRow; profile: SocialProfile },
): Promise<ResolvedSignIn> {
  const { provider, profile } = input;

  // 1. A returning account.
  const known = await findIdentity(db, provider.id, profile.subject);
  if (known) {
    await db
      .update(schema.socialIdentities)
      .set({
        lastLoginAt: nowIso(),
        displayName: profile.displayName ?? known.displayName,
        picture: profile.picture ?? known.picture,
      })
      .where(eq(schema.socialIdentities.id, known.id));

    return { userId: known.userId, created: false, linked: false };
  }

  // 2. An existing account with the same address.
  if (profile.email) {
    const [existing] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, profile.email))
      .limit(1);

    if (existing) {
      if (!profile.emailVerified) {
        throw new HttpError(
          409,
          `${provider.slug} has not confirmed that ${profile.email} belongs to you, and an account already uses that address. ` +
            "Sign in with your password and link this provider from account settings.",
        );
      }

      await attachIdentity(db, {
        userId: existing.id,
        providerId: provider.id,
        profile,
      });
      return { userId: existing.id, created: false, linked: true };
    }
  }

  // 3. A new account — which needs an address the product can recognise.
  if (!profile.email) {
    throw new HttpError(
      400,
      `${provider.slug} did not share an email address, and an email is required to create an account.`,
    );
  }

  const created = await createAccount(db, { profile, provider });
  await attachIdentity(db, { userId: created.id, providerId: provider.id, profile });

  return { userId: created.id, created: true, linked: false };
}

/**
 * An account made from a provider profile.
 *
 * No credentials row: the account has no password until it asks for one, which is
 * exactly how the product knows it must be signed in with a provider. The address
 * is marked verified only when the provider confirmed it.
 */
async function createAccount(
  db: Database,
  input: { profile: SocialProfile; provider: ProviderRow },
): Promise<typeof schema.users.$inferSelect> {
  const email = input.profile.email!;
  const id = `user-${randomBytes(6).toString("hex")}`;
  const now = nowIso();

  const [row] = await db
    .insert(schema.users)
    .values({
      id,
      name: input.profile.displayName ?? email.split("@")[0]!,
      email,
      role: "user",
      avatarColor: avatarColorFor(id),
      district: await defaultDistrictId(db),
      joinedAt: now,
      scholarId: null,
      interests: [],
      isVerified: input.profile.emailVerified,
      status: "active",
      contributions: 0,
    })
    .returning();

  return row!;
}

/* -------------------------------------------------------------------------- */
/* Linking and unlinking                                                      */
/* -------------------------------------------------------------------------- */

/** Attaches a provider to the account already signed in. */
export async function linkIdentity(
  db: Database,
  input: { userId: string; provider: ProviderRow; profile: SocialProfile },
): Promise<IdentityRow> {
  const known = await findIdentity(db, input.provider.id, input.profile.subject);
  if (known) {
    if (known.userId === input.userId) {
      throw badRequest(`This ${input.provider.slug} account is already linked.`);
    }
    throw new HttpError(409, `That ${input.provider.slug} account is linked to another account.`);
  }

  return attachIdentity(db, {
    userId: input.userId,
    providerId: input.provider.id,
    profile: input.profile,
  });
}

export async function findIdentityForUser(db: Database, userId: string, identityId: string) {
  const [row] = await db
    .select({
      identity: schema.socialIdentities,
      provider: schema.socialProviders,
    })
    .from(schema.socialIdentities)
    .innerJoin(
      schema.socialProviders,
      eq(schema.socialProviders.id, schema.socialIdentities.providerId),
    )
    .where(
      and(
        eq(schema.socialIdentities.id, identityId),
        eq(schema.socialIdentities.userId, userId),
      ),
    )
    .limit(1);
  return row ?? null;
}

/**
 * Detaches a provider account — unless it is the last way in.
 *
 * An account with no password and no other identity and no second factor would be
 * unreachable the moment this row goes, so the removal is refused instead of
 * quietly locking someone out of their own account.
 */
export async function unlinkIdentity(
  db: Database,
  userId: string,
  identityId: string,
): Promise<void> {
  const found = await findIdentityForUser(db, userId, identityId);
  if (!found) throw notFound("No such linked account");

  const [otherIdentities, password, factors] = await Promise.all([
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.socialIdentities)
      .where(eq(schema.socialIdentities.userId, userId))
      .then((rows) => rows[0]?.value ?? 0),
    credentialHash(db, userId),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.mfaFactors)
      .where(and(eq(schema.mfaFactors.userId, userId), isNotNull(schema.mfaFactors.verifiedAt)))
      .then((rows) => rows[0]?.value ?? 0),
  ]);

  if (otherIdentities <= 1 && !password && factors === 0) {
    throw badRequest(
      "This is the only way to sign in to the account. Add a password first, then unlink it.",
    );
  }

  await db
    .delete(schema.socialIdentities)
    .where(eq(schema.socialIdentities.id, identityId));
}


