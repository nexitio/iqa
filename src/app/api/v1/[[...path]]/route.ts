import { proxyAuth } from "@/lib/auth-proxy";

/**
 * The whole versioned API, served from this app's own origin.
 *
 * The API lives on another origin with a private cookie, so a browser here cannot
 * call it: `/api/v1/**` is the one translation, and after it every endpoint in the
 * application is reachable from a page without a second origin, a CORS policy or a
 * `SameSite` exception. A page that moves off the mock dataset does not need a new
 * proxy route written for it; the endpoints are already here.
 *
 * One catch-all rather than a file per group (auth, me, admin, taxonomy, library,
 * content, qa, community, scholars, people, personal) on purpose: the API's paths
 * are the contract, and a copy of them in this tree would be a second list to keep
 * in step with the server — the exact drift this layer exists to avoid.
 *
 * What keeps that from becoming an open relay:
 *
 *  - **The prefix is fixed.** Only `/api/v1` is reachable; each segment is joined
 *    onto that constant, so nothing outside the versioned API can be addressed,
 *    and no segment may be `.`, `..` or contain a slash or backslash.
 *  - **Every rule stays on the API.** This file forwards and relays; it authorises
 *    nothing. Role checks, ownership, session validity and validation all run at
 *    the other end, on the same request the caller's cookie was relayed with — so
 *    a browser cannot obtain a permission by arriving through here.
 *  - **A redirect is relayed, never followed** (`proxyAuth`), which is what makes
 *    the social hand-off through this path leave for the provider.
 *  - **The query string is forwarded verbatim.** Filtering, pagination and search
 *    are the API's parameters; a proxy that dropped them would silently serve the
 *    wrong collection.
 *
 * The hand-written routes next door (`/api/auth/*`, `/api/account/*`,
 * `/api/admin/social-providers/*`) predate this mirror and stay: pages use them,
 * and they name the account surface the way the app talks about it.
 */

/**
 * A segment of a real API path: a slug, an id or a number. No leading dot (so `..`
 * fails), and no slash or backslash anywhere, so nothing can walk the URL out of
 * the `/api/v1` prefix it is joined onto.
 */
const SEGMENT = /^[a-z0-9][a-z0-9._~-]*$/i;

/** Not exported: a route file must export only HTTP handlers and Next's own fields. */
async function forward(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
): Promise<Response> {
  const segments = (await context.params).path ?? [];

  if (segments.length === 0 || !segments.every((segment) => SEGMENT.test(segment))) {
    return Response.json({ error: { message: "No such endpoint." } }, { status: 404 });
  }

  const search = new URL(request.url).search;
  return proxyAuth(request, `/api/v1/${segments.join("/")}${search}`, { method });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  return forward(request, context, "GET");
}

export async function POST(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  return forward(request, context, "POST");
}

/** The API declares no `PUT` routes yet; the handler is here so adding one needs no change in this file. */
export async function PUT(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  return forward(request, context, "PUT");
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  return forward(request, context, "PATCH");
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  return forward(request, context, "DELETE");
}
