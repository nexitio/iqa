/**
 * Query parameters.
 *
 * Every list endpoint accepts the same handful: `page`, `limit`, `q` and its own
 * filters. Parsing lives here so a bad value is a 400 with the allowed options
 * spelled out, rather than a silently ignored filter.
 */

import type { Context } from "hono";
import { badRequest } from "./errors.ts";

export interface PageQuery {
  page: number;
  limit: number;
  offset: number;
}

export interface ListQuery extends PageQuery {
  q?: string;
}

export interface ListResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const MAX_LIMIT = 100;

export function pageQuery(url: URL, defaultLimit = 20): PageQuery {
  const page = integerParam(url, "page", 1, 1, 10_000);
  const limit = integerParam(url, "limit", defaultLimit, 1, MAX_LIMIT);
  return { page, limit, offset: (page - 1) * limit };
}

export function listQuery(url: URL, defaultLimit = 20): ListQuery {
  return { ...pageQuery(url, defaultLimit), q: textParam(url, "q") };
}

export function listResponse<T>(rows: T[], total: number, page: PageQuery): ListResponse<T> {
  return {
    data: rows,
    page: page.page,
    limit: page.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / page.limit)),
  };
}

export function textParam(url: URL, name: string, maxLength = 200): string | undefined {
  const raw = url.searchParams.get(name)?.trim();
  if (!raw) return undefined;
  if (raw.length > maxLength) {
    throw badRequest(`"${name}" must be at most ${maxLength} characters`);
  }
  return raw;
}

export function integerParam(
  url: URL,
  name: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const raw = url.searchParams.get(name);
  if (raw === null || raw === "") return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw badRequest(`"${name}" must be a whole number between ${min} and ${max}`);
  }
  return value;
}

export function booleanParam(url: URL, name: string): boolean | undefined {
  const raw = url.searchParams.get(name);
  if (raw === null || raw === "") return undefined;
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  throw badRequest(`"${name}" must be true or false`);
}

/** A filter whose value has to be one of a fixed set, e.g. `status`. */
export function enumParam<const T extends readonly string[]>(
  url: URL,
  name: string,
  allowed: T,
): T[number] | undefined {
  const raw = url.searchParams.get(name)?.trim();
  if (!raw) return undefined;
  if (!allowed.includes(raw)) {
    throw badRequest(`"${name}" must be one of: ${allowed.join(", ")}`);
  }
  return raw as T[number];
}

/** Signals a handler's result straight to the client. */
export function json<T>(c: Context, body: T, status: 200 | 201 = 200): Response {
  return c.json(body, status);
}
