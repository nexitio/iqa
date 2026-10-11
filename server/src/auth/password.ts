/**
 * Password hashing.
 *
 * scrypt from `node:crypto`: memory-hard, in the standard library, and therefore
 * no native build step that can break `pnpm install` on a new machine.
 *
 * The parameters are stored *inside* the digest string, so raising the cost
 * later verifies older hashes against the parameters they were made with rather
 * than locking those accounts out.
 *
 *     scrypt$N$r$p$<salt base64url>$<hash base64url>
 */

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const PARAMS = { N: 16384, r: 8, p: 1 } as const;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

/** Bounds a stored digest is allowed to ask for, so a bad row cannot become a DoS. */
const LIMITS = { N: 1 << 20, r: 16, p: 4, keyLength: 128 };

/**
 * Passwords are normalised before hashing, so the same typed password hashes
 * identically no matter how the caller's keyboard composed it.
 */
const normalise = (password: string) => password.replace(/\r?\n$/, "").normalize("NFKC");

function derive(
  password: string,
  salt: Buffer,
  params: { N: number; r: number; p: number },
  keyLength: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(normalise(password), salt, keyLength, params, (error, derivedKey) =>
      error ? reject(error) : resolve(derivedKey),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, PARAMS, KEY_LENGTH);
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

/**
 * True when `password` produced `stored`.
 *
 * Comparison is constant-time, and a malformed or absent digest answers `false`
 * rather than throwing: verification must not become a way to probe the table.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = /^scrypt\$(\d+)\$(\d+)\$(\d+)\$([A-Za-z0-9_-]+)\$([A-Za-z0-9_-]+)$/.exec(stored);
  if (!parts) return false;

  const params = { N: Number(parts[1]), r: Number(parts[2]), p: Number(parts[3]) };
  const salt = Buffer.from(parts[4]!, "base64url");
  const expected = Buffer.from(parts[5]!, "base64url");

  const sane =
    Number.isInteger(params.N) &&
    params.N >= 1024 &&
    params.N <= LIMITS.N &&
    params.r >= 1 &&
    params.r <= LIMITS.r &&
    params.p >= 1 &&
    params.p <= LIMITS.p &&
    expected.length > 0 &&
    expected.length <= LIMITS.keyLength;
  if (!sane) return false;

  let actual: Buffer;
  try {
    actual = await derive(password, salt, params, expected.length);
  } catch {
    // e.g. the row asks for more memory than the process is allowed to use.
    return false;
  }

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
