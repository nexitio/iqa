import { proxyAuth } from "@/lib/auth-proxy";

/**
 * End the session.
 *
 * Revoking is the API's job — it deletes the row and clears its own cookie, and
 * that clearing header is relayed here, so the app never keeps a local copy of a
 * session it has just told the API to destroy. The API is idempotent about it:
 * signing out twice, or with a cookie that has already expired, succeeds.
 */
export async function POST(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/auth/logout");
}
