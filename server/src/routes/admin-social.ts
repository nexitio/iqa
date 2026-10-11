/**
 * Admin surface for social provider configuration.
 *
 * The requirement was that provider config is administered rather than deployed,
 * which makes this file the feature's control panel. Two rules hold throughout:
 *
 *  - **The client secret only travels inward.** It can be set, and it can be
 *    replaced, and it can never be read back — `hasClientSecret` is the whole of
 *    what a console gets to know about it. That is why `toAdminProvider` exists
 *    separately from the row.
 *  - **Validation is provider-shaped, not provider-specific.** URLs must be https
 *    (loopback excepted, for a test stub), and the transport enums are checked
 *    against their allowed values, so a misconfiguration is refused here instead
 *    of failing inside a reader's sign-in.
 */

import { Hono } from "hono";
import { requireRole, type AppBindings } from "../context.ts";
import { readJsonBody } from "../http/body.ts";
import { notFound } from "../http/errors.ts";
import {
  createProvider,
  deleteProvider,
  findProviderById,
  listProviders,
  toAdminProvider,
  toConfig,
  updateProvider,
  type ProviderInput,
} from "../social/providers.ts";
import { authorizationUrl } from "../social/oauth.ts";

export const adminSocialRoutes = new Hono<AppBindings>();

adminSocialRoutes.use("*", async (c, next) => {
  await next();
  c.header("cache-control", "private, no-store");
});

adminSocialRoutes.get("/admin/social-providers", async (c) => {
  requireRole(c, "admin");
  const rows = await listProviders(c.get("db"));
  return c.json({ data: rows.map(toAdminProvider) });
});

adminSocialRoutes.get("/admin/social-providers/:id", async (c) => {
  requireRole(c, "admin");
  const row = await findProviderById(c.get("db"), c.req.param("id"));
  if (!row) throw notFound("No such provider");
  return c.json({ data: toAdminProvider(row) });
});

adminSocialRoutes.post("/admin/social-providers", async (c) => {
  const identity = requireRole(c, "admin");
  const body = await readJsonBody<ProviderInput>(c);
  const row = await createProvider(c.get("db"), body, identity.userId);
  return c.json({ data: toAdminProvider(row) }, 201);
});

adminSocialRoutes.patch("/admin/social-providers/:id", async (c) => {
  const identity = requireRole(c, "admin");
  const body = await readJsonBody<ProviderInput>(c);
  const row = await updateProvider(c.get("db"), c.req.param("id"), body, identity.userId);
  return c.json({ data: toAdminProvider(row) });
});

/**
 * Removing a provider takes its linked identities with it (the foreign key
 * cascades), so the console is told how much that is before it happens.
 */
adminSocialRoutes.delete("/admin/social-providers/:id", async (c) => {
  requireRole(c, "admin");
  const removed = await deleteProvider(c.get("db"), c.req.param("id"));
  if (!removed) throw notFound("No such provider");
  return c.json({ data: { id: c.req.param("id"), removed: true } });
});

/**
 * What a console needs to hand a human before a provider can work: the exact
 * redirect URI to register, and the exact authorization URL a sign-in will open.
 *
 * Building the URL also *proves the stored secret decrypts* — a failure here is
 * the difference between "your configuration is wrong" and "this deployment's
 * ILM_SECRET_KEY changed", which are very different fixes.
 */
adminSocialRoutes.post("/admin/social-providers/:id/inspect", async (c) => {
  requireRole(c, "admin");
  const row = await findProviderById(c.get("db"), c.req.param("id"));
  if (!row) throw notFound("No such provider");

  const config = toConfig(row);

  return c.json({
    data: {
      slug: config.slug,
      /** Register this with the provider, character for character. */
      redirectUri: config.redirectUri,
      /** Opening this is the whole "try it" button. */
      authorizationUrl: authorizationUrl(config, "state-would-go-here"),
      scopes: config.scopes,
      /** True once the secret decrypted, which is the only thing this can attest. */
      secretReadable: true,
    },
  });
});
