/**
 * The reading library: Qur'an, hadith and dua.
 *
 * These are the most-read endpoints in the product and the only ones where the
 * text is immutable, so they are served straight from their tables with no
 * joins beyond the parent collection.
 */

import { and, arrayOverlaps, asc, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import type { AppBindings } from "../context.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest, notFound } from "../http/errors.ts";
import { enumParam, integerParam, listQuery, listResponse } from "../http/query.ts";
import {
  toAyah,
  toDhikrItem,
  toDua,
  toDuaCategory,
  toFocusTheme,
  toHadith,
  toHadithBook,
  toHadithCollection,
  toSurah,
} from "../present/dto.ts";

export const libraryRoutes = new Hono<AppBindings>();

/* --- Qur'an ---------------------------------------------------------------- */

libraryRoutes.get("/quran/surahs", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const conditions: (SQL | undefined)[] = [];

  const revelation = enumParam(url, "revelation", ["meccan", "medinan"] as const);
  if (revelation) conditions.push(eq(schema.quranSurahs.revelation, revelation));

  const juz = url.searchParams.get("juz");
  if (juz) conditions.push(eq(schema.quranSurahs.juz, integerParam(url, "juz", 1, 1, 30)));

  const q = url.searchParams.get("q")?.trim();
  if (q) {
    const like = `%${q}%`;
    conditions.push(
      or(
        sql`(${schema.quranSurahs.name}->>'bn') ilike ${like}`,
        sql`(${schema.quranSurahs.name}->>'en') ilike ${like}`,
        sql`${schema.quranSurahs.nameArabic} ilike ${like}`,
        sql`${schema.quranSurahs.slug} ilike ${like}`,
        sql`${schema.quranSurahs.number}::text = ${q}`,
      ),
    );
  }

  const rows = await db
    .select()
    .from(schema.quranSurahs)
    .where(and(...conditions.filter((condition): condition is SQL => Boolean(condition))))
    .orderBy(asc(schema.quranSurahs.number));

  return c.json({ data: rows.map(toSurah) });
});

libraryRoutes.get("/quran/surahs/:surah", async (c) => {
  const db = c.get("db");
  const key = c.req.param("surah");
  const numeric = Number(key);

  const [surah] = await db
    .select()
    .from(schema.quranSurahs)
    .where(
      Number.isInteger(numeric) && numeric > 0
        ? eq(schema.quranSurahs.number, numeric)
        : eq(schema.quranSurahs.slug, key),
    )
    .limit(1);

  if (!surah) throw notFound(`No surah "${key}"`);

  const ayahs = await db
    .select()
    .from(schema.quranAyahs)
    .where(eq(schema.quranAyahs.surah, surah.number))
    .orderBy(asc(schema.quranAyahs.number));

  return c.json({ data: { surah: toSurah(surah), ayahs: ayahs.map(toAyah) } });
});

/** Ayahs by range, or one by `?ref=2:255`. */
libraryRoutes.get("/quran/ayahs", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);

  const ref = url.searchParams.get("ref");
  if (ref) {
    const [ayah] = await db
      .select()
      .from(schema.quranAyahs)
      .where(eq(schema.quranAyahs.ref, ref))
      .limit(1);
    if (!ayah) throw notFound(`No ayah at ${ref}`);
    return c.json({ data: toAyah(ayah) });
  }

  const surah = integerParam(url, "surah", 0, 0, 114);
  if (surah === 0) throw badRequest('Provide "surah" or "ref"');

  const from = integerParam(url, "from", 1, 1, 300);
  const to = integerParam(url, "to", 300, 1, 300);
  if (to < from) throw badRequest('"to" must not be less than "from"');

  const rows = await db
    .select()
    .from(schema.quranAyahs)
    .where(
      and(
        eq(schema.quranAyahs.surah, surah),
        sql`${schema.quranAyahs.number} between ${from} and ${to}`,
      ),
    )
    .orderBy(asc(schema.quranAyahs.number));

  return c.json({ data: rows.map(toAyah) });
});

/** Full-text-ish search over Arabic, the Bangla translation and transliteration. */
libraryRoutes.get("/quran/search", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const { q } = listQuery(url, 20);
  if (!q) throw badRequest('Provide "q"');

  const like = `%${q}%`;
  const rows = await db
    .select()
    .from(schema.quranAyahs)
    .where(
      or(
        sql`${schema.quranAyahs.arabic} ilike ${like}`,
        sql`${schema.quranAyahs.translationBn} ilike ${like}`,
        sql`${schema.quranAyahs.transliterationBn} ilike ${like}`,
      ),
    )
    .orderBy(asc(schema.quranAyahs.surah), asc(schema.quranAyahs.number))
    .limit(50);

  return c.json({ data: rows.map(toAyah), query: q });
});

/* --- Hadith ---------------------------------------------------------------- */

libraryRoutes.get("/hadith/collections", async (c) => {
  const db = c.get("db");
  const rows = await db
    .select()
    .from(schema.hadithCollections)
    .orderBy(desc(schema.hadithCollections.authentic), asc(schema.hadithCollections.slug));
  return c.json({ data: rows.map(toHadithCollection) });
});

libraryRoutes.get("/hadith/collections/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");

  const [collection] = await db
    .select()
    .from(schema.hadithCollections)
    .where(eq(schema.hadithCollections.slug, slug))
    .limit(1);
  if (!collection) throw notFound(`No collection "${slug}"`);

  const books = await db
    .select()
    .from(schema.hadithBooks)
    .where(eq(schema.hadithBooks.collectionSlug, collection.slug))
    .orderBy(asc(schema.hadithBooks.number));

  return c.json({
    data: { collection: toHadithCollection(collection), books: books.map(toHadithBook) },
  });
});

libraryRoutes.get("/hadith/hadiths", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 20);

  const conditions: (SQL | undefined)[] = [];

  const collection = c.req.query("collection");
  if (collection) conditions.push(eq(schema.hadiths.collectionSlug, collection));
  if (c.req.query("book")) {
    conditions.push(eq(schema.hadiths.bookNumber, integerParam(url, "book", 1, 1, 999)));
  }

  const grade = enumParam(url, "grade", [
    "sahih",
    "hasan",
    "daif",
    "muttafaqun-alaih",
  ] as const);
  if (grade) conditions.push(eq(schema.hadiths.grade, grade));

  const topic = c.req.query("topic");
  if (topic) {
    // A hadith is tagged with a department id in the dataset, so the caller may
    // send either the department id or its slug.
    const key =
      (await db
        .select({ slug: schema.departments.slug })
        .from(schema.departments)
        .where(
          or(eq(schema.departments.slug, topic), eq(schema.departments.id, topic)),
        )
        .limit(1))[0]?.slug ?? topic;
    conditions.push(arrayOverlaps(schema.hadiths.topicIds, [key]));
  }

  if (page.q) {
    const like = `%${page.q}%`;
    conditions.push(
      or(
        sql`${schema.hadiths.translationBn} ilike ${like}`,
        sql`${schema.hadiths.translationEn} ilike ${like}`,
        sql`${schema.hadiths.arabic} ilike ${like}`,
        sql`${schema.hadiths.refBn} ilike ${like}`,
      ),
    );
  }

  const where = and(...conditions.filter((condition): condition is SQL => Boolean(condition)));

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(schema.hadiths)
      .where(where)
      .orderBy(asc(schema.hadiths.collectionSlug), asc(schema.hadiths.number))
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.hadiths)
      .where(where)
      .then((result) => result[0]?.value ?? 0),
  ]);

  return c.json(listResponse(rows.map(toHadith), total, page));
});

libraryRoutes.get("/hadith/hadiths/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const [row] = await db
    .select()
    .from(schema.hadiths)
    .where(or(eq(schema.hadiths.id, id), eq(schema.hadiths.refEn, id)))
    .limit(1);

  if (!row) throw notFound(`No hadith "${id}"`);

  const collection = await db
    .select()
    .from(schema.hadithCollections)
    .where(eq(schema.hadithCollections.slug, row.collectionSlug))
    .limit(1);

  return c.json({
    data: {
      hadith: toHadith(row),
      collection: collection[0] ? toHadithCollection(collection[0]) : null,
    },
  });
});

/** `/hadith/bukhari/1` — the pair form the frontend routes with. */
libraryRoutes.get("/hadith/:collection/:number", async (c) => {
  const db = c.get("db");
  const { collection, number } = c.req.param();
  const parsed = Number(number);
  if (!Number.isInteger(parsed)) throw badRequest("The hadith number must be a whole number");

  const [row] = await db
    .select()
    .from(schema.hadiths)
    .where(
      and(eq(schema.hadiths.collectionSlug, collection), eq(schema.hadiths.number, parsed)),
    )
    .limit(1);

  if (!row) throw notFound(`No hadith ${number} in "${collection}"`);
  return c.json({ data: toHadith(row) });
});

/* --- Duas ------------------------------------------------------------------ */

libraryRoutes.get("/duas/categories", async (c) => {
  const db = c.get("db");
  const rows = await db.select().from(schema.duaCategories).orderBy(asc(schema.duaCategories.slug));
  return c.json({ data: rows.map(toDuaCategory) });
});

libraryRoutes.get("/duas", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 25);

  const conditions: (SQL | undefined)[] = [];
  const category = c.req.query("category");
  if (category) {
    const slugs = (
      await db
        .select({ slug: schema.duaCategories.slug, id: schema.duaCategories.id })
        .from(schema.duaCategories)
        .where(
          or(eq(schema.duaCategories.slug, category), eq(schema.duaCategories.id, category)),
        )
        .limit(1)
    ).map((row) => row.slug);
    if (slugs.length === 0) throw badRequest(`No dua category "${category}"`);
    conditions.push(eq(schema.duas.categorySlug, slugs[0]!));
  }

  if (page.q) {
    const like = `%${page.q}%`;
    conditions.push(
      or(
        sql`(${schema.duas.title}->>'bn') ilike ${like}`,
        sql`(${schema.duas.meaning}->>'bn') ilike ${like}`,
        sql`(${schema.duas.reference}->>'bn') ilike ${like}`,
        sql`array_to_string(${schema.duas.tags}, ' ') ilike ${like}`,
      ),
    );
  }

  const where = and(...conditions.filter((condition): condition is SQL => Boolean(condition)));

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(schema.duas)
      .where(where)
      .orderBy(asc(schema.duas.categorySlug), asc(schema.duas.slug))
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.duas)
      .where(where)
      .then((result) => result[0]?.value ?? 0),
  ]);

  return c.json(listResponse(rows.map(toDua), total, page));
});

libraryRoutes.get("/duas/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");
  const [row] = await db
    .select()
    .from(schema.duas)
    .where(or(eq(schema.duas.slug, slug), eq(schema.duas.id, slug)))
    .limit(1);
  if (!row) throw notFound(`No dua "${slug}"`);
  return c.json({ data: toDua(row) });
});

/** The daily rotation, resolved to actual content. */
libraryRoutes.get("/daily", async (c) => {
  const db = c.get("db");
  const [highlight] = await db
    .select()
    .from(schema.dailyHighlights)
    .where(eq(schema.dailyHighlights.id, "current"))
    .limit(1);

  const ayahRefs = highlight?.ayahRefs ?? [];
  const hadithIds = highlight?.hadithIds ?? [];

  const [ayahs, hadiths, dhikr, themes] = await Promise.all([
    ayahRefs.length
      ? db.select().from(schema.quranAyahs).where(inArray(schema.quranAyahs.ref, ayahRefs))
      : Promise.resolve([] as (typeof schema.quranAyahs.$inferSelect)[]),
    hadithIds.length
      ? db.select().from(schema.hadiths).where(inArray(schema.hadiths.id, hadithIds))
      : Promise.resolve([] as (typeof schema.hadiths.$inferSelect)[]),
    db.select().from(schema.dhikrItems).orderBy(asc(schema.dhikrItems.id)),
    db.select().from(schema.focusThemes).orderBy(asc(schema.focusThemes.id)),
  ]);

  const orderedAyahs = ayahRefs
    .map((ref) => ayahs.find((ayah) => ayah.ref === ref))
    .filter((ayah): ayah is NonNullable<typeof ayah> => Boolean(ayah));
  const orderedHadiths = hadithIds
    .map((id) => hadiths.find((hadith) => hadith.id === id))
    .filter((hadith): hadith is NonNullable<typeof hadith> => Boolean(hadith));

  return c.json({
    data: {
      ayahs: orderedAyahs.map(toAyah),
      hadiths: orderedHadiths.map(toHadith),
      dhikr: dhikr.map(toDhikrItem),
      focusThemes: themes.map(toFocusTheme),
    },
  });
});
