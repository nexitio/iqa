import { proxyAuth } from "@/lib/auth-proxy";

/**
 * The browser's way to the signed-in device list.
 *
 * A session is a capability: anything holding one can use the account until it
 * expires. So the API can list them — which device, from when, last seen when, and
 * which one is the caller's own — and can end them, either one or every other one.
 *
 * This route exists for the same reason as the second-factor one: the session
 * cookie is set on *this* origin, so the browser cannot ask the API directly. The
 * API owns every rule here — in particular that the session making the request
 * cannot be revoked through this surface, because that is what signing out is for.
 *
 * `GET` lists; `DELETE` ends every other device; `DELETE /:id` ends one.
 */

/** A segment that could be an id or one of the API's own route names. */
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

  // A device is not a thing to read on its own; the API has no `GET /me/sessions/:id`.
  if (method === "GET" && segments.length > 0) {
    return Response.json({ error: { message: "No such endpoint." } }, { status: 404 });
  }

  const suffix = segments.length > 0 ? `/${segments.join("/")}` : "";
  return proxyAuth(request, `/api/v1/me/sessions${suffix}`, { method });
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
