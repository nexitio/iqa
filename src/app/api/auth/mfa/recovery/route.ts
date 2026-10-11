import { proxyAuth } from "@/lib/auth-proxy";

/**
 * Finish a sign-in with a recovery code.
 *
 * Separate from `verify` on the API's side because it is a different kind of
 * secret — one that is spent on use — and separate here so the two cannot be
 * confused in the form either.
 */
export async function POST(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/auth/mfa/recovery");
}
