/**
 * Provider client secrets, encrypted at rest.
 *
 * A client secret is a credential with the same standing as a password: it can
 * impersonate the app to the provider. It therefore does not sit in a plain text
 * column, and it is never returned by the API — the admin console can learn that
 * a secret is set and replace it, and that is all.
 *
 * AES-256-GCM, which authenticates as well as encrypts: a modified ciphertext
 * fails to decrypt rather than quietly yielding a different secret, so a tampered
 * row cannot turn into a confusing provider error.
 *
 * The key comes from `ILM_SECRET_KEY`. Changing it makes every stored secret
 * unreadable — they are not recoverable, and each provider has to be re-entered.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { env } from "../env.ts";

const ALGORITHM = "aes-256-gcm";
const VERSION = "v1";
const IV_LENGTH = 12;

let cachedKey: Buffer | null = null;

/**
 * Any passphrase becomes 32 bytes, stretched with scrypt rather than hashed
 * once — the key protects data at rest for as long as the deployment lives, so it
 * is worth the milliseconds this costs on the first use.
 */
function key(): Buffer {
  if (!cachedKey) {
    cachedKey = scryptSync(env.secretKey, "ilm:provider-secret:v1", 32, {
      N: 16384,
      r: 8,
      p: 1,
    });
  }
  return cachedKey;
}

/** `v1.<iv>.<auth tag>.<ciphertext>`, all base64url. The version is there to rotate. */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);

  return [
    VERSION,
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

/**
 * Throws when the value cannot be read — a different `ILM_SECRET_KEY`, or a row
 * someone edited by hand. Callers turn that into a message an admin can act on
 * rather than a 500, because the fix is re-entering the secret, not retrying.
 */
export function decryptSecret(stored: string): string {
  const [version, iv, tag, ciphertext] = stored.split(".");
  if (version !== VERSION || !iv || !tag || !ciphertext) {
    throw new Error("The stored client secret is not in a format this server can read.");
  }

  const decipher = createDecipheriv(ALGORITHM, key(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}
