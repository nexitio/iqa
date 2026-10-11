/**
 * Column helpers.
 *
 * The frontend model is bilingual by default: almost every human-readable field
 * is a `Localized` object rather than a string. Storing those as `jsonb` keeps
 * the API able to return exactly the shape `src/lib/types.ts` declares — no
 * `name_bn` / `name_en` column explosion, and no mapping layer that can drift.
 */

import { sql } from "drizzle-orm";
import { jsonb, text } from "drizzle-orm/pg-core";
import type { Localized } from "@/lib/types";

/** A required bilingual field. */
export const localized = (name: string) => jsonb(name).$type<Localized>().notNull();

/** An optional bilingual field. */
export const localizedOptional = (name: string) => jsonb(name).$type<Localized>();

/** A list of bilingual fields — specialisations, students, sources. */
export const localizedList = (name: string) =>
  jsonb(name)
    .$type<Localized[]>()
    .notNull()
    .default(sql`'[]'::jsonb`);

/** Any other JSON payload — a nested object the reader only ever renders whole. */
export const json = <T>(name: string) => jsonb(name).$type<T>().notNull();

/** A non-empty text array, defaulting to the empty array. */
export const textArray = (name: string) =>
  text(name)
    .array()
    .notNull()
    .default(sql`'{}'::text[]`);
