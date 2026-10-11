import { proxyAuth } from "@/lib/auth-proxy";

/**
 * The browser's way to the admin provider API.
 *
 * The console cannot call the API origin directly: the session cookie is set on
 * *this* origin, and a cross-site fetch would not carry it. So the ceremony is
 * the same one every credential route uses — one server-to-server hop, with the
 * cookie relayed as ordinary data.
 *
 * One route for the whole surface, because every path under it is the same
 * operation: forward to the API's own `/api/v1/admin/social-providers/*`, which
 * owns the validation and the role check. The path is forwarded, never chosen —
 * each segment has to be a plain lowercase slug or id before it is joined onto
 * that fixed prefix, so `..` and anything else that could walk the URL elsewhere
 * answers 404 instead.
 *
 * `GET` lists or reads, `POST` creates or inspects, `PATCH` updates and `DELETE`
 * removes. Every one of them is session-guarded on the API's side and
 * same-origin guarded by `proxyAuth`.
 */

/** A segment that could be one of the API's own route names or an id. */
const SEGMENT = /^[a-z0-9][a-z0-9-]*$/;

/** Not exported: a route file must export only HTTP handlers and Next's own fields. */
async function forward(
  request: Request,
  context: { params: Promise<{ path?: string[] }> },
  method: "GET" | "POST" | "PATCH" | "DELETE",
): Promise<Response> {
  const segments = (await context.params).path ?? [];

  if (!segments.every((segment) => SEGMENT.test(segment))) {
    return Response.json({ error: { message: "No such endpoint." } }, { status: 404 });
  }

  const suffix = segments.length > 0 ? `/${segments.join("/")}` : "";
  return proxyAuth(request, `/api/v1/admin/social-providers${suffix}`, { method });
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
