/**
 * The browser's side of social sign-in configuration.
 *
 * The admin console is the only caller today, and it is deliberately thin: a
 * provider is a row, the API owns every rule about one — https-only endpoints,
 * the transport enums, which fields are required — and this module's job is to
 * carry a form to it and its answer back.
 *
 * Calls go to this app's own `/api/admin/*`, never to the API directly, because
 * the session cookie belongs to this origin. The API re-checks the admin role on
 * every one of them, so hiding the console is a convenience and never the
 * control.
 *
 * The client secret is the one thing that only travels inward: a stored secret
 * comes back as `hasClientSecret`, never as a value, and a save leaves it alone
 * unless the form supplies a new one.
 */

import { request, type AuthResult } from "./auth-client";
import type { Localized } from "./types";

/** One provider row as the console reads it. */
export interface AdminSocialProvider {
  id: string;
  slug: string;
  name: Localized;
  enabled: boolean;
  clientId: string;
  /** The console's whole knowledge of the secret: whether one is stored. */
  hasClientSecret: boolean;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  scopes: string[];
  tokenMethod: "get" | "post";
  clientAuth: "body" | "basic";
  userinfoAuth: "bearer" | "query";
  sendAppSecretProof: boolean;
  /** Extra authorization parameters, verbatim — e.g. Google's `prompt`. */
  extraAuthorizeParams: Record<string, string>;
  /** Extra profile-request parameters — e.g. Facebook's `fields`. */
  userinfoParams: Record<string, string>;
  claims: {
    subject: string;
    email: string | null;
    name: string | null;
    picture: string | null;
    emailVerified: string | null;
  };
  createdAt: string;
  updatedAt: string;
  /** The admin who last wrote the row, for the audit trail. */
  updatedBy: string | null;
}

/**
 * What a save sends.
 *
 * Every field is optional on purpose: this is the same shape for a create and a
 * patch, and the API validates what a create actually needs. A blank
 * `clientSecret` leaves the stored one alone.
 */
export interface ProviderInput {
  slug?: string;
  name?: Localized;
  enabled?: boolean;
  clientId?: string;
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

/** What an inspect answers: what a human has to paste into the provider. */
export interface ProviderInspection {
  slug: string;
  /** Register this with the provider, character for character. */
  redirectUri: string;
  /** Opening this is the whole "try it" — and proof the secret still decrypts. */
  authorizationUrl: string;
  scopes: string[];
  secretReadable: boolean;
}

export async function listSocialProviders(): Promise<AuthResult<AdminSocialProvider[]>> {
  return request<AdminSocialProvider[]>("/api/admin/social-providers", { method: "GET" });
}

export async function createSocialProvider(
  input: ProviderInput,
): Promise<AuthResult<AdminSocialProvider>> {
  return request<AdminSocialProvider>("/api/admin/social-providers", { method: "POST", body: input });
}

export async function updateSocialProvider(
  id: string,
  input: ProviderInput,
): Promise<AuthResult<AdminSocialProvider>> {
  return request<AdminSocialProvider>(
    `/api/admin/social-providers/${encodeURIComponent(id)}`,
    { method: "PATCH", body: input },
  );
}

export async function inspectSocialProvider(
  id: string,
): Promise<AuthResult<ProviderInspection>> {
  return request<ProviderInspection>(
    `/api/admin/social-providers/${encodeURIComponent(id)}/inspect`,
    { method: "POST" },
  );
}

export async function deleteSocialProvider(
  id: string,
): Promise<AuthResult<{ id: string; removed: boolean }>> {
  return request<{ id: string; removed: boolean }>(
    `/api/admin/social-providers/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}
