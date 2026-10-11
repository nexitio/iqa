/**
 * Taxonomy: departments, topics and the districts every location-aware feature
 * keys off (prayer times, scholar directories, question routing).
 */

import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { Department } from "@/lib/types";
import { localized } from "./columns.ts";

export const districts = pgTable("districts", {
  id: text("id").primaryKey(),
  name: localized("name"),
  division: localized("division"),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  timezone: text("timezone").notNull().default("Asia/Dhaka"),
});

export const departments = pgTable(
  "departments",
  {
    id: text("id").primaryKey(),
    /**
     * Unique as a table constraint, not a separate index: two tables reference
     * `departments.slug`, and a foreign key cannot be added before the index a
     * separate `uniqueIndex()` generates would run.
     */
    slug: text("slug").notNull().unique(),
    name: localized("name"),
    shortName: localized("short_name"),
    description: localized("description"),
    /** Lucide icon name, resolved through the frontend icon map. */
    icon: text("icon").notNull(),
    /** Token stem used for tinting, e.g. "primary" | "accent" | "info". */
    tone: text("tone").notNull(),
    trending: boolean("trending").notNull().default(false),
    stats: jsonb("stats").$type<Department["stats"]>().notNull(),
  },
  (t) => [index("departments_trending_idx").on(t.trending)],
);

/**
 * A public theme readers browse by — "সুদ", "যৌতুক", "সন্তান লালনপালন".
 *
 * `contentCount` is a maintained counter rather than a COUNT(*) over five
 * tables: the topic pages ask for it on every render and never need the
 * breakdown.
 */
export const topics = pgTable(
  "topics",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: localized("name"),
    description: localized("description"),
    contentCount: integer("content_count").notNull().default(0),
    trending: boolean("trending").notNull().default(false),
  },
  (t) => [
    uniqueIndex("topics_slug_key").on(t.slug),
    index("topics_trending_idx").on(t.trending),
  ],
);

/** Which departments a topic is taught or answered within. */
export const topicDepartments = pgTable(
  "topic_departments",
  {
    topicId: text("topic_id")
      .notNull()
      .references(() => topics.id, { onDelete: "cascade" }),
    departmentSlug: text("department_slug")
      .notNull()
      .references(() => departments.slug, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.topicId, t.departmentSlug] }),
    index("topic_departments_slug_idx").on(t.departmentSlug),
  ],
);