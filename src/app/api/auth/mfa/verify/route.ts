import { proxyAuth } from "@/lib/auth-proxy";

/**
 * Exchange a emailed or texted code for a session.
 *
 * The API's answer is a session cookie like a password sign-in's, relayed the
 * same way — a second factor is not a different kind of signed in.
 */
export async function POST(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/auth/mfa/verify");
}
