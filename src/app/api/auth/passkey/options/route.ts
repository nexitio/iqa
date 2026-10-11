import { proxyAuth } from "@/lib/auth-proxy";

/**
 * Ask for the assertion options conditional UI answers.
 *
 * No identity of any kind goes up with this — that is the whole shape of the
 * flow. The challenge that comes back is unattributed; it names an account only
 * when the browser's assertion does, in `/api/auth/passkey/verify`.
 */
export async function POST(request: Request): Promise<Response> {
  return proxyAuth(request, "/api/v1/auth/passkey/options");
}
