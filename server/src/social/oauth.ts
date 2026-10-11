/**
 * The OAuth dance, written once for every provider.
 *
 * Nothing in this file names Facebook or Google. Each difference between them is
 * read from the provider row: whether the code is exchanged with a GET or a POST,
 * whether the secret travels in the body or in a basic-auth header, whether the
 * access token goes in a header or a query parameter, whether the profile request
 * has to ask for its fields, whether an app-secret proof is expected, and which
 * field in the payload means what.
 *
 * That is what makes the flow testable without Facebook: point a provider row at
 * a stub server and the same code path runs.
 */

import { createHmac } from "node:crypto";
import { HttpError } from "../http/errors.ts";
import type { ProviderConfig } from "./providers.ts";

/** A provider failure is reported as 502 — it is an upstream, not a client, error. */
function providerFailed(slug: string, status: number, detail: string): HttpError {
  return new HttpError(502, `${slug} refused the sign-in (${status}): ${detail}`);
}

/**
 * Facebook nests an error in `error.message`; Google returns `error` and
 * `error_description`. Neither value can contain our secret or the code, and the
 * length is capped so a provider cannot dictate a huge log line.
 */
function describeFailure(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "no detail";
  const record = payload as Record<string, unknown>;

  if (typeof record.error_description === "string") return record.error_description.slice(0, 200);
  if (typeof record.error === "string") return record.error.slice(0, 200);
  if (record.error && typeof record.error === "object") {
    const message = (record.error as Record<string, unknown>).message;
    if (typeof message === "string") return message.slice(0, 200);
  }
  return "no detail";
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text.slice(0, 200) };
  }
}

/* -------------------------------------------------------------------------- */
/* Authorization                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Where to send the browser. `state` is ours, generated per attempt, and is the
 * only thing binding the callback to this attempt.
 */
export function authorizationUrl(config: ProviderConfig, state: string): string {
  const url = new URL(config.authorizationUrl);
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  if (config.scopes.length > 0) url.searchParams.set("scope", config.scopes.join(" "));

  // Verbatim from configuration: Google's `prompt=select_account` and
  // `access_type=online` belong here rather than in a branch on the slug.
  for (const [key, value] of Object.entries(config.extraAuthorizeParams)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

/* -------------------------------------------------------------------------- */
/* Code exchange                                                              */
/* -------------------------------------------------------------------------- */

export async function exchangeCode(config: ProviderConfig, code: string): Promise<string> {
  const params = new URLSearchParams({
    code,
    // Sent again because providers require the exchange to repeat the redirect
    // used to obtain the code, and it must match character for character.
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    grant_type: "authorization_code",
  });

  const headers: Record<string, string> = { accept: "application/json" };
  if (config.clientAuth === "body") {
    params.set("client_secret", config.clientSecret);
  } else {
    params.set("client_id", config.clientId);
    headers.authorization = `Basic ${Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
    ).toString("base64")}`;
  }

  const response =
    config.tokenMethod === "get"
      ? // Facebook: a GET with everything in the query string.
        await fetch(`${config.tokenUrl}?${params.toString()}`, { headers })
      : await fetch(config.tokenUrl, {
          method: "POST",
          headers: { ...headers, "content-type": "application/x-www-form-urlencoded" },
          body: params,
        });

  const payload = await readJson(response);
  const accessToken =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>).access_token
      : undefined;

  if (!response.ok || typeof accessToken !== "string" || !accessToken) {
    // The request URL is never echoed: on the GET style it contains the secret.
    throw providerFailed(config.slug, response.status, describeFailure(payload));
  }

  return accessToken;
}

/* -------------------------------------------------------------------------- */
/* Profile                                                                    */
/* -------------------------------------------------------------------------- */

/** Reads a dotted path, because Facebook nests the picture at `picture.data.url`. */
function claimAt(payload: Record<string, unknown>, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (value, key) =>
        value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined,
      payload,
    );
}

function asString(value: unknown): string | null {
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  return null;
}

/**
 * Some providers send `email_verified` as a JSON boolean and some as the string
 * `"true"`; both are treated the same, and anything else counts as not verified.
 */
function asBoolean(value: unknown): boolean {
  return value === true || value === "true";
}

export interface SocialProfile {
  subject: string;
  email: string | null;
  displayName: string | null;
  picture: string | null;
  /** True only when the provider actually asserted confirmation. */
  emailVerified: boolean;
}

export async function fetchProfile(
  config: ProviderConfig,
  accessToken: string,
): Promise<SocialProfile> {
  const url = new URL(config.userinfoUrl);
  const headers: Record<string, string> = { accept: "application/json" };

  if (config.userinfoAuth === "bearer") {
    headers.authorization = `Bearer ${accessToken}`;
  } else {
    url.searchParams.set("access_token", accessToken);
    if (config.sendAppSecretProof) {
      url.searchParams.set("appsecret_proof", appSecretProof(config, accessToken));
    }
  }

  // Graph returns nothing until you name the fields, so a provider can be told to
  // ask; standard OIDC endpoints simply ignore extra parameters.
  for (const [key, value] of Object.entries(config.userinfoParams)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), { headers });
  const payload = await readJson(response);

  if (!response.ok || !payload || typeof payload !== "object") {
    throw providerFailed(config.slug, response.status, describeFailure(payload));
  }

  return extractProfile(config, payload as Record<string, unknown>);
}

/** Maps a provider payload onto the one shape the rest of the server understands. */
export function extractProfile(
  config: ProviderConfig,
  payload: Record<string, unknown>,
): SocialProfile {
  const subject = asString(claimAt(payload, config.claims.subject));
  if (!subject) {
    throw new HttpError(
      502,
      `${config.slug} did not return the "${config.claims.subject}" field, which identifies the account.`,
    );
  }

  return {
    subject,
    email: config.claims.email ? asString(claimAt(payload, config.claims.email)) : null,
    displayName: config.claims.name ? asString(claimAt(payload, config.claims.name)) : null,
    picture: config.claims.picture ? asString(claimAt(payload, config.claims.picture)) : null,
    emailVerified: config.claims.emailVerified
      ? asBoolean(claimAt(payload, config.claims.emailVerified))
      : false,
  };
}

/**
 * `appsecret_proof`: an HMAC of the access token, keyed with the client secret.
 * Facebook requires it when the app is set to require the app secret, and treats
 * it as proof that the server holding the token also holds the secret.
 */
export function appSecretProof(config: ProviderConfig, accessToken: string): string {
  return createHmac("sha256", config.clientSecret).update(accessToken).digest("hex");
}
