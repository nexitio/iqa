import { parseBody, proxyAuth } from "@/lib/auth-proxy";

/**
 * Sign in with a password.
 *
 * The answer is the API's, verbatim — including the `mfaRequired` branch, which
 * the form above this has to handle rather than the proxy pretending it cannot
 * happen. The one thing added here is the `remember` checkbox: the API's session
 * lasts 30 days either way, and unticking it makes the *browser* forget the
 * cookie when it closes instead of holding someone signed in on a shared machine.
 */
export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  const remember = parseBody(body).remember;

  return proxyAuth(request, "/api/v1/auth/login", {
    body,
    forgetOnClose: remember === false,
  });
}
