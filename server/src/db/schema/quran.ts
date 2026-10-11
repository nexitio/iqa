/**
 * Qur'an.
 *
 * The text itself is immutable and read-only: an ayah is addressed by
 * `(surah, number)` and carries the Bangla translation plus the Bengali-script
 * pronunciation aid (উচ্চারণ) this product treats as a signature feature.
 */

import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { localized, localizedOptional } from "./columns.ts";
import { revelationPlaceEnum } from "./enums.ts";

export const quranSurahs = pgTable(
  "quran_surahs",
  {
    number: integer("number").primaryKey(),
    slug: text("slug").notNull(),
    nameArabic: text("name_arabic").notNull(),
    name: localized("name"),
    meaning: localized("meaning"),
    ayahCount: integer("ayah_count").notNull(),
    revelation: revelationPlaceEnum("revelation").notNull(),
    /** Whether the local dataset actually contains this surah's text yet. */
    hasText: boolean("has_text").notNull().default(false),
    /** Display grouping used by the index page (Juz / Para). */
    juz: integer("juz").notNull(),
    about: localizedOptional("about"),
  },
  (t) => [uniqueIndex("quran_surahs_slug_key").on(t.slug), index("quran_surahs_juz_idx").on(t.juz)],
);

export const quranAyahs = pgTable(
  "quran_ayahs",
  {
    surah: integer("surah")
      .notNull()
      .references(() => quranSurahs.number, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    /** e.g. "2:255". */
    ref: text("ref").notNull(),
    arabic: text("arabic").notNull(),
    /** Islamic Foundation Bangladesh style Bangla translation. */
    translationBn: text("translation_bn").notNull(),
    translationEn: text("translation_en").notNull(),
    transliterationBn: text("transliteration_bn").notNull(),
    tafsirBn: text("tafsir_bn"),
    sajda: boolean("sajda").notNull().default(false),
  },
  (t) => [
    primaryKey({ columns: [t.surah, t.number] }),
    uniqueIndex("quran_ayahs_ref_key").on(t.ref),
  ],
);
