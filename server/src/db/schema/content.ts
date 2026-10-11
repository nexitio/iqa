/**
 * Authored knowledge: scholar articles, mufti fatwas, and the shared pool of
 * verified Qur'an and Hadith citations they draw on.
 *
 * `Article` and `Fatwa` carry a `referenceCount`, and in the frontend the real
 * citation list is *recovered* from the body text (`src/app/(app)/_content/
 * citations.ts`). The seed runs that same recovery and stores the result here as
 * `article_references` / `fatwa_references`, so the linkage becomes something a
 * query can join instead of something every reader has to recompute.
 */

import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { localized, textArray } from "./columns.ts";
import { contentStatusEnum, fatwaStatusEnum, fiqhEnum, referenceKindEnum } from "./enums.ts";
import { users } from "./people.ts";
import { departments } from "./taxonomy.ts";

/** The shared citation pool every authored body quotes from. */
export const contentReferences = pgTable(
  "content_references",
  {
    id: text("id").primaryKey(),
    kind: referenceKindEnum("kind").notNull(),
    /**
     * "2:255" for an ayah, or a hadith id.
     *
     * Not a foreign key: the pool cites passages the local corpus does not hold
     * (সহীহ বুখারী ৫২৫১ and other works), and the snapshot below is what the
     * reader is shown either way.
     */
    ref: text("ref").notNull(),
    arabic: text("arabic").notNull(),
    translationBn: text("translation_bn").notNull(),
    refBn: text("ref_bn").notNull(),
    /** The author's own line on why the citation matters here. */
    note: text("note"),
  },
  (t) => [index("content_references_kind_ref_idx").on(t.kind, t.ref)],
);

export const articles = pgTable(
  "articles",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: localized("title"),
    excerpt: localized("excerpt"),
    /** Paragraphs, in reading order. */
    bodyBn: text("body_bn").array().notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    coverTone: text("cover_tone").notNull(),
    status: contentStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
    readingMinutes: integer("reading_minutes").notNull().default(1),
    viewCount: integer("view_count").notNull().default(0),
    bookmarkCount: integer("bookmark_count").notNull().default(0),
    likeCount: integer("like_count").notNull().default(0),
    commentCount: integer("comment_count").notNull().default(0),
    referenceCount: integer("reference_count").notNull().default(0),
    /** Authored topic keys — slugs, matched exactly by the topic pages. */
    topicIds: textArray("topic_ids"),
  },
  (t) => [
    uniqueIndex("articles_slug_key").on(t.slug),
    index("articles_status_published_idx").on(t.status, t.publishedAt),
    index("articles_author_idx").on(t.authorId),
    index("articles_topic_ids_idx").using("gin", t.topicIds),
  ],
);

export const articleDepartments = pgTable(
  "article_departments",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.departmentId] }),
    index("article_departments_department_idx").on(t.departmentId),
  ],
);

export const articleReferences = pgTable(
  "article_references",
  {
    articleId: text("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    referenceId: text("reference_id")
      .notNull()
      .references(() => contentReferences.id, { onDelete: "cascade" }),
    /** Position in the pool's order, so the panel reads the same every time. */
    position: integer("position").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.articleId, t.referenceId] }),
    index("article_references_reference_idx").on(t.referenceId),
  ],
);

export const fatwas = pgTable(
  "fatwas",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    questionBn: text("question_bn").notNull(),
    /** Concise ruling — the "জবাব" line at the top of the fatwa. */
    rulingBn: text("ruling_bn").notNull(),
    bodyBn: text("body_bn").array().notNull(),
    questionerDistrict: text("questioner_district").notNull(),
    muftiId: text("mufti_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    fiqh: fiqhEnum("fiqh").notNull().default("hanafi"),
    status: fatwaStatusEnum("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "string" }).notNull(),
    referenceCount: integer("reference_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    bookmarkCount: integer("bookmark_count").notNull().default(0),
    /** Important or frequently-asked rulings get pinned in the index. */
    pinned: boolean("pinned").notNull().default(false),
  },
  (t) => [
    uniqueIndex("fatwas_slug_key").on(t.slug),
    index("fatwas_status_published_idx").on(t.status, t.publishedAt),
    index("fatwas_mufti_idx").on(t.muftiId),
    index("fatwas_pinned_idx").on(t.pinned),
  ],
);

/** Co-signing muftis for a collective fatwa. */
export const fatwaCosigners = pgTable(
  "fatwa_cosigners",
  {
    fatwaId: text("fatwa_id")
      .notNull()
      .references(() => fatwas.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.fatwaId, t.userId] })],
);

export const fatwaDepartments = pgTable(
  "fatwa_departments",
  {
    fatwaId: text("fatwa_id")
      .notNull()
      .references(() => fatwas.id, { onDelete: "cascade" }),
    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.fatwaId, t.departmentId] }),
    index("fatwa_departments_department_idx").on(t.departmentId),
  ],
);

export const fatwaReferences = pgTable(
  "fatwa_references",
  {
    fatwaId: text("fatwa_id")
      .notNull()
      .references(() => fatwas.id, { onDelete: "cascade" }),
    referenceId: text("reference_id")
      .notNull()
      .references(() => contentReferences.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.fatwaId, t.referenceId] }),
    index("fatwa_references_reference_idx").on(t.referenceId),
  ],
);
