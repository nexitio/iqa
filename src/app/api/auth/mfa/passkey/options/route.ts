import { proxyAuth } from "@/lib/auth-proxy";

/**
 * Begin a passkey sign-in.
 *
 * The pending token is the whole authority here: it only exists after a correct
 * password, so asking for assertion options cannot be used to probe an account.
 * The options that come back are answered by the browser, not by this server.
 */
export async function POST(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/auth/mfa/passkey/options");
}
