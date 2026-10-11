import { proxyAuth } from "@/lib/auth-proxy";

/**
 * Finish a passkey sign-in that started in the browser's autofill.
 *
 * The answer is a session cookie on this origin, relayed exactly as every other
 * credential route relays its own. Unlike the second-factor passkey route, there
 * is no pending token to check: the challenge id it names is the only thing
 * tying this assertion to the options the browser was given.
 */
export async function POST(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/auth/passkey/verify");
}
