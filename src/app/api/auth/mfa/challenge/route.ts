import { proxyAuth } from "@/lib/auth-proxy";

/**
 * Send a second-factor code during sign-in.
 *
 * Keyed by the pending token the API handed back with `mfaRequired`, so this
 * route holds no state and cannot be used to send codes to an account nobody has
 * already proved they know the password for.
 */
export async function POST(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/auth/mfa/challenge");
}
