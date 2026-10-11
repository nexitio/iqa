/**
 * The app's side of the Hono API.
 *
 * Only what the browser pages need so far — the social hand-off, and the provider
 * list that decides which buttons to draw. The list is read from the API rather
 * than written out here, because a provider is a row an admin manages: enabling
 * one in the console is what makes its button appear on the sign-in page.
 */

import type { Localized } from "./types";

/**
 * The API origin. A public value by design — the browser is handed off to this
 * origin for the OAuth ceremony, and exposing it reveals nothing: the client
 * secrets never leave the server.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

export interface SocialProvider {
  slug: string;
  name: Localized;
}

function apiUrl(path: string): string {
  return `${API_URL.replace(/\/+$/, "")}${path}`;
}

/**
 * Where the browser leaves for a provider.
 *
 * The API owns the whole ceremony — state, code exchange, session — so this is a
 * plain navigation, not a fetch. `returnTo` is a path on this site, and the API
 * refuses anything else, so a crafted link cannot turn the sign-in page into an
 * open redirect.
 */
export function socialStartUrl(slug: string, returnTo = "/"): string {
  const url = new URL(apiUrl(`/api/v1/auth/social/${slug}/start`));
  url.searchParams.set("returnTo", returnTo);
  return url.toString();
}

/**
 * The providers a visitor may actually sign in with.
 *
 * Deliberately forgiving: an API that is down, slow or answering nonsense yields
 * an empty list, so the page still renders and the social block is simply absent.
 * A button that leads to an error page is worse than no button, and this page has
 * no way to explain a backend failure that belongs to another service.
 */
export async function enabledSocialProviders(): Promise<SocialProvider[]> {
  try {
    const response = await fetch(apiUrl("/api/v1/auth/social/providers"), {
      // Configuration, not content: read it per request instead of freezing the
      // button set into the build.
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
      headers: { accept: "application/json" },
    });
    if (!response.ok) return [];

    const payload: unknown = await response.json();
    const data = (payload as { data?: unknown }).data;
    if (!Array.isArray(data)) return [];

    return data.filter(isSocialProvider);
  } catch {
    return [];
  }
}

/** The list is untrusted input like any other: only well-formed entries are drawn. */
function isSocialProvider(value: unknown): value is SocialProvider {
  if (!value || typeof value !== "object") return false;

  const { slug, name } = value as { slug?: unknown; name?: unknown };
  if (typeof slug !== "string" || slug.length === 0) return false;
  if (!name || typeof name !== "object") return false;

  const label = name as { bn?: unknown; en?: unknown };
  return typeof label.bn === "string" && typeof label.en === "string";
}
