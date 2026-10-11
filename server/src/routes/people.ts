/**
 * Public profiles, the feed, and cross-entity search.
 *
 * A profile is the public half of an account: name, district, role and what the
 * person contributed. Email never leaves this file's `toPublicUser` call — that
 * is the whole reason `toPublicUser` exists next to `toUser`.
 */

import { and, asc, desc, eq, or, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { AppBindings } from "../context.ts";
import { userFollowing } from "../db/relations.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest, notFound } from "../http/errors.ts";
import { enumParam, listQuery } from "../http/query.ts";
import { toFeedItem, toFeedSection, toPublicUser } from "../present/dto.ts";

export const peopleRoutes = new Hono<AppBindings>();

const FEED_KINDS = [
  "daily-ayah",
  "daily-hadith",
  "answer",
  "article",
  "fatwa",
  "discussion",
  "question",
  "journey",
] as const;

peopleRoutes.get("/users/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const [row] = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  if (!row) throw notFound(`No user "${id}"`);

  const [following, answers, articles] = await Promise.all([
    userFollowing(db, row.id),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.answers)
      .where(eq(schema.answers.scholarId, row.id))
      .then((result) => result[0]?.value ?? 0),
    db
      .select({
        id: schema.articles.id,
        slug: schema.articles.slug,
        title: schema.articles.title,
        publishedAt: schema.articles.publishedAt,
      })
      .from(schema.articles)
      .where(and(eq(schema.articles.authorId, row.id), eq(schema.articles.status, "published")))
      .orderBy(desc(schema.articles.publishedAt))
      .limit(5),
  ]);

  return c.json({
    data: {
      user: toPublicUser(row, following),
      stats: { answers, publishedArticles: articles.length },
      articles: articles.map((article) => ({
        ...article,
        publishedAt: new Date(article.publishedAt).toISOString(),
      })),
    },
  });
});

/** The reader's feed, with the editorial sections the client renders it in. */
peopleRoutes.get("/feed", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 20);
  const kind = enumParam(url, "kind", FEED_KINDS);

  const where = kind ? eq(schema.feedItems.kind, kind) : undefined;

  const [rows, sections] = await Promise.all([
    db
      .select()
      .from(schema.feedItems)
      .where(where)
      .orderBy(desc(schema.feedItems.createdAt))
      .limit(page.limit)
      .offset(page.offset),
    db.select().from(schema.feedSections).orderBy(asc(schema.feedSections.id)),
  ]);

  return c.json({ data: rows.map(toFeedItem), sections: sections.map(toFeedSection) });
});

interface SearchHit {
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

/**
 * Search every kind of content at once, grouped.
 *
 * Five hits per group is deliberate: this powers a command palette, where the
 * reader wants to recognise the right item, not read a result page. A full
 * search page would use the list routes with `?q=`.
 */
peopleRoutes.get("/search", async (c) => {
  const db = c.get("db");
  const { q } = listQuery(new URL(c.req.url), 5);
  if (!q || q.length < 2) throw badRequest('Provide "q" of at least two characters');

  const like = `%${q}%`;
  const limit = 5;

  const [surahs, ayahs, hadiths, duas, articles, fatwas, questions, scholars, topics] =
    await Promise.all([
      db
        .select()
        .from(schema.quranSurahs)
        .where(
          or(
            sql`(${schema.quranSurahs.name}->>'bn') ilike ${like}`,
            sql`${schema.quranSurahs.slug} ilike ${like}`,
          ),
        )
        .limit(limit),
      db
        .select()
        .from(schema.quranAyahs)
        .where(
          or(
            sql`${schema.quranAyahs.translationBn} ilike ${like}`,
            sql`${schema.quranAyahs.transliterationBn} ilike ${like}`,
          ),
        )
        .limit(limit),
      db
        .select()
        .from(schema.hadiths)
        .where(
          or(
            sql`${schema.hadiths.translationBn} ilike ${like}`,
            sql`${schema.hadiths.refBn} ilike ${like}`,
          ),
        )
        .limit(limit),
      db
        .select()
        .from(schema.duas)
        .where(
          or(
            sql`(${schema.duas.title}->>'bn') ilike ${like}`,
            sql`(${schema.duas.meaning}->>'bn') ilike ${like}`,
            sql`array_to_string(${schema.duas.tags}, ' ') ilike ${like}`,
          ),
        )
        .limit(limit),
      db
        .select()
        .from(schema.articles)
        .where(
          and(
            eq(schema.articles.status, "published"),
            or(
              sql`(${schema.articles.title}->>'bn') ilike ${like}`,
              sql`(${schema.articles.excerpt}->>'bn') ilike ${like}`,
            ),
          ),
        )
        .limit(limit),
      db
        .select()
        .from(schema.fatwas)
        .where(
          and(
            eq(schema.fatwas.status, "published"),
            or(
              sql`${schema.fatwas.questionBn} ilike ${like}`,
              sql`${schema.fatwas.rulingBn} ilike ${like}`,
            ),
          ),
        )
        .limit(limit),
      db
        .select()
        .from(schema.questions)
        .where(
          and(
            eq(schema.questions.visibility, "public"),
            sql`${schema.questions.titleBn} ilike ${like}`,
          ),
        )
        .limit(limit),
      db
        .select()
        .from(schema.scholars)
        .where(
          or(
            sql`(${schema.scholars.name}->>'bn') ilike ${like}`,
            sql`(${schema.scholars.name}->>'en') ilike ${like}`,
          ),
        )
        .limit(limit),
      db
        .select()
        .from(schema.topics)
        .where(
          or(
            sql`(${schema.topics.name}->>'bn') ilike ${like}`,
            sql`(${schema.topics.name}->>'en') ilike ${like}`,
          ),
        )
        .limit(limit),
    ]);

  const groups: { kind: string; data: SearchHit[] }[] = [
    {
      kind: "surah",
      data: surahs.map((row) => ({
        id: String(row.number),
        title: row.name.bn,
        subtitle: row.meaning.bn,
        href: `/quran/${row.slug}`,
      })),
    },
    {
      kind: "ayah",
      data: ayahs.map((row) => ({
        id: row.ref,
        title: row.ref,
        subtitle: row.translationBn.slice(0, 120),
        href: `/quran/${row.surah}#ayah-${row.number}`,
      })),
    },
    {
      kind: "hadith",
      data: hadiths.map((row) => ({
        id: row.id,
        title: row.refBn,
        subtitle: row.translationBn.slice(0, 120),
        href: `/hadith/${row.collectionSlug}/${row.number}`,
      })),
    },
    {
      kind: "dua",
      data: duas.map((row) => ({
        id: row.slug,
        title: row.title.bn,
        subtitle: row.meaning.bn.slice(0, 120),
        href: `/duas/${row.slug}`,
      })),
    },
    {
      kind: "article",
      data: articles.map((row) => ({
        id: row.slug,
        title: row.title.bn,
        subtitle: row.excerpt.bn.slice(0, 120),
        href: `/articles/${row.slug}`,
      })),
    },
    {
      kind: "fatwa",
      data: fatwas.map((row) => ({
        id: row.slug,
        title: row.questionBn,
        subtitle: row.rulingBn.slice(0, 120),
        href: `/fatwas/${row.slug}`,
      })),
    },
    {
      kind: "question",
      data: questions.map((row) => ({
        id: row.slug,
        title: row.titleBn,
        subtitle: row.bodyBn.slice(0, 120),
        href: `/questions/${row.slug}`,
      })),
    },
    {
      kind: "scholar",
      data: scholars.map((row) => ({
        id: row.slug,
        title: `${row.honorific.bn} ${row.name.bn}`,
        subtitle: row.shortBio.bn.slice(0, 120),
        href: `/scholars/${row.slug}`,
      })),
    },
    {
      kind: "topic",
      data: topics.map((row) => ({
        id: row.slug,
        title: row.name.bn,
        subtitle: row.description.bn.slice(0, 120),
        href: `/topics/${row.slug}`,
      })),
    },
  ].filter((group) => group.data.length > 0) as { kind: string; data: SearchHit[] }[];

  return c.json({
    query: q,
    total: groups.reduce((sum, group) => sum + group.data.length, 0),
    groups,
  });
});