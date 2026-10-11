/**
 * Taxonomy routes: departments, topics and districts.
 *
 * These are small, fixed collections (15 / 44 / 16), so they come back whole
 * rather than paginated — `{ data: [...] }`, no envelope.
 *
 * `/topics/:slug` returns the topic together with the two keys the client needs
 * to fetch its content: the `tagKeys` the dataset tags rows with, and the
 * `departmentSlugs` that act as the fallback tier. The list routes then answer
 * the question itself — `/articles?topic=dowry`, `/questions?topic=dowry` — and
 * their `total` is the count.
 */

import { asc, desc, eq, or, sql } from "drizzle-orm";
import { Hono } from "hono";
import type { AppBindings } from "../context.ts";
import { departmentScholarIds, scholarDepartmentIds, topicDepartmentSlugs } from "../db/relations.ts";
import * as schema from "../db/schema/index.ts";
import { notFound } from "../http/errors.ts";
import { listQuery } from "../http/query.ts";
import { toDepartment, toDistrict, toScholar, toTopic } from "../present/dto.ts";
import { findTopic } from "./filters.ts";

export const taxonomyRoutes = new Hono<AppBindings>();

taxonomyRoutes.get("/departments", async (c) => {
  const db = c.get("db");
  const rows = await db
    .select()
    .from(schema.departments)
    .orderBy(desc(schema.departments.trending), asc(schema.departments.slug));

  const scholars = await departmentScholarIds(
    db,
    rows.map((row) => row.id),
  );

  return c.json({
    data: rows.map((row) => toDepartment(row, scholars.get(row.id) ?? [])),
  });
});

taxonomyRoutes.get("/departments/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");

  const [department] = await db
    .select()
    .from(schema.departments)
    .where(or(eq(schema.departments.slug, slug), eq(schema.departments.id, slug)))
    .limit(1);

  if (!department) throw notFound(`No department "${slug}"`);

  const scholarRows = (
    await db
      .select({ scholar: schema.scholars })
      .from(schema.scholarDepartments)
      .innerJoin(schema.scholars, eq(schema.scholars.id, schema.scholarDepartments.scholarId))
      .where(eq(schema.scholarDepartments.departmentId, department.id))
  ).map((row) => row.scholar);

  const [scholarDepartments, topicRows] = await Promise.all([
    scholarDepartmentIds(
      db,
      scholarRows.map((row) => row.id),
    ),
    db
      .select({ topic: schema.topics })
      .from(schema.topicDepartments)
      .innerJoin(schema.topics, eq(schema.topics.id, schema.topicDepartments.topicId))
      .where(eq(schema.topicDepartments.departmentSlug, department.slug)),
  ]);

  const topicSlugs = await topicDepartmentSlugs(
    db,
    topicRows.map((row) => row.topic.id),
  );

  return c.json({
    data: {
      department: toDepartment(
        department,
        scholarRows.map((row) => row.id),
      ),
      scholars: scholarRows.map((row) => toScholar(row, scholarDepartments.get(row.id) ?? [])),
      topics: topicRows.map((row) => toTopic(row.topic, topicSlugs.get(row.topic.id) ?? [])),
    },
  });
});

taxonomyRoutes.get("/topics", async (c) => {
  const db = c.get("db");
  const { q } = listQuery(new URL(c.req.url), 100);
  const trending = c.req.query("trending");

  const rows = await db
    .select()
    .from(schema.topics)
    .where(
      q
        ? sql`(${schema.topics.name}->>'bn') ilike ${`%${q}%`}
              or (${schema.topics.name}->>'en') ilike ${`%${q}%`}
              or ${schema.topics.slug} ilike ${`%${q}%`}`
        : trending === undefined
          ? undefined
          : eq(schema.topics.trending, trending !== "false"),
    )
    .orderBy(desc(schema.topics.trending), desc(schema.topics.contentCount));

  const departments = await topicDepartmentSlugs(
    db,
    rows.map((row) => row.id),
  );

  return c.json({
    data: rows.map((row) => toTopic(row, departments.get(row.id) ?? [])),
  });
});

taxonomyRoutes.get("/topics/:slug", async (c) => {
  const db = c.get("db");
  // A missing topic here is a missing resource (404), unlike an unknown
  // `?topic=` filter value, which is a 400.
  const filter = await findTopic(db, c.req.param("slug"));
  if (!filter) throw notFound(`No topic "${c.req.param("slug")}"`);

  const [topic] = await db
    .select()
    .from(schema.topics)
    .where(eq(schema.topics.id, filter.id))
    .limit(1);

  if (!topic) throw notFound(`No topic "${c.req.param("slug")}"`);

  const departmentSlugs = (await topicDepartmentSlugs(db, [topic.id])).get(topic.id) ?? [];

  return c.json({
    data: {
      topic: toTopic(topic, departmentSlugs),
      /** Keys to send back as `?topic=<key>` on the list routes. */
      tagKeys: filter.keys,
      departmentSlugs,
    },
  });
});

taxonomyRoutes.get("/districts", async (c) => {
  const db = c.get("db");
  const rows = await db.select().from(schema.districts).orderBy(asc(schema.districts.id));
  return c.json({ data: rows.map(toDistrict) });
});
