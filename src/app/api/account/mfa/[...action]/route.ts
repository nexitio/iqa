import { proxyAuth } from "@/lib/auth-proxy";

/**
 * The rest of the second-factor surface: enrol a factor, confirm a code, remove
 * one, and regenerate recovery codes.
 *
 * One catch-all rather than nine near-identical files, because every route under
 * it is the same operation — forward to the API's own `/api/v1/me/mfa/*`, which
 * already owns the rules. The only thing translated here is the origin.
 *
 * The path is forwarded, never chosen: the caller cannot reach an endpoint outside
 * `/me/mfa`, because each segment is checked to be a plain lowercase slug before
 * being joined onto that fixed prefix. `..`, `.` and anything else that could walk
 * the URL elsewhere fail the check and answer 404 instead.
 *
 * `POST` covers start/confirm and recovery-code regeneration; `DELETE` removes a
 * single factor. Both are session-guarded on the API's side and same-origin
 * guarded by `proxyAuth`.
 */

/** A segment that could be one of the API's own route names: no dots, no slashes. */
const SEGMENT = /^[a-z0-9][a-z0-9-]*$/;

/** Not exported: a route file must export only HTTP handlers and Next's own fields. */
async function forward(
  request: Request,
  context: { params: Promise<{ action: string[] }> },
  method: "POST" | "DELETE",
): Promise<Response> {
  const { action } = await context.params;

  if (action.length === 0 || !action.every((segment) => SEGMENT.test(segment))) {
    return Response.json({ error: { message: "No such endpoint." } }, { status: 404 });
  }

  return proxyAuth(request, `/api/v1/me/mfa/${action.join("/")}`, { method });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ action: string[] }> },
): Promise<Response> {
  return forward(request, context, "POST");
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ action: string[] }> },
): Promise<Response> {
  return forward(request, context, "DELETE");
}
