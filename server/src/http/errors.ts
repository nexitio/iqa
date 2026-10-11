/**
 * Errors.
 *
 * Route handlers throw; one error handler turns whatever comes out into a JSON
 * envelope. That keeps handlers free of `c.json(..., 404)` boilerplate and makes
 * the shape of a failure identical everywhere.
 */

import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class HttpError extends Error {
  constructor(
    readonly status: ContentfulStatusCode,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const badRequest = (message: string, details?: unknown) => new HttpError(400, message, details);
export const unauthorized = (message = "Sign in required") => new HttpError(401, message);
export const forbidden = (message = "Not allowed") => new HttpError(403, message);
export const notFound = (message = "Not found") => new HttpError(404, message);

export function onError(error: Error, c: Context): Response {
  if (error instanceof HttpError) {
    return c.json(
      { error: { message: error.message, ...(error.details ? { details: error.details } : {}) } },
      error.status,
    );
  }

  console.error(`${c.req.method} ${c.req.path} failed:`, error);
  return c.json({ error: { message: "Internal error" } }, 500);
}

export function onNotFound(c: Context): Response {
  return c.json({ error: { message: `No route for ${c.req.method} ${c.req.path}` } }, 404);
}
