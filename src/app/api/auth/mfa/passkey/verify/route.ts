import { proxyAuth } from "@/lib/auth-proxy";

/**
 * Finish a passkey sign-in with the browser's assertion.
 *
 * The answer is a session cookie on this origin, relayed exactly as the code and
 * password routes relay theirs — a passkey is another way through the same door.
 */
export async function POST(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/auth/mfa/passkey/verify");
}
