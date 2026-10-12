/**
 * Authored content routes.
 *
 * Lists carry the filters a reader actually uses — department, topic, author,
 * status, full-text-ish `q` — and return the paginated envelope. `?topic=` and
 * `?department=` resolve through the shared filter helpers, so a topic page and
 * a topic-filtered list agree on what belongs to the topic.
 *
 * Articles carry authored topic tags, so `?topic=` matches those first. Fatwas do
 * not — they are filed under departments — so for them the topic filter is the
 * departments the topic covers (see the note on `/fatwas`).
 */

import { and, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import type { AppBindings } from "../context.ts";
import * as schema from "../db/schema/index.ts";
import { articleDepartmentIds, fatwaCoSignerIds, fatwaDepartmentIds } from "../db/relations.ts";
import { notFound } from "../http/errors.ts";
import { enumParam, listQuery, listResponse, booleanParam } from "../http/query.ts";
import { toArticle, toFatwa, toReference } from "../present/dto.ts";
import { resolveDepartment, resolveTopic, taggedOrInDepartment } from "./filters.ts";

export const contentRoutes = new Hono<AppBindings>();

contentRoutes.get("/articles", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 12);

  const status = enumParam(url, "status", [
    "draft",
    "in-review",
    "published",
    "changes-requested",
  ] as const);

  const conditions: (SQL | undefined)[] = [];
  if (status) conditions.push(eq(schema.articles.status, status));
  else conditions.push(eq(schema.articles.status, "published"));

  const department = c.req.query("department");
  if (department) {
    const resolved = await resolveDepartment(db, department);
    conditions.push(
      inArray(
        schema.articles.id,
        db
          .select({ id: schema.articleDepartments.articleId })
          .from(schema.articleDepartments)
          .where(eq(schema.articleDepartments.departmentId, resolved.id)),
      ),
    );
  }

  const topic = c.req.query("topic");
  if (topic) {
    const filter = await resolveTopic(db, topic);
    conditions.push(
      taggedOrInDepartment({
        db,
        keys: filter.keys,
        departmentIds: filter.departmentIds,
        includeRelated: booleanParam(url, "includeRelated") ?? false,
        topicIds: schema.articles.topicIds,
        parentId: schema.articles.id,
        joinTable: schema.articleDepartments,
        childColumn: schema.articleDepartments.articleId,
        departmentColumn: schema.articleDepartments.departmentId,
      }),
    );
  }

  if (c.req.query("author")) conditions.push(eq(schema.articles.authorId, c.req.query("author")!));
  if (page.q) {
    const like = `%${page.q}%`;
    conditions.push(
      or(
        sql`(${schema.articles.title}->>'bn') ilike ${like}`,
        sql`(${schema.articles.title}->>'en') ilike ${like}`,
        sql`(${schema.articles.excerpt}->>'bn') ilike ${like}`,
        sql`array_to_string(${schema.articles.bodyBn}, ' ') ilike ${like}`,
      ),
    );
  }

  const where = and(...conditions.filter((condition): condition is SQL => Boolean(condition)));
  const sort = c.req.query("sort") === "popular" ? "popular" : "recent";

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(schema.articles)
      .where(where)
      .orderBy(
        sort === "popular"
          ? desc(schema.articles.viewCount)
          : desc(schema.articles.publishedAt),
      )
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.articles)
      .where(where)
      .then((result) => result[0]?.value ?? 0),
  ]);

  const departments = await articleDepartmentIds(
    db,
    rows.map((row) => row.id),
  );

  return c.json(
    listResponse(
      rows.map((row) => toArticle(row, departments.get(row.id) ?? [])),
      total,
      page,
    ),
  );
});

contentRoutes.get("/articles/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");

  const [article] = await db
    .select()
    .from(schema.articles)
    .where(or(eq(schema.articles.slug, slug), eq(schema.articles.id, slug)))
    .limit(1);

  if (!article) throw notFound(`No article "${slug}"`);

  const [departments, references, author] = await Promise.all([
    articleDepartmentIds(db, [article.id]),
    db
      .select({ reference: schema.contentReferences })
      .from(schema.articleReferences)
      .innerJoin(
        schema.contentReferences,
        eq(schema.contentReferences.id, schema.articleReferences.referenceId),
      )
      .where(eq(schema.articleReferences.articleId, article.id))
      .orderBy(schema.articleReferences.position),
    db.select().from(schema.users).where(eq(schema.users.id, article.authorId)).limit(1),
  ]);

  return c.json({
    data: {
      article: toArticle(article, departments.get(article.id) ?? []),
      references: references.map((row) => toReference(row.reference)),
      author: author[0]
        ? { id: author[0].id, name: author[0].name, scholarId: author[0].scholarId }
        : null,
    },
  });
});

contentRoutes.get("/fatwas", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 12);

  const conditions: (SQL | undefined)[] = [];
  const status = enumParam(url, "status", ["draft", "in-review", "published"] as const);
  conditions.push(eq(schema.fatwas.status, status ?? "published"));

  const fiqh = enumParam(url, "fiqh", ["hanafi", "comparative"] as const);
  if (fiqh) conditions.push(eq(schema.fatwas.fiqh, fiqh));

  const pinned = booleanParam(url, "pinned");
  if (pinned !== undefined) conditions.push(eq(schema.fatwas.pinned, pinned));

  if (c.req.query("mufti")) conditions.push(eq(schema.fatwas.muftiId, c.req.query("mufti")!));

  const department = c.req.query("department");
  if (department) {
    const resolved = await resolveDepartment(db, department);
    conditions.push(
      inArray(
        schema.fatwas.id,
        db
          .select({ id: schema.fatwaDepartments.fatwaId })
          .from(schema.fatwaDepartments)
          .where(eq(schema.fatwaDepartments.departmentId, resolved.id)),
      ),
    );
  }

  /**
   * A fatwa is filed under departments, not tagged with topic keys, so a topic
   * filter here means the departments the topic covers — which is what the topic
   * page means by "rulings on this subject". It is deliberately the same tier
   * `?includeRelated=true` reaches for articles and questions, because that is the
   * only tier a fatwa has; a topic that covers no department matches nothing,
   * which is `inArray(col, [])`: drizzle renders it as `false`, not an empty set
   * of bounds.
   */
  const topic = c.req.query("topic");
  if (topic) {
    const filter = await resolveTopic(db, topic);
    conditions.push(
      inArray(
        schema.fatwas.id,
        db
          .select({ id: schema.fatwaDepartments.fatwaId })
          .from(schema.fatwaDepartments)
          .where(inArray(schema.fatwaDepartments.departmentId, filter.departmentIds)),
      ),
    );
  }

  if (page.q) {
    const like = `%${page.q}%`;
    conditions.push(
      or(
        sql`${schema.fatwas.questionBn} ilike ${like}`,
        sql`${schema.fatwas.rulingBn} ilike ${like}`,
        sql`array_to_string(${schema.fatwas.bodyBn}, ' ') ilike ${like}`,
      ),
    );
  }

  const where = and(...conditions.filter((condition): condition is SQL => Boolean(condition)));

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(schema.fatwas)
      .where(where)
      .orderBy(desc(schema.fatwas.pinned), desc(schema.fatwas.publishedAt))
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.fatwas)
      .where(where)
      .then((result) => result[0]?.value ?? 0),
  ]);

  const ids = rows.map((row) => row.id);
  const [departments, coSigners] = await Promise.all([
    fatwaDepartmentIds(db, ids),
    fatwaCoSignerIds(db, ids),
  ]);

  return c.json(
    listResponse(
      rows.map((row) =>
        toFatwa(row, departments.get(row.id) ?? [], coSigners.get(row.id) ?? []),
      ),
      total,
      page,
    ),
  );
});

contentRoutes.get("/fatwas/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");

  const [fatwa] = await db
    .select()
    .from(schema.fatwas)
    .where(or(eq(schema.fatwas.slug, slug), eq(schema.fatwas.id, slug)))
    .limit(1);

  if (!fatwa) throw notFound(`No fatwa "${slug}"`);

  const [departments, coSigners, references] = await Promise.all([
    fatwaDepartmentIds(db, [fatwa.id]),
    fatwaCoSignerIds(db, [fatwa.id]),
    db
      .select({ reference: schema.contentReferences })
      .from(schema.fatwaReferences)
      .innerJoin(
        schema.contentReferences,
        eq(schema.contentReferences.id, schema.fatwaReferences.referenceId),
      )
      .where(eq(schema.fatwaReferences.fatwaId, fatwa.id))
      .orderBy(schema.fatwaReferences.position),
  ]);

  return c.json({
    data: {
      fatwa: toFatwa(fatwa, departments.get(fatwa.id) ?? [], coSigners.get(fatwa.id) ?? []),
      references: references.map((row) => toReference(row.reference)),
    },
  });
});

/** The shared citation pool. */
contentRoutes.get("/references", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 50);

  const conditions: (SQL | undefined)[] = [];
  const kind = enumParam(url, "kind", ["ayah", "hadith"] as const);
  if (kind) conditions.push(eq(schema.contentReferences.kind, kind));

  if (page.q) {
    const like = `%${page.q}%`;
    conditions.push(
      or(
        sql`${schema.contentReferences.refBn} ilike ${like}`,
        sql`${schema.contentReferences.translationBn} ilike ${like}`,
        sql`${schema.contentReferences.ref} ilike ${like}`,
      ),
    );
  }

  const where = and(...conditions.filter((condition): condition is SQL => Boolean(condition)));

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(schema.contentReferences)
      .where(where)
      .orderBy(schema.contentReferences.id)
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.contentReferences)
      .where(where)
      .then((result) => result[0]?.value ?? 0),
  ]);

  return c.json(listResponse(rows.map(toReference), total, page));
});

contentRoutes.get("/references/:id", async (c) => {
  const db = c.get("db");
  const [row] = await db
    .select()
    .from(schema.contentReferences)
    .where(eq(schema.contentReferences.id, c.req.param("id")))
    .limit(1);

  if (!row) throw notFound(`No reference "${c.req.param("id")}"`);
  return c.json({ data: toReference(row) });
});
