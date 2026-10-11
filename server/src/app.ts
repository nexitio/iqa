/**
 * The Hono application.
 *
 * One place wires middleware and mounts every route module, so `index.ts` only
 * has to know how to listen and shut down. The app factory takes its database as
 * a parameter, which is what lets a test build an app over a scratch database
 * without any global state in the way.
 */

import { cors } from "hono/cors";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { readSessionToken, resolveSession } from "./auth/session.ts";
import type { AppBindings } from "./context.ts";
import type { Database } from "./db/index.ts";
import { isDev } from "./env.ts";
import { forbidden, onError, onNotFound } from "./http/errors.ts";
import { accountRoutes } from "./routes/account.ts";
import { adminRoutes } from "./routes/admin.ts";
import { adminSocialRoutes } from "./routes/admin-social.ts";
import { authRoutes } from "./routes/auth.ts";
import { communityRoutes } from "./routes/community.ts";
import { contentRoutes } from "./routes/content.ts";
import { healthRoutes } from "./routes/health.ts";
import { libraryRoutes } from "./routes/library.ts";
import { mfaRoutes } from "./routes/mfa.ts";
import { peopleRoutes } from "./routes/people.ts";
import { personalRoutes } from "./routes/personal.ts";
import { qaRoutes } from "./routes/qa.ts";
import { scholarsRoutes } from "./routes/scholars.ts";
import { socialRoutes } from "./routes/social.ts";
import { taxonomyRoutes } from "./routes/taxonomy.ts";

export interface AppOptions {
  db: Database;
  /** Extra origins allowed to call the API, on top of localhost in development. */
  allowedOrigins?: string[];
  logRequests?: boolean;
}

/** Methods that change state, and therefore need a same-origin check. */
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * The browser calls this API from the Next dev server, which picks a new port
 * each time, so in development any loopback origin is accepted. Production must
 * name its origins explicitly.
 */
function originAllowed(origin: string | undefined, allowed: string[]): boolean {
  if (!origin) return false;
  if (allowed.includes(origin)) return true;
  if (!isDev) return false;
  try {
    const url = new URL(origin);
    return (
      (url.hostname === "localhost" || url.hostname === "127.0.0.1") &&
      (url.protocol === "http:" || url.protocol === "https:")
    );
  } catch {
    return false;
  }
}

export function createApp(options: AppOptions) {
  const app = new Hono<AppBindings>();
  const allowedOrigins = options.allowedOrigins ?? [];

  app.use("*", secureHeaders());
  if (options.logRequests ?? isDev) app.use("*", logger());
  app.use(
    "*",
    cors({
      origin: (origin) => (originAllowed(origin, allowedOrigins) ? origin : undefined),
      allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type"],
      // The session cookie travels with cross-origin calls from the dev server.
      credentials: true,
      maxAge: 600,
    }),
  );

  /**
   * CSRF guard for state-changing requests.
   *
   * The session cookie is `SameSite=Lax`, which already keeps it off a
   * cross-site POST. This is the second lock: a browser always attaches `Origin`
   * to a cross-origin write, so an origin we do not recognise is refused rather
   * than merely failing the cookie check. Requests with no `Origin` at all (the
   * smoke test, server-to-server callers) are not browsers' problem to solve.
   */
  app.use("/api/*", async (c, next) => {
    if (MUTATING_METHODS.has(c.req.method.toUpperCase())) {
      const origin = c.req.header("origin");
      if (origin && !originAllowed(origin, allowedOrigins)) {
        throw forbidden("Cross-origin request refused.");
      }
    }
    await next();
  });

  // One database handle and one resolved session per request, both from context.
  app.use("*", async (c, next) => {
    c.set("db", options.db);
    const token = readSessionToken(c);
    c.set("identity", token ? await resolveSession(options.db, token) : null);
    await next();
  });

  app.route("/api/v1", authRoutes);
  app.route("/api/v1", mfaRoutes);
  app.route("/api/v1", accountRoutes);
  app.route("/api/v1", socialRoutes);
  app.route("/api/v1", adminSocialRoutes);
  app.route("/api/v1", healthRoutes);
  app.route("/api/v1", taxonomyRoutes);
  app.route("/api/v1", libraryRoutes);
  app.route("/api/v1", contentRoutes);
  app.route("/api/v1", qaRoutes);
  app.route("/api/v1", communityRoutes);
  app.route("/api/v1", scholarsRoutes);
  app.route("/api/v1", peopleRoutes);
  app.route("/api/v1", personalRoutes);
  app.route("/api/v1", adminRoutes);

  app.get("/", (c) =>
    c.json({
      name: "Ilm API",
      version: "v1",
      docs: "See server/README.md",
      endpoints: [
        "POST /api/v1/auth/register",
        "POST /api/v1/auth/login",
        "POST /api/v1/auth/logout",
        "GET /api/v1/auth/session",
        "POST /api/v1/auth/mfa/challenge",
        "POST /api/v1/auth/mfa/verify",
        "POST /api/v1/auth/mfa/passkey/options",
        "POST /api/v1/auth/mfa/passkey/verify",
        "POST /api/v1/auth/mfa/recovery",
        "GET /api/v1/me/mfa",
        "POST /api/v1/me/mfa/email/start",
        "POST /api/v1/me/mfa/sms/start",
        "POST /api/v1/me/mfa/passkey/start",
        "GET /api/v1/auth/social/providers",
        "GET /api/v1/auth/social/:slug/start",
        "GET /api/v1/auth/social/:slug/callback",
        "GET /api/v1/me/identities",
        "GET /api/v1/admin/social-providers",
        "POST /api/v1/admin/social-providers",
        "POST /api/v1/me/password",
        "GET /api/v1/me/sessions",
        "DELETE /api/v1/me/sessions/:id",
        "GET /api/v1/health",
        "GET /api/v1/status",
        "GET /api/v1/departments",
        "GET /api/v1/topics",
        "GET /api/v1/quran/surahs",
        "GET /api/v1/hadith/collections",
        "GET /api/v1/duas",
        "GET /api/v1/articles",
        "GET /api/v1/fatwas",
        "GET /api/v1/questions",
        "GET /api/v1/discussions",
        "GET /api/v1/scholars",
        "GET /api/v1/search",
      ],
    }),
  );

  app.notFound(onNotFound);
  app.onError(onError);

  return app;
}

export type App = ReturnType<typeof createApp>;
