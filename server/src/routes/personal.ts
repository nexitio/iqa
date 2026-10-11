/**
 * Personal routes — everything under `/me`.
 *
 * All of them need an identity; none of them accept a user id from the client.
 * That is the rule that keeps one reader's library out of another's response,
 * and it is why these handlers take the id from `requireIdentity` only.
 */

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { requireIdentity, type AppBindings } from "../context.ts";
import { userFollowing } from "../db/relations.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest, notFound } from "../http/errors.ts";
import { listQuery, listResponse } from "../http/query.ts";
import {
  toBookmark,
  toBookmarkCollection,
  toJourney,
  toNotification,
  toReadingProgress,
  toUser,
} from "../present/dto.ts";

export const personalRoutes = new Hono<AppBindings>();

const LEARNING_GOAL_MINUTES_PER_DAY = 15;

personalRoutes.get("/me", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  const [row] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, identity.userId))
    .limit(1);

  if (!row) throw notFound(`Unknown user "${identity.userId}"`);

  const following = await userFollowing(db, row.id);
  return c.json({ data: toUser(row, following) });
});

personalRoutes.get("/me/bookmarks", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 50);

  const conditions = [eq(schema.bookmarks.userId, identity.userId)];
  const kind = c.req.query("kind");
  if (kind) conditions.push(eq(schema.bookmarks.kind, kind as typeof schema.bookmarks.$inferSelect.kind));
  if (c.req.query("collection")) {
    conditions.push(eq(schema.bookmarks.collectionId, c.req.query("collection")!));
  }

  const where = and(...conditions);

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(schema.bookmarks)
      .where(where)
      .orderBy(desc(schema.bookmarks.savedAt))
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.bookmarks)
      .where(where)
      .then((result) => result[0]?.value ?? 0),
  ]);

  return c.json(listResponse(rows.map(toBookmark), total, page));
});

personalRoutes.get("/me/bookmark-collections", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  // Counts come from a grouped query rather than a correlated subquery: a
  // hand-written subquery renders its column references unqualified, and
  // `"collection_id" = "id"` would then compare within the wrong table.
  const [rows, counts] = await Promise.all([
    db
      .select()
      .from(schema.bookmarkCollections)
      .where(eq(schema.bookmarkCollections.userId, identity.userId))
      .orderBy(asc(schema.bookmarkCollections.id)),
    db
      .select({
        collectionId: schema.bookmarks.collectionId,
        value: sql<number>`count(*)::int`,
      })
      .from(schema.bookmarks)
      .where(eq(schema.bookmarks.userId, identity.userId))
      .groupBy(schema.bookmarks.collectionId),
  ]);

  const countsByCollection = new Map(counts.map((row) => [row.collectionId, row.value]));

  return c.json({
    data: rows.map((row) => toBookmarkCollection(row, countsByCollection.get(row.id) ?? 0)),
  });
});

personalRoutes.post("/me/bookmarks", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await c.req.json<{
    kind?: typeof schema.bookmarks.$inferSelect.kind;
    titleBn?: string;
    previewBn?: string;
    refBn?: string;
    href?: string;
    collectionId?: string;
  }>();

  const kinds = [
    "ayah",
    "hadith",
    "dua",
    "article",
    "fatwa",
    "answer",
    "question",
    "discussion",
  ] as const;

  if (!body.kind || !kinds.includes(body.kind)) {
    throw badRequest(`kind must be one of: ${kinds.join(", ")}`);
  }
  for (const field of ["titleBn", "previewBn", "refBn", "href"] as const) {
    if (!body[field]?.trim()) throw badRequest(`${field} is required`);
  }

  const [created] = await db
    .insert(schema.bookmarks)
    .values({
      id: `bm-${Date.now().toString(36)}`,
      userId: identity.userId,
      kind: body.kind,
      titleBn: body.titleBn!.trim(),
      previewBn: body.previewBn!.trim(),
      refBn: body.refBn!.trim(),
      href: body.href!.trim(),
      savedAt: new Date().toISOString(),
      collectionId: body.collectionId ?? null,
    })
    .returning();

  return c.json({ data: toBookmark(created!) }, 201);
});

personalRoutes.delete("/me/bookmarks/:id", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  // Scoped by user, so one reader cannot delete another's bookmark by guessing.
  const deleted = await db
    .delete(schema.bookmarks)
    .where(
      and(eq(schema.bookmarks.id, c.req.param("id")), eq(schema.bookmarks.userId, identity.userId)),
    )
    .returning();

  if (deleted.length === 0) throw notFound("No such bookmark");
  return c.json({ data: { id: deleted[0]!.id, deleted: true } });
});

personalRoutes.get("/me/progress", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  const rows = await db
    .select()
    .from(schema.readingProgress)
    .where(eq(schema.readingProgress.userId, identity.userId))
    .orderBy(desc(schema.readingProgress.lastReadAt));

  return c.json({ data: rows.map(toReadingProgress) });
});

personalRoutes.get("/me/notifications", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  const conditions = [eq(schema.appNotifications.userId, identity.userId)];
  if (c.req.query("unread") === "true") conditions.push(eq(schema.appNotifications.read, false));

  const rows = await db
    .select()
    .from(schema.appNotifications)
    .where(and(...conditions))
    .orderBy(desc(schema.appNotifications.createdAt))
    .limit(50);

  return c.json({
    data: rows.map(toNotification),
    unreadCount: rows.filter((row) => !row.read).length,
  });
});

/**
 * Learning minutes for the last seven days, with the streak they imply.
 *
 * The streak is counted from the rows, not stored: a streak is a fact about
 * activity, and storing it would let it drift from the activity itself.
 */
personalRoutes.get("/me/learning", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  const rows = await db
    .select()
    .from(schema.learningDailyMinutes)
    .where(eq(schema.learningDailyMinutes.userId, identity.userId))
    .orderBy(desc(schema.learningDailyMinutes.day))
    .limit(30);

  const minutes = rows.reduce((total, row) => total + row.minutes, 0);
  let streakDays = 0;
  for (const row of rows) {
    if (row.minutes <= 0) break;
    streakDays += 1;
  }

  return c.json({
    data: {
      week: rows
        .slice(0, 7)
        .reverse()
        .map((row) => ({ day: row.day, minutes: row.minutes })),
      totalMinutes: minutes,
      streakDays,
      goalMinutesPerDay: LEARNING_GOAL_MINUTES_PER_DAY,
    },
  });
});

personalRoutes.get("/journeys", async (c) => {
  const db = c.get("db");
  const rows = await db.select().from(schema.journeys).orderBy(asc(schema.journeys.id));
  return c.json({ data: rows.map(toJourney) });
});

personalRoutes.get("/journeys/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");
  const [row] = await db
    .select()
    .from(schema.journeys)
    .where(eq(schema.journeys.slug, slug))
    .limit(1);
  if (!row) throw badRequest(`No journey "${slug}"`);

  const identity = c.get("identity");
  const enrollment = identity
    ? (
        await db
          .select()
          .from(schema.journeyEnrollments)
          .where(
            and(
              eq(schema.journeyEnrollments.journeyId, row.id),
              eq(schema.journeyEnrollments.userId, identity.userId),
            ),
          )
          .limit(1)
      )[0]
    : undefined;

  return c.json({
    data: {
      journey: toJourney(row),
      enrollment: enrollment
        ? {
            status: enrollment.status,
            completedDays: enrollment.completedDays,
            startedAt: new Date(enrollment.startedAt).toISOString(),
          }
        : null,
    },
  });
});

/**
 * A moderation view of one reader's own contributions.
 *
 * Anyone may see their drafts and their status; the admin console uses
 * `/admin/*` for the platform-wide view.
 */
personalRoutes.get("/me/contributions", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");

  const [articles, fatwas, answers] = await Promise.all([
    db
      .select({ id: schema.articles.id, slug: schema.articles.slug, status: schema.articles.status })
      .from(schema.articles)
      .where(eq(schema.articles.authorId, identity.userId)),
    db
      .select({ id: schema.fatwas.id, slug: schema.fatwas.slug, status: schema.fatwas.status })
      .from(schema.fatwas)
      .where(eq(schema.fatwas.muftiId, identity.userId)),
    db
      .select({ id: schema.answers.id, questionId: schema.answers.questionId })
      .from(schema.answers)
      .where(eq(schema.answers.scholarId, identity.userId)),
  ]);

  return c.json({ data: { articles, fatwas, answers } });
});
