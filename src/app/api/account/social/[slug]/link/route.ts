import { proxyAuth } from "@/lib/auth-proxy";

/**
 * Connecting a provider to the account that is already signed in.
 *
 * This is the one social route that cannot be a plain navigation to the API, and
 * the reason is the session: `/auth/social/:slug/start` needs nothing from the
 * browser, so a link on the page can point straight at the API. Linking does need
 * the session, and the session cookie is set on *this* origin — so the hand-off
 * starts here, where the browser will actually send it, and goes to the API as one
 * server-to-server call.
 *
 * The answer is the API's own redirect to the provider, relayed whole: the state it
 * generated, and the provider's authorization URL built from the row an admin
 * configured. Nothing about the provider is decided here.
 *
 * `returnTo` is forwarded untouched — the API validates it before it is ever used
 * as a location, and a second copy of that judgement here would be a second thing
 * to get wrong.
 */

/** A provider slug as the API defines one: lowercase, no dots, no slashes. */
const SLUG = /^[a-z0-9][a-z0-9-]*$/;

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await context.params;
  if (!SLUG.test(slug)) {
    return Response.json({ error: { message: "No such endpoint." } }, { status: 404 });
  }

  const returnTo = new URL(request.url).searchParams.get("returnTo");
  const query = returnTo === null ? "" : `?returnTo=${encodeURIComponent(returnTo)}`;

  return proxyAuth(request, `/api/v1/auth/social/${slug}/link${query}`, { method: "GET" });
}
