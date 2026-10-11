import { proxyAuth } from "@/lib/auth-proxy";

/**
 * The second factors enrolled on the signed-in account.
 *
 * A read, and the only one here: everything that changes a factor goes through
 * the `[...action]` route beside this file. The session cookie is relayed, so the
 * API answers for the account this origin is holding, never for whoever asked.
 */
export async function GET(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/me/mfa", { method: "GET" });
}
