/**
 * Hadith: collection → book → hadith, with the grading stated honestly on every
 * row and the topical links that let the reader browse by subject.
 */

import { boolean, index, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { localized, textArray } from "./columns.ts";
import { hadithGradeEnum } from "./enums.ts";

export const hadithCollections = pgTable(
  "hadith_collections",
  {
    id: text("id").primaryKey(),
    /** Constraint, not a separate index — books and hadiths both reference it. */
    slug: text("slug").notNull().unique(),
    name: localized("name"),
    author: localized("author"),
    nameArabic: text("name_arabic").notNull(),
    description: localized("description"),
    hadithCount: integer("hadith_count").notNull(),
    authentic: boolean("authentic").notNull().default(false),
    bookCount: integer("book_count").notNull().default(0),
    tone: text("tone").notNull(),
  },
);

export const hadithBooks = pgTable(
  "hadith_books",
  {
    id: text("id").primaryKey(),
    collectionSlug: text("collection_slug")
      .notNull()
      .references(() => hadithCollections.slug, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    name: localized("name"),
    hadithCount: integer("hadith_count").notNull().default(0),
  },
  (t) => [
    uniqueIndex("hadith_books_collection_number_key").on(t.collectionSlug, t.number),
    index("hadith_books_collection_idx").on(t.collectionSlug),
  ],
);

export const hadiths = pgTable(
  "hadiths",
  {
    id: text("id").primaryKey(),
    collectionSlug: text("collection_slug")
      .notNull()
      .references(() => hadithCollections.slug, { onDelete: "cascade" }),
    /** Denormalised so a hadith renders without joining its collection. */
    collectionName: localized("collection_name"),
    bookNumber: integer("book_number").notNull(),
    bookName: localized("book_name"),
    number: integer("number").notNull(),
    /** e.g. "সহীহ বুখারী ১২৭". */
    refBn: text("ref_bn").notNull(),
    refEn: text("ref_en").notNull(),
    arabic: text("arabic").notNull(),
    translationBn: text("translation_bn").notNull(),
    translationEn: text("translation_en").notNull(),
    narrator: localized("narrator"),
    grade: hadithGradeEnum("grade").notNull(),
    /** Short Bangla explanation of the lesson the hadith carries. */
    lessonBn: text("lesson_bn"),
    /**
     * Authored browse keys, served to the client as `topicIds`.
     *
     * These are not foreign keys and deliberately so: the dataset tags a hadith
     * with department ids ("fiqh", "ibadah", "akhlaq") rather than topic ids,
     * and the reader's topic page matches on the key text — the same two-tier
     * rule the frontend applies in `src/app/(app)/topics/[slug]/page.tsx`.
     */
    topicIds: textArray("topic_ids"),
  },
  (t) => [
    uniqueIndex("hadiths_collection_number_key").on(t.collectionSlug, t.number),
    index("hadiths_collection_book_idx").on(t.collectionSlug, t.bookNumber),
    index("hadiths_grade_idx").on(t.grade),
    index("hadiths_topic_ids_idx").using("gin", t.topicIds),
  ],
);