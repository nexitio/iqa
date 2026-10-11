import { proxyAuth } from "@/lib/auth-proxy";

/**
 * Changing the account password.
 *
 * A small file on purpose: the API owns the whole of the rule — it verifies the
 * current password, applies the policy to the new one, refuses a "change" that
 * changes nothing, rate-limits the guesses, and then signs every *other* device
 * out. None of that belongs to a proxy, which only has to carry the caller's
 * session to the API and its answer back.
 *
 * `POST` only. There is no `GET` because a stored password is not something that
 * can be read, and no `DELETE` because removing the credential an account signs in
 * with is not an operation that should exist.
 */

export async function POST(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/me/password", { method: "POST" });
}
