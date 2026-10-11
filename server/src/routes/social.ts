/**
 * Social sign-in.
 *
 * Two ceremonies over one code path. `/start` and `/link` differ only in what the
 * round trip is *for* — signing in, or attaching a provider to the account already
 * signed in — and both come back to the same callback, which is where the state
 * row is read to find out which it was.
 *
 * The callback is reached by a browser navigation, not a fetch, so a failure has
 * to be legible to a human as well as to a client: errors use the API's JSON
 * envelope, and a success redirects to the app unless the caller asked for JSON.
 */

import { Hono } from "hono";
import { issueSession } from "../auth/login.ts";
import { credentialHash, requireAccountPassword } from "../auth/credentials.ts";
import { requireIdentity, type AppBindings, type AppContext } from "../context.ts";
import { env } from "../env.ts";
import { readJsonBody } from "../http/body.ts";
import { badRequest, HttpError } from "../http/errors.ts";
import { authorizationUrl, exchangeCode, fetchProfile } from "../social/oauth.ts";
import {
  enabledProviders,
  requireEnabledProvider,
  toConfig,
  toPublicProvider,
} from "../social/providers.ts";
import {
  consumeState,
  createState,
  linkIdentity,
  listIdentities,
  purgeExpiredStates,
  resolveSignIn,
  unlinkIdentity,
} from "../social/service.ts";

export const socialRoutes = new Hono<AppBindings>();

socialRoutes.use("/me/identities", async (c, next) => {
  await next();
  c.header("cache-control", "private, no-store");
});

/** An optional body: a DELETE may legitimately arrive with nothing in it. */
async function optionalBody<T>(c: AppContext): Promise<Partial<T>> {
  try {
    return await readJsonBody<Partial<T>>(c);
  } catch {
    return {};
  }
}

/**
 * A client that asked for JSON, or a browser navigation.
 *
 * The callback is reached both ways — a browser navigating back from a provider,
 * and a client driving the flow — and the two need different answers to the same
 * failure.
 */
function wantsJson(c: AppContext): boolean {
  return Boolean(c.req.header("accept")?.includes("application/json"));
}

/**
 * A failed sign-in goes back to the page that can explain it.
 *
 * A JSON body would leave a browser looking at `{"error":…}` on the API's own
 * origin with no way back — and the most ordinary failure of all is a visitor who
 * pressed Cancel at the provider. Only the **status** travels: the page owns its
 * wording, so neither a provider's error text nor a crafted link can put words on
 * our sign-in page.
 */
function signInFailed(c: AppContext, status: number): Response {
  const url = new URL("/login", env.webOrigin);
  url.searchParams.set("socialError", String(status));
  return c.redirect(url.toString(), 302);
}

/**
 * Where the browser goes when the ceremony ends.
 *
 * A client that asked for JSON gets the result; a browser is redirected to the
 * app. `returnTo` was validated to a relative path when the state was created, so
 * it cannot point anywhere but our own frontend.
 */
function finish(
  c: AppContext,
  data: Record<string, unknown>,
  returnTo: string | null,
): Response {
  if (wantsJson(c)) {
    return c.json({ data });
  }
  return c.redirect(`${env.webOrigin}${returnTo ?? "/"}`, 302);
}

/** The buttons a sign-in page should draw. Public, and deliberately thin. */
socialRoutes.get("/auth/social/providers", async (c) => {
  const db = c.get("db");
  return c.json({ data: (await enabledProviders(db)).map(toPublicProvider) });
});

socialRoutes.get("/auth/social/:slug/start", async (c) => {
  const db = c.get("db");
  const provider = await requireEnabledProvider(db, c.req.param("slug"));
  const config = toConfig(provider);

  await purgeExpiredStates(db);
  const state = await createState(db, {
    providerId: provider.id,
    purpose: "login",
    returnTo: c.req.query("returnTo"),
  });

  return c.redirect(authorizationUrl(config, state), 302);
});

/**
 * Linking starts from a signed-in session, and the state row remembers which
 * account, so the callback never has to trust a user id travelling through the
 * provider.
 */
socialRoutes.get("/auth/social/:slug/link", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const provider = await requireEnabledProvider(db, c.req.param("slug"));
  const config = toConfig(provider);

  const state = await createState(db, {
    providerId: provider.id,
    purpose: "link",
    linkUserId: identity.userId,
    returnTo: c.req.query("returnTo"),
  });

  return c.redirect(authorizationUrl(config, state), 302);
});

socialRoutes.get("/auth/social/:slug/callback", async (c) => {
  try {
    return await completeSignIn(c, c.req.param("slug"));
  } catch (error) {
    // Everything below fails the same way for a person: back to the sign-in page,
    // where the reason is written in their language. A client still gets the JSON
    // it asked for, and an unexpected error is still a 500.
    if (error instanceof HttpError && !wantsJson(c)) return signInFailed(c, error.status);
    throw error;
  }
});

/**
 * The callback's own work, so one wrapper can turn any of its refusals into a redirect.
 *
 * The slug arrives as an argument rather than being read from the path here: the
 * route's own pattern is what types it, and that typing lives at the call site.
 */
async function completeSignIn(c: AppContext, slug: string): Promise<Response> {
  const db = c.get("db");
  const provider = await requireEnabledProvider(db, slug);
  const config = toConfig(provider);

  // Declining at the provider is a normal outcome, not an error to log as one.
  const declined = c.req.query("error");
  if (declined) {
    throw badRequest(
      declined === "access_denied"
        ? "Sign-in was cancelled at the provider."
        : `The provider refused the sign-in: ${declined}`,
    );
  }

  const code = c.req.query("code");
  const state = c.req.query("state");
  if (!code || !state) throw badRequest("The provider returned no code and state.");

  // Consuming the state is what proves this callback belongs to an attempt we
  // began: without it, a code could be replayed or substituted.
  const attempt = await consumeState(db, state);
  if (attempt.providerId !== provider.id) {
    throw badRequest("That sign-in attempt was started with a different provider.");
  }

  const accessToken = await exchangeCode(config, code);
  const profile = await fetchProfile(config, accessToken);

  if (attempt.purpose === "link") {
    if (!attempt.linkUserId) {
      throw badRequest("That link attempt has no account attached to it.");
    }

    await linkIdentity(db, {
      userId: attempt.linkUserId,
      provider,
      profile,
    });

    return finish(c, { linked: true, provider: provider.slug }, attempt.returnTo);
  }

  const resolved = await resolveSignIn(db, { provider, profile });
  const user = await issueSession(c, resolved.userId);

  return finish(
    c,
    { user, created: resolved.created, linked: resolved.linked },
    attempt.returnTo,
  );
}

/** The connected accounts on this account. */
socialRoutes.get("/me/identities", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  return c.json({ data: await listIdentities(db, identity.userId) });
});

socialRoutes.delete("/me/identities/:id", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  // An account with a password has something to prove; one created by a provider
  // does not, and demanding a password it never had would trap it.
  if (await credentialHash(db, identity.userId)) {
    const body = await optionalBody<{ password: string }>(c);
    await requireAccountPassword(db, identity.userId, body.password);
  }

  await unlinkIdentity(db, identity.userId, c.req.param("id"));

  return c.json({ data: { id: c.req.param("id"), removed: true } });
});
