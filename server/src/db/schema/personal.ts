/**
 * Everything personal: saved items, reading progress, journeys, notifications
 * and the feed.
 *
 * The frontend mock is single-user — `Bookmark`, `ReadingProgress` and
 * `AppNotification` have no owner field because there is only ever one reader.
 * Here they do: a real backend must scope every row to a user, so each of these
 * tables carries `user_id` and the routes filter on it.
 */

import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { JourneyDay } from "@/lib/types";
import { textArray } from "./columns.ts";
import {
  bookmarkKindEnum,
  feedKindEnum,
  notificationKindEnum,
  readingKindEnum,
} from "./enums.ts";
import { users } from "./people.ts";

export const bookmarkCollections = pgTable(
  "bookmark_collections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    nameBn: text("name_bn").notNull(),
    tone: text("tone").notNull(),
  },
  (t) => [index("bookmark_collections_user_idx").on(t.userId)],
);

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: bookmarkKindEnum("kind").notNull(),
    /** Snapshotted so the library renders without reopening every source. */
    titleBn: text("title_bn").notNull(),
    previewBn: text("preview_bn").notNull(),
    refBn: text("ref_bn").notNull(),
    href: text("href").notNull(),
    savedAt: timestamp("saved_at", { withTimezone: true, mode: "string" }).notNull(),
    collectionId: text("collection_id").references(() => bookmarkCollections.id, {
      onDelete: "set null",
    }),
  },
  (t) => [
    index("bookmarks_user_saved_idx").on(t.userId, t.savedAt),
    index("bookmarks_collection_idx").on(t.collectionId),
  ],
);

export const readingProgress = pgTable(
  "reading_progress",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: readingKindEnum("kind").notNull(),
    titleBn: text("title_bn").notNull(),
    subtitleBn: text("subtitle_bn").notNull(),
    href: text("href").notNull(),
    /** 0–100. */
    progress: integer("progress").notNull().default(0),
    lastReadAt: timestamp("last_read_at", { withTimezone: true, mode: "string" }).notNull(),
    /** Where exactly to resume. */
    resumeLabelBn: text("resume_label_bn").notNull(),
  },
  (t) => [index("reading_progress_user_idx").on(t.userId, t.lastReadAt)],
);

export const journeys = pgTable(
  "journeys",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    titleBn: text("title_bn").notNull(),
    descriptionBn: text("description_bn").notNull(),
    /** e.g. "৭ দিনে জান্নাতের পথ". */
    durationLabelBn: text("duration_label_bn").notNull(),
    enrolled: integer("enrolled").notNull().default(0),
    completedDays: integer("completed_days").notNull().default(0),
    totalDays: integer("total_days").notNull(),
    days: jsonb("days").$type<JourneyDay[]>().notNull(),
    tone: text("tone").notNull(),
    categoryBn: text("category_bn").notNull(),
  },
  (t) => [uniqueIndex("journeys_slug_key").on(t.slug)],
);

export const appNotifications = pgTable(
  "app_notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: notificationKindEnum("kind").notNull(),
    titleBn: text("title_bn").notNull(),
    bodyBn: text("body_bn").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    read: boolean("read").notNull().default(false),
    href: text("href").notNull(),
    actorId: text("actor_id").references(() => users.id, { onDelete: "set null" }),
  },
  (t) => [index("app_notifications_user_created_idx").on(t.userId, t.createdAt)],
);

/** Editorial grouping of the feed — "আপনার জন্য", "নতুন ফতোয়া". */
export const feedSections = pgTable("feed_sections", {
  id: text("id").primaryKey(),
  titleBn: text("title_bn").notNull(),
  titleEn: text("title_en").notNull(),
  kinds: feedKindEnum("kinds").array().notNull(),
});

/**
 * One entry in the reader's feed.
 *
 * The payload is polymorphic: exactly one of the id columns is set, chosen by
 * `kind`, which is why they are nullable columns rather than five tables.
 */
export const feedItems = pgTable(
  "feed_items",
  {
    id: text("id").primaryKey(),
    kind: feedKindEnum("kind").notNull(),
    /** Why the user is seeing this — powers the transparency row. */
    reasonBn: text("reason_bn").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    articleId: text("article_id"),
    fatwaId: text("fatwa_id"),
    questionId: text("question_id"),
    discussionId: text("discussion_id"),
    scholarId: text("scholar_id"),
    /** Ayah address, e.g. "2:255". */
    ayahRef: text("ayah_ref"),
    hadithId: text("hadith_id"),
    journeyId: text("journey_id"),
  },
  (t) => [index("feed_items_created_idx").on(t.createdAt), index("feed_items_kind_idx").on(t.kind)],
);

/**
 * Minutes of learning per user per day.
 *
 * The mock keeps a single week as an array of numbers; a streak and a weekly
 * total are the two things the personal pages ask for, and neither survives
 * being stored as one array per user. One row per day answers both.
 */
export const learningDailyMinutes = pgTable(
  "learning_daily_minutes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    day: date("day").notNull(),
    minutes: integer("minutes").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.userId, t.day] })],
);

/** The journey a user is enrolled in, and how far they have got. */
export const journeyEnrollments = pgTable(
  "journey_enrollments",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    journeyId: text("journey_id")
      .notNull()
      .references(() => journeys.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("active"),
    completedDays: integer("completed_days").notNull().default(0),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.journeyId] })],
);

/** Lesson themes the daily page rotates through. */
export const focusThemes = pgTable(
  "focus_themes",
  {
    id: text("id").primaryKey(),
    titleBn: text("title_bn").notNull(),
    emoji: text("emoji").notNull(),
    descriptionBn: text("description_bn").notNull(),
    departmentSlugs: textArray("department_slugs"),
    targetMinutes: integer("target_minutes").notNull().default(15),
  },
  (t) => [index("focus_themes_title_idx").on(t.titleBn)],
);

/** A dhikr routine item for the daily page. */
export const dhikrItems = pgTable("dhikr_items", {
  id: text("id").primaryKey(),
  arabic: text("arabic").notNull(),
  transliterationBn: text("transliteration_bn").notNull(),
  meaningBn: text("meaning_bn").notNull(),
  /** How many times, as written, e.g. "৩ বার". */
  count: text("count").notNull(),
  virtueBn: text("virtue_bn").notNull(),
});

/**
 * The curated ayah/hadith rotation behind "আজকের আয়াত".
 *
 * Kept in a single row because it is editorial state, not content: two ordered
 * lists the daily page walks by day index.
 */
export const dailyHighlights = pgTable("daily_highlights", {
  id: text("id").primaryKey(),
  ayahRefs: textArray("ayah_refs"),
  hadithIds: textArray("hadith_ids"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
});