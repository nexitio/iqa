/**
 * The API, as the Next server dials it.
 *
 * Kept apart from `./api` on purpose: that module is imported by client
 * components, and a server-only address has no business in a browser bundle.
 */

import { API_URL } from "./api";

/**
 * `http://localhost` is rewritten to `http://127.0.0.1` because the API binds the
 * IPv4 loopback, and on a machine where `localhost` resolves to `::1` first a
 * server-side fetch fails while the browser's copy of the same URL succeeds —
 * a difference that shows up only in someone's logs. Plain http is the only thing
 * touched, so a TLS localhost origin keeps the name on its certificate.
 *
 * `API_URL` overrides the public value for a deployment where the server should
 * reach the API through an address the browser cannot use.
 */
export const SERVER_API_URL = (process.env.API_URL ?? API_URL).replace(
  /^http:\/\/localhost\b/,
  "http://127.0.0.1",
);

export function serverApiUrl(path: string): string {
  return `${SERVER_API_URL.replace(/\/+$/, "")}${path}`;
}
