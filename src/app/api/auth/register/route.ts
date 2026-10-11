import { proxyAuth } from "@/lib/auth-proxy";

/**
 * Create an account.
 *
 * The API answers with the new account *and* a session, so a signed-up visitor is
 * signed in — the form does not have to follow with a second call, and cannot end
 * up in the half-state where the account exists and nobody is signed into it.
 */
export async function POST(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/auth/register");
}
