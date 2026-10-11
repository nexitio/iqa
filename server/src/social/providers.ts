/**
 * Provider configuration: reading it, validating it, and never leaking the secret.
 *
 * Three shapes for one row, because three audiences need different things:
 *
 *  - `toPublicProvider` — a sign-in page learns a slug and a label, and nothing
 *    else, so listing providers cannot become a way to fingerprint the deployment.
 *  - `toAdminProvider` — the console gets the configuration and `hasClientSecret`,
 *    but never the secret, in either direction.
 *  - `toConfig` — the flow gets the decrypted secret, for the length of one
 *    ceremony. This is the only function that decrypts, and it is the only place
 *    plaintext exists outside the request that used it.
 */

import { randomBytes } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import type { Database } from "../db/index.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest, HttpError, notFound } from "../http/errors.ts";
import { decryptSecret, encryptSecret } from "./crypto.ts";

export type ProviderRow = typeof schema.socialProviders.$inferSelect;

export const TOKEN_METHODS = ["get", "post"] as const;
export const CLIENT_AUTHS = ["body", "basic"] as const;
export const USERINFO_AUTHS = ["bearer", "query"] as const;

export interface ProviderConfig {
  slug: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  scopes: string[];
  tokenMethod: (typeof TOKEN_METHODS)[number];
  clientAuth: (typeof CLIENT_AUTHS)[number];
  userinfoAuth: (typeof USERINFO_AUTHS)[number];
  sendAppSecretProof: boolean;
  extraAuthorizeParams: Record<string, string>;
  userinfoParams: Record<string, string>;
  claims: {
    subject: string;
    email: string | null;
    name: string | null;
    picture: string | null;
    /** Null when the provider asserts nothing about the address being confirmed. */
    emailVerified: string | null;
  };
}

/* -------------------------------------------------------------------------- */
/* Shapes                                                                     */
/* -------------------------------------------------------------------------- */

export function toPublicProvider(row: ProviderRow) {
  return { slug: row.slug, name: row.name };
}

export function toAdminProvider(row: ProviderRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    enabled: row.enabled,
    clientId: row.clientId,
    /** The console's whole knowledge of the secret: whether there is one. */
    hasClientSecret: row.clientSecretEncrypted.length > 0,
    redirectUri: row.redirectUri,
    authorizationUrl: row.authorizationUrl,
    tokenUrl: row.tokenUrl,
    userinfoUrl: row.userinfoUrl,
    scopes: row.scopes,
    tokenMethod: row.tokenMethod,
    clientAuth: row.clientAuth,
    userinfoAuth: row.userinfoAuth,
    sendAppSecretProof: row.sendAppSecretProof,
    extraAuthorizeParams: row.extraAuthorizeParams,
    userinfoParams: row.userinfoParams,
    claims: {
      subject: row.claimSubject,
      email: row.claimEmail,
      name: row.claimName,
      picture: row.claimPicture,
      emailVerified: row.claimEmailVerified,
    },
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy,
  };
}

/**
 * The flow's view, secret decrypted.
 *
 * A secret that will not decrypt is a configuration problem with a known fix, so
 * it is reported as one instead of surfacing later as an opaque provider error.
 */
export function toConfig(row: ProviderRow): ProviderConfig {
  let clientSecret: string;
  try {
    clientSecret = decryptSecret(row.clientSecretEncrypted);
  } catch {
    throw new HttpError(
      500,
      `The stored client secret for "${row.slug}" cannot be decrypted — ILM_SECRET_KEY has probably changed. Enter the secret again in the admin console.`,
    );
  }

  return {
    slug: row.slug,
    clientId: row.clientId,
    clientSecret,
    redirectUri: row.redirectUri,
    authorizationUrl: row.authorizationUrl,
    tokenUrl: row.tokenUrl,
    userinfoUrl: row.userinfoUrl,
    scopes: row.scopes,
    tokenMethod: row.tokenMethod,
    clientAuth: row.clientAuth,
    userinfoAuth: row.userinfoAuth,
    sendAppSecretProof: row.sendAppSecretProof,
    extraAuthorizeParams: row.extraAuthorizeParams,
    userinfoParams: row.userinfoParams,
    claims: {
      subject: row.claimSubject,
      email: row.claimEmail,
      name: row.claimName,
      picture: row.claimPicture,
      emailVerified: row.claimEmailVerified,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                      */
/* -------------------------------------------------------------------------- */

export async function listProviders(db: Database): Promise<ProviderRow[]> {
  return db.select().from(schema.socialProviders).orderBy(asc(schema.socialProviders.slug));
}

export async function enabledProviders(db: Database): Promise<ProviderRow[]> {
  return db
    .select()
    .from(schema.socialProviders)
    .where(eq(schema.socialProviders.enabled, true))
    .orderBy(asc(schema.socialProviders.slug));
}

export async function findProviderBySlug(
  db: Database,
  slug: string,
): Promise<ProviderRow | null> {
  const [row] = await db
    .select()
    .from(schema.socialProviders)
    .where(eq(schema.socialProviders.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function findProviderById(db: Database, id: string): Promise<ProviderRow | null> {
  const [row] = await db
    .select()
    .from(schema.socialProviders)
    .where(eq(schema.socialProviders.id, id))
    .limit(1);
  return row ?? null;
}

/** The provider a sign-in is allowed to use: it must exist *and* be switched on. */
export async function requireEnabledProvider(db: Database, slug: string): Promise<ProviderRow> {
  const row = await findProviderBySlug(db, slug);
  if (!row || !row.enabled) throw notFound(`No enabled social provider "${slug}"`);
  return row;
}

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

const SLUG = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

/**
 * Plain http is refused except on loopback, where a test stub lives.
 *
 * An authorization or token endpoint over http would put the client secret and
 * the one-time code on the wire in clear text, so the rule is enforced at
 * configuration time rather than discovered in a review.
 */
function assertHttpsUrl(value: string, field: string): void {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw badRequest(`${field} must be an absolute URL`);
  }

  const loopback =
    url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "[::1]";
  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) {
    throw badRequest(`${field} must use https (http is allowed only on loopback, for tests)`);
  }
}

export interface ProviderInput {
  slug?: string;
  name?: { bn: string; en: string };
  enabled?: boolean;
  clientId?: string;
  /** Omitted on an update means "leave the stored secret alone". */
  clientSecret?: string;
  redirectUri?: string;
  authorizationUrl?: string;
  tokenUrl?: string;
  userinfoUrl?: string;
  scopes?: string[];
  tokenMethod?: string;
  clientAuth?: string;
  userinfoAuth?: string;
  sendAppSecretProof?: boolean;
  extraAuthorizeParams?: Record<string, string>;
  userinfoParams?: Record<string, string>;
  claims?: {
    subject?: string;
    email?: string | null;
    name?: string | null;
    picture?: string | null;
    emailVerified?: string | null;
  };
}

const oneOf = <T extends readonly string[]>(
  values: T,
  value: string,
  field: string,
): T[number] => {
  if (!values.includes(value)) throw badRequest(`${field} must be one of: ${values.join(", ")}`);
  return value as T[number];
};

/**
 * Validates the parts a create or update supplies, on top of an existing row when
 * there is one — so a partial update is checked against the configuration it will
 * actually end up with, not against the fields it happened to include.
 */
export function validateProviderInput(
  input: ProviderInput,
  existing: ProviderRow | null,
): void {
  const slug = input.slug ?? existing?.slug;
  if (!slug || !SLUG.test(slug)) {
    throw badRequest("slug must be 3–40 characters of lowercase letters, digits and dashes");
  }

  const clientId = input.clientId ?? existing?.clientId;
  if (!clientId?.trim()) throw badRequest("clientId is required");

  const clientSecret = input.clientSecret ?? (existing ? "stored" : undefined);
  if (!clientSecret) throw badRequest("clientSecret is required");

  for (const [field, value] of [
    ["redirectUri", input.redirectUri ?? existing?.redirectUri],
    ["authorizationUrl", input.authorizationUrl ?? existing?.authorizationUrl],
    ["tokenUrl", input.tokenUrl ?? existing?.tokenUrl],
    ["userinfoUrl", input.userinfoUrl ?? existing?.userinfoUrl],
  ] as const) {
    if (!value) throw badRequest(`${field} is required`);
    assertHttpsUrl(value, field);
  }

  const subject = input.claims?.subject ?? existing?.claimSubject;
  if (!subject?.trim()) {
    throw badRequest("claims.subject is required — it is what identifies the account");
  }

  if (input.tokenMethod) oneOf(TOKEN_METHODS, input.tokenMethod, "tokenMethod");
  if (input.clientAuth) oneOf(CLIENT_AUTHS, input.clientAuth, "clientAuth");
  if (input.userinfoAuth) oneOf(USERINFO_AUTHS, input.userinfoAuth, "userinfoAuth");

  if (input.name && (!input.name.bn?.trim() || !input.name.en?.trim())) {
    throw badRequest("name needs both bn and en");
  }
}

/* -------------------------------------------------------------------------- */
/* Writes                                                                     */
/* -------------------------------------------------------------------------- */

export async function createProvider(
  db: Database,
  input: ProviderInput,
  updatedBy: string,
): Promise<ProviderRow> {
  validateProviderInput(input, null);

  const now = new Date().toISOString();
  const [row] = await db
    .insert(schema.socialProviders)
    .values({
      id: `sp-${randomBytes(8).toString("hex")}`,
      slug: input.slug!,
      name: input.name ?? { bn: input.slug!, en: input.slug! },
      enabled: input.enabled ?? false,
      clientId: input.clientId!,
      clientSecretEncrypted: encryptSecret(input.clientSecret!),
      redirectUri: input.redirectUri!,
      authorizationUrl: input.authorizationUrl!,
      tokenUrl: input.tokenUrl!,
      userinfoUrl: input.userinfoUrl!,
      extraAuthorizeParams: input.extraAuthorizeParams ?? {},
      userinfoParams: input.userinfoParams ?? {},
      scopes: input.scopes ?? [],
      tokenMethod: (input.tokenMethod as ProviderRow["tokenMethod"]) ?? "post",
      clientAuth: (input.clientAuth as ProviderRow["clientAuth"]) ?? "body",
      userinfoAuth: (input.userinfoAuth as ProviderRow["userinfoAuth"]) ?? "bearer",
      sendAppSecretProof: input.sendAppSecretProof ?? false,
      claimSubject: input.claims?.subject ?? "sub",
      claimEmail: input.claims?.email ?? "email",
      claimName: input.claims?.name ?? "name",
      claimPicture: input.claims?.picture ?? "picture",
      claimEmailVerified: input.claims?.emailVerified ?? null,
      createdAt: now,
      updatedAt: now,
      updatedBy,
    })
    .returning();

  return row!;
}

export async function updateProvider(
  db: Database,
  id: string,
  input: ProviderInput,
  updatedBy: string,
): Promise<ProviderRow> {
  const existing = await findProviderById(db, id);
  if (!existing) throw notFound("No such provider");
  validateProviderInput(input, existing);

  const [row] = await db
    .update(schema.socialProviders)
    .set({
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.clientId !== undefined ? { clientId: input.clientId } : {}),
      // An absent or blank secret keeps the stored one: the console can edit a
      // scope without ever handling the secret again.
      ...(input.clientSecret ? { clientSecretEncrypted: encryptSecret(input.clientSecret) } : {}),
      ...(input.redirectUri !== undefined ? { redirectUri: input.redirectUri } : {}),
      ...(input.authorizationUrl !== undefined
        ? { authorizationUrl: input.authorizationUrl }
        : {}),
      ...(input.tokenUrl !== undefined ? { tokenUrl: input.tokenUrl } : {}),
      ...(input.userinfoUrl !== undefined ? { userinfoUrl: input.userinfoUrl } : {}),
      ...(input.scopes !== undefined ? { scopes: input.scopes } : {}),
      ...(input.tokenMethod !== undefined
        ? { tokenMethod: input.tokenMethod as ProviderRow["tokenMethod"] }
        : {}),
      ...(input.clientAuth !== undefined
        ? { clientAuth: input.clientAuth as ProviderRow["clientAuth"] }
        : {}),
      ...(input.userinfoAuth !== undefined
        ? { userinfoAuth: input.userinfoAuth as ProviderRow["userinfoAuth"] }
        : {}),
      ...(input.sendAppSecretProof !== undefined
        ? { sendAppSecretProof: input.sendAppSecretProof }
        : {}),
      ...(input.extraAuthorizeParams !== undefined
        ? { extraAuthorizeParams: input.extraAuthorizeParams }
        : {}),
      ...(input.userinfoParams !== undefined ? { userinfoParams: input.userinfoParams } : {}),
      ...(input.claims?.subject !== undefined ? { claimSubject: input.claims.subject } : {}),
      ...(input.claims && "email" in input.claims ? { claimEmail: input.claims.email } : {}),
      ...(input.claims && "name" in input.claims ? { claimName: input.claims.name } : {}),
      ...(input.claims && "picture" in input.claims ? { claimPicture: input.claims.picture } : {}),
      ...(input.claims && "emailVerified" in input.claims
        ? { claimEmailVerified: input.claims.emailVerified }
        : {}),
      updatedAt: new Date().toISOString(),
      updatedBy,
    })
    .where(eq(schema.socialProviders.id, id))
    .returning();

  return row!;
}

export async function deleteProvider(db: Database, id: string): Promise<boolean> {
  const removed = await db
    .delete(schema.socialProviders)
    .where(eq(schema.socialProviders.id, id))
    .returning();
  return removed.length > 0;
}
