import { proxyAuth } from "@/lib/auth-proxy";

/**
 * The browser's way to the connected-accounts API.
 *
 * These are the identities a reader has attached to their account — the Google or
 * Facebook sign-in they used, and every other provider an admin has since enabled.
 * The console is not the only place that needs them: an account page has to list
 * them, and unlinking one is a change only the account's owner can make.
 *
 * Same shape as every other account route: one server-to-server hop to
 * `/api/v1/me/identities`, because the session cookie belongs to *this* origin,
 * and the API re-checks that the caller owns what they are about to change.
 *
 * `GET` lists; `DELETE /:id` unlinks one. The API decides whether that unlink
 * needs the account password — an account created by a provider has none — so no
 * rule about it is repeated here.
 */

/** A segment that could be one of the API's own route names or an identity id. */
const SEGMENT = /^[a-z0-9][a-z0-9-]*$/;

/** Not exported: a route file must export only HTTP handlers and Next's own fields. */
async function forward(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
  method: "GET" | "DELETE",
): Promise<Response> {
  const segments = (await context.params).path ?? [];

  if (!segments.every((segment) => SEGMENT.test(segment))) {
    return Response.json({ error: { message: "No such endpoint." } }, { status: 404 });
  }

  // The list is the collection itself; there is nothing to read on a single
  // identity, so `GET /identities/:id` is not an endpoint the API has.
  if (method === "GET" && segments.length > 0) {
    return Response.json({ error: { message: "No such endpoint." } }, { status: 404 });
  }

  const suffix = segments.length > 0 ? `/${segments.join("/")}` : "";
  return proxyAuth(request, `/api/v1/me/identities${suffix}`, { method });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  return forward(request, context, "GET");
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  return forward(request, context, "DELETE");
}
