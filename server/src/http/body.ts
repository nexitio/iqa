/**
 * Request bodies.
 *
 * `c.req.json()` throws on malformed input, which would surface as a 500 for
 * what is squarely a client error. Reading through here converts that into the
 * 400 it should always have been.
 */

import type { Context } from "hono";
import { badRequest } from "./errors.ts";

export async function readJsonBody<T>(c: Context): Promise<T> {
  try {
    const body = await c.req.text();
    if (!body.trim()) throw badRequest("A JSON body is required");
    return JSON.parse(body) as T;
  } catch (error) {
    if (error instanceof SyntaxError) throw badRequest("The request body is not valid JSON");
    throw error;
  }
}
