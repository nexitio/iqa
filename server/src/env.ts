/**
 * Environment.
 *
 * Loaded once, from `server/.env`, and validated here rather than at the first
 * query: a missing `DATABASE_URL` should stop the process with a sentence a
 * human can act on, not surface later as a driver error.
 *
 * The second-factor settings are validated the same way, and for a sharper
 * reason: a misconfigured delivery channel does not break the server, it
 * silently drops the login code and locks people out. Failing at boot is the
 * only affordable moment to find that out.
 */

import { config } from "dotenv";

config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Copy server/.env.example to server/.env and fill it in.`,
    );
  }
  return value;
}

function boolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be "true" or "false", got "${value}".`);
}

function list(name: string, fallback: string): string[] {
  return (process.env[name] ?? fallback)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

const cookieSameSite = (process.env.ILM_COOKIE_SAMESITE ?? "lax").toLowerCase();
if (cookieSameSite !== "lax" && cookieSameSite !== "strict" && cookieSameSite !== "none") {
  throw new Error(`ILM_COOKIE_SAMESITE must be lax, strict or none, got "${cookieSameSite}".`);
}

/**
 * Secure by default in production. A `SameSite=None` cookie is only sent by a
 * browser over HTTPS, so the pairing is rejected here rather than silently
 * producing a session that never arrives.
 */
const cookieSecure = boolean("ILM_COOKIE_SECURE", isProduction);
if (cookieSameSite === "none" && !cookieSecure) {
  throw new Error(
    "ILM_COOKIE_SAMESITE=none requires ILM_COOKIE_SECURE=true: browsers refuse a None cookie that is not Secure.",
  );
}

/* -------------------------------------------------------------------------- */
/* Second-factor delivery                                                     */
/* -------------------------------------------------------------------------- */

const emailProvider = (process.env.ILM_EMAIL_PROVIDER ?? "console").toLowerCase();
if (emailProvider !== "console" && emailProvider !== "resend") {
  throw new Error(`ILM_EMAIL_PROVIDER must be console or resend, got "${emailProvider}".`);
}

const smsProvider = (process.env.ILM_SMS_PROVIDER ?? "console").toLowerCase();
if (smsProvider !== "console" && smsProvider !== "twilio") {
  throw new Error(`ILM_SMS_PROVIDER must be console or twilio, got "${smsProvider}".`);
}

/**
 * The `console` driver writes the code to the server log and hands it back in the
 * API response instead of sending anything. That is exactly what you want on a
 * laptop and exactly what you must not ship: every login code would be both
 * printed and handed to whoever asked for one.
 */
if (isProduction) {
  for (const [name, value] of [
    ["ILM_EMAIL_PROVIDER", emailProvider],
    ["ILM_SMS_PROVIDER", smsProvider],
  ] as const) {
    if (value === "console") {
      throw new Error(
        `${name}=console is not allowed with NODE_ENV=production: it would never deliver a code. ` +
          "Configure resend / twilio, or leave the feature unexposed.",
      );
    }
  }
}

if (emailProvider === "resend") {
  required("RESEND_API_KEY");
  required("ILM_MAIL_FROM");
}
if (smsProvider === "twilio") {
  required("TWILIO_ACCOUNT_SID");
  required("TWILIO_AUTH_TOKEN");
  required("TWILIO_PHONE_NUMBER");
}

/* -------------------------------------------------------------------------- */
/* WebAuthn                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The relying party is the site a passkey is bound to — one domain, permanently.
 * `localhost` works for development, and a passkey created there is not valid on
 * a deployed origin, which is why both are configurable and why the origin list
 * must include every origin the browser will actually be running on.
 */
const rpID = process.env.ILM_RP_ID ?? "localhost";
const rpOrigins = list(
  "ILM_RP_ORIGINS",
  "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8787,http://127.0.0.1:8787",
);
if (rpOrigins.length === 0) {
  throw new Error("ILM_RP_ORIGINS must list at least one origin the browser runs on.");
}

/**
 * The key that encrypts stored provider client secrets (`src/social/crypto.ts`).
 *
 * A development default exists so the project runs out of the box; production
 * must supply one. Changing it makes every secret already stored unreadable —
 * each provider then has to be re-entered in the console.
 */
const secretKey = process.env.ILM_SECRET_KEY;
if (isProduction && !secretKey) {
  throw new Error(
    "Missing ILM_SECRET_KEY. It encrypts the client secrets of configured social providers.",
  );
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  secretKey: secretKey ?? "ilm-development-secret-key-not-for-production",
  /** Used once, by the create-database script, against the default database. */
  databaseAdminUrl:
    process.env.DATABASE_ADMIN_URL ?? required("DATABASE_URL").replace(/\/[^/]*$/, "/postgres"),
  /**
   * The API takes its own variable rather than `PORT`: other tools in this
   * workspace (and the preview harness) set `PORT` for their own servers, and a
   * shared name meant the API silently bound to whatever they had chosen.
   */
  port: Number(process.env.ILM_API_PORT ?? 8787),
  nodeEnv,
  cookieSameSite: cookieSameSite as "lax" | "strict" | "none",
  cookieSecure,

  emailProvider: emailProvider as "console" | "resend",
  smsProvider: smsProvider as "console" | "twilio",
  resendApiKey: process.env.RESEND_API_KEY,
  mailFrom: process.env.ILM_MAIL_FROM,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  rp: {
    id: rpID,
    name: process.env.ILM_RP_NAME ?? "Ilm",
    origins: rpOrigins,
  },

  /**
   * The app's own origin. A finished social sign-in sends the browser here, so it
   * is configuration rather than the request's `Origin` or `Host` header — a
   * redirect built from a header is one an attacker chooses.
   */
  webOrigin: process.env.ILM_WEB_ORIGIN ?? "http://localhost:3000",
};

export const isDev = !isProduction;
