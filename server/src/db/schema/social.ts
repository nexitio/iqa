/**
 * Social sign-in.
 *
 * The requirement that shaped this file: **provider configuration lives in the
 * database and is administered, not deployed.** So a provider is a row, and
 * everything two OAuth implementations disagree about is a column —
 *
 *  - `tokenMethod` / `clientAuth`: Facebook exchanges its code with a GET and the
 *    secret in the query string; Google posts an `application/x-www-form-urlencoded`
 *    form with the secret in the body.
 *  - `userinfoAuth`: Google reads `Authorization: Bearer …`, Facebook's Graph API
 *    documentation puts `access_token` in the query.
 *  - `claim*`: which field in the profile payload is the id, the email, the name,
 *    the picture — and whether the provider makes any verifiable claim that the
 *    email is confirmed. Paths may be dotted, because Facebook nests the picture
 *    at `picture.data.url`.
 *  - `sendAppSecretProof`: Facebook's `appsecret_proof`, an HMAC of the access
 *    token keyed with the client secret.
 *
 * Adding a provider is therefore an admin form, and the flow code has no branch
 * that names Facebook or Google. The smoke suite relies on exactly that: it
 * registers a *stub* provider pointing at a local HTTP server and runs the whole
 * ceremony through it.
 */

import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Localized } from "@/lib/types";
import { localized, textArray } from "./columns.ts";
import {
  oauthClientAuthEnum,
  oauthStatePurposeEnum,
  oauthTokenMethodEnum,
  oauthUserinfoAuthEnum,
} from "./enums.ts";
import { users } from "./people.ts";

export const socialProviders = pgTable(
  "social_providers",
  {
    id: text("id").primaryKey(),
    /** The path segment in `/auth/social/:slug/…`, and the stable public name. */
    slug: text("slug").notNull(),
    name: localized("name"),
    /**
     * Off by default. A provider row can be configured, tested and left dark, and
     * a disabled provider is invisible to the sign-in page as well as unusable.
     */
    enabled: boolean("enabled").notNull().default(false),

    clientId: text("client_id").notNull(),
    /**
     * Ciphertext, never the secret itself — see `src/social/crypto.ts`. The API
     * can report that a secret is set and never read it back out.
     */
    clientSecretEncrypted: text("client_secret_encrypted").notNull(),

    /**
     * Stored rather than derived from the request. The callback URL must match the
     * one registered with the provider exactly, so it is configuration — and
     * deriving it from a `Host` header would let an attacker choose it.
     */
    redirectUri: text("redirect_uri").notNull(),

    authorizationUrl: text("authorization_url").notNull(),
    tokenUrl: text("token_url").notNull(),
    userinfoUrl: text("userinfo_url").notNull(),
    /** Extra authorization parameters verbatim, e.g. Google's `prompt`. */
    extraAuthorizeParams: jsonb("extra_authorize_params")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    /**
     * Extra profile-request parameters. Facebook's Graph API returns nothing until
     * you ask for it, so its row carries `{"fields": "id,name,email,picture"}` —
     * which keeps that quirk in configuration rather than in the flow.
     */
    userinfoParams: jsonb("userinfo_params").$type<Record<string, string>>().notNull().default({}),

    scopes: textArray("scopes"),

    tokenMethod: oauthTokenMethodEnum("token_method").notNull().default("post"),
    clientAuth: oauthClientAuthEnum("client_auth").notNull().default("body"),
    userinfoAuth: oauthUserinfoAuthEnum("userinfo_auth").notNull().default("bearer"),
    sendAppSecretProof: boolean("send_app_secret_proof").notNull().default(false),

    claimSubject: text("claim_subject").notNull().default("sub"),
    claimEmail: text("claim_email"),
    claimName: text("claim_name"),
    claimPicture: text("claim_picture"),
    /**
     * Null means the provider asserts nothing about the address being confirmed —
     * which is the honest state for Facebook, and the reason an existing password
     * account is never auto-linked from a Facebook sign-in.
     */
    claimEmailVerified: text("claim_email_verified"),

    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
    /** The admin who last wrote this row, for the console's audit trail. */
    updatedBy: text("updated_by").references(() => users.id, { onDelete: "set null" }),
  },
  (t) => [uniqueIndex("social_providers_slug_key").on(t.slug)],
);

/** One provider account, attached to one account here. */
export const socialIdentities = pgTable(
  "social_identities",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerId: text("provider_id")
      .notNull()
      .references(() => socialProviders.id, { onDelete: "cascade" }),
    /** The provider's own user id — `sub` on Google, `id` on Facebook. */
    subject: text("subject").notNull(),
    /** As the provider reported it, for the account screen. Not the account key. */
    email: text("email"),
    displayName: text("display_name"),
    picture: text("picture"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "string" }),
  },
  (t) => [
    // The whole point: one subject, one account.
    uniqueIndex("social_identities_provider_subject_key").on(t.providerId, t.subject),
    index("social_identities_user_idx").on(t.userId),
  ],
);

/**
 * A provider redirect in flight.
 *
 * `state` is generated here and verified on the way back, which is what stops an
 * attacker from completing someone else's sign-in with a code of their choosing.
 * It is single-use and short-lived, and it is also where the round trip remembers
 * what it was for: a login, or a link to the account already signed in.
 */
export const socialLoginStates = pgTable(
  "social_login_states",
  {
    /** SHA-256 of the state parameter, so the table holds nothing reusable. */
    stateHash: text("state_hash").primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => socialProviders.id, { onDelete: "cascade" }),
    purpose: oauthStatePurposeEnum("purpose").notNull(),
    /** Set for a link: the account the round trip will attach the identity to. */
    linkUserId: text("link_user_id").references(() => users.id, { onDelete: "cascade" }),
    /** Where to send the browser afterwards, already validated against the allowlist. */
    returnTo: text("return_to"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true, mode: "string" }),
  },
  (t) => [
    index("social_login_states_provider_idx").on(t.providerId),
    index("social_login_states_expires_idx").on(t.expiresAt),
  ],
);

/** The bilingual display name a provider row carries. */
export type SocialProviderName = Localized;
