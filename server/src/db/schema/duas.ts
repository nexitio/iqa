/**
 * Duas, grouped by the occasion a reader arrives with — waking, eating,
 * travelling — rather than by source. `reference` is never optional: a dua
 * without a source is not a dua this product shows.
 */

import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { localized, localizedOptional, textArray } from "./columns.ts";

export const duaCategories = pgTable(
  "dua_categories",
  {
    id: text("id").primaryKey(),
    /** Constraint, not a separate index — `duas` references this column. */
    slug: text("slug").notNull().unique(),
    name: localized("name"),
    description: localized("description"),
    /** Lucide icon name, resolved through the frontend icon map. */
    icon: text("icon").notNull(),
    tone: text("tone").notNull(),
  },
);

export const duas = pgTable(
  "duas",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    categorySlug: text("category_slug")
      .notNull()
      .references(() => duaCategories.slug, { onDelete: "cascade" }),
    title: localized("title"),
    arabic: text("arabic").notNull(),
    /** Bengali-script pronunciation aid. */
    transliterationBn: text("transliteration_bn").notNull(),
    meaning: localized("meaning"),
    /** e.g. "সূরা আল-বাকারা ২:২৫৫" or "সহীহ বুখারী ৬৩২৪". */
    reference: localized("reference"),
    /** When to say it. */
    occasion: localized("occasion"),
    /** How many times, where a count is part of the practice. */
    repeat: localizedOptional("repeat"),
    /** The virtue or promise attached to it, when the source states one. */
    virtue: localizedOptional("virtue"),
    tags: textArray("tags"),
  },
  (t) => [
    uniqueIndex("duas_slug_key").on(t.slug),
    index("duas_category_idx").on(t.categorySlug),
  ],
);
