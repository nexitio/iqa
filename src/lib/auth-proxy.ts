/**
 * The app's half of every credential call.
 *
 * A browser on this origin cannot read a cookie the API set on its own origin,
 * and cannot be relied on to send one either: two ports are two origins, and the
 * moment the app and the API stop sharing a host, `SameSite=Lax` withholds the
 * cookie from a cross-site fetch entirely. So the browser talks to this app, and
 * this app talks to the API — one server-to-server hop, where the cookie is
 * ordinary data.
 *
 * What that buys, beyond working at all: the session becomes `HttpOnly` on *this*
 * origin, so the app's own server components can read it and no script can. What
 * it costs: a proxy that must not become a credential-laundering endpoint. Hence
 * the same-origin guard below, and the deliberate absence of any route here that
 * would hand a token back to the client.
 */

import { serverApiUrl } from "./api-server";

/** Credential work is password hashing, second-factor delivery and a database round trip. */
const UPSTREAM_TIMEOUT_MS = 8000;

export interface ProxyOptions {
  /**
   * Keep the cookie as a browser-session cookie — no `Max-Age`, gone when the
   * browser closes. The *server* session keeps its own 30-day life either way;
   * this only decides whether the browser is willing to remember it overnight.
   */
  forgetOnClose?: boolean;
  /**
   * A body read by the caller. A request's body can only be read once, so a route
   * that inspects a field before forwarding has to hand the text over; routes
   * with nothing to inspect can leave it out and let this read the stream.
   */
  body?: string;
}

/**
 * A mutating request is only accepted from this app's own pages.
 *
 * The API runs the same check on its side, but it can only judge the `Origin` it
 * was handed — which, from the API's point of view, is this app. Forwarding a
 * forged origin would defeat that, so a request that does not come from our own
 * origin is refused here instead.
 *
 * The comparison is against the request's own `Host`, not `new URL(request.url)`:
 * Next rewrites the URL's host to `localhost`, so a page served on `127.0.0.1` —
 * or on any other name, or behind a proxy — would otherwise fail this check on a
 * perfectly ordinary same-origin request.
 */
function originRefused(request: Request): Response | null {
  const origin = request.headers.get("origin");
  // No Origin at all is a same-origin form post or a server-to-server caller:
  // not a browser's problem, and not something to guess about.
  if (!origin) return null;

  const host = request.headers.get("host");
  if (!host) return null;

  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwarded ?? new URL(request.url).protocol.replace(":", "");
  if (origin === `${protocol}://${host}`) return null;

  return Response.json({ error: { message: "Cross-origin request refused." } }, { status: 403 });
}

/** `Headers.getSetCookie` is not in every TypeScript DOM lib yet; this finds it if it is. */
function setCookieHeaders(headers: Headers): string[] {
  const withGetter = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof withGetter.getSetCookie === "function") return withGetter.getSetCookie();

  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

/** Drops the cookie's own expiry so it dies with the browser session. */
function withoutExpiry(cookie: string): string {
  return cookie
    .split(";")
    .filter((part) => !/^\s*(max-age|expires)=/i.test(part))
    .join(";");
}

/**
 * Forwards one credential call to the API and relays its answer.
 *
 * The `Set-Cookie` header is copied **verbatim** rather than rebuilt here: which
 * cookie is set, with which flags and for how long, is the API's decision, and a
 * second copy of that policy in the app is a second thing to get wrong. Copying
 * it onto this origin's response is what re-scopes it to the app — and with
 * `forgetOnClose` the only thing edited is its lifetime.
 */
export async function proxyAuth(
  request: Request,
  path: string,
  options: ProxyOptions = {},
): Promise<Response> {
  const refusal = originRefused(request);
  if (refusal) return refusal;

  // The body is forwarded as it arrived. Re-serialising it here would mean the
  // app's idea of the payload could drift from the API's, and the API already
  // validates everything it reads.
  const body = options.body ?? (await request.text());

  let upstream: Response;
  try {
    upstream = await fetch(serverApiUrl(path), {
      method: "POST",
      headers: {
        "content-type": request.headers.get("content-type") ?? "application/json",
        accept: "application/json",
        // Forwarded so the API's own origin guard sees a genuine browser origin,
        // its rate limiting keys the caller the same way either route would, and
        // a new session is labelled with the device that actually signed in.
        //
        // The cookie goes with them because a relay must not lose the caller's
        // identity: these are the API's own cookies, relayed back to it. Without
        // it, signing out clears the browser's copy and answers 200 while the
        // session row it named stays alive — a token that still works for the
        // rest of its thirty days.
        ...pick(request, "origin", "user-agent", "x-forwarded-for", "cookie"),
      },
      body: body.length > 0 ? body : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
  } catch (error) {
    console.error(`Auth proxy to ${path} failed:`, error);
    return Response.json(
      { error: { message: "The account service could not be reached. Try again." } },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  const headers = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "application/json",
    // Never cached anywhere: these answers are per-caller and about credentials.
    "cache-control": "private, no-store",
  });

  for (const cookie of setCookieHeaders(upstream.headers)) {
    headers.append("set-cookie", options.forgetOnClose ? withoutExpiry(cookie) : cookie);
  }

  return new Response(text.length > 0 ? text : null, { status: upstream.status, headers });
}

/** Only the headers worth passing through, so a caller cannot smuggle extras in. */
function pick(request: Request, ...names: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of names) {
    const value = request.headers.get(name);
    if (value) out[name] = value;
  }
  return out;
}

/** Parses a forwarded body without caring whether it is valid — the API judges that. */
export function parseBody(text: string): Record<string, unknown> {
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
