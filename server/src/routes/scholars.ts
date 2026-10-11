/**
 * Scholar routes.
 *
 * The directory answers the two questions a reader arrives with — who specialises
 * in this department, and who is available in my district. A profile adds the
 * long-form biography, which is the one row nothing else needs.
 */

import { and, asc, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import type { AppBindings } from "../context.ts";
import { answerReferences, questionDepartmentIds, scholarDepartmentIds } from "../db/relations.ts";
import * as schema from "../db/schema/index.ts";
import { notFound } from "../http/errors.ts";
import { listQuery, listResponse } from "../http/query.ts";
import {
  toAnswer,
  toArticle,
  toFatwa,
  toQuestion,
  toScholar,
  toScholarBiography,
} from "../present/dto.ts";
import { resolveDepartment } from "./filters.ts";

export const scholarsRoutes = new Hono<AppBindings>();

scholarsRoutes.get("/scholars", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 20);

  const conditions: (SQL | undefined)[] = [];
  if (c.req.query("district")) conditions.push(eq(schema.scholars.district, c.req.query("district")!));
  if (c.req.query("available") === "true") {
    conditions.push(eq(schema.scholars.availableForQuestions, true));
  }
  if (c.req.query("verified") === "true") conditions.push(eq(schema.scholars.verified, true));

  const department = c.req.query("department");
  if (department) {
    const resolved = await resolveDepartment(db, department);
    conditions.push(
      inArray(
        schema.scholars.id,
        db
          .select({ id: schema.scholarDepartments.scholarId })
          .from(schema.scholarDepartments)
          .where(eq(schema.scholarDepartments.departmentId, resolved.id)),
      ),
    );
  }

  if (page.q) {
    const like = `%${page.q}%`;
    conditions.push(
      or(
        sql`(${schema.scholars.name}->>'bn') ilike ${like}`,
        sql`(${schema.scholars.name}->>'en') ilike ${like}`,
        sql`(${schema.scholars.shortBio}->>'bn') ilike ${like}`,
      ),
    );
  }

  const where = and(...conditions.filter((condition): condition is SQL => Boolean(condition)));

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(schema.scholars)
      .where(where)
      .orderBy(desc(schema.scholars.verified), asc(schema.scholars.responseTimeHours))
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.scholars)
      .where(where)
      .then((result) => result[0]?.value ?? 0),
  ]);

  const departments = await scholarDepartmentIds(
    db,
    rows.map((row) => row.id),
  );

  return c.json(
    listResponse(
      rows.map((row) => toScholar(row, departments.get(row.id) ?? [])),
      total,
      page,
    ),
  );
});

/** One scholar: the profile, the biography, and their published work. */
scholarsRoutes.get("/scholars/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");

  const [scholar] = await db
    .select()
    .from(schema.scholars)
    .where(or(eq(schema.scholars.slug, slug), eq(schema.scholars.id, slug)))
    .limit(1);

  if (!scholar) throw notFound(`No scholar "${slug}"`);

  const [departments, biography, articles, fatwas, answerRows] = await Promise.all([
    scholarDepartmentIds(db, [scholar.id]),
    db
      .select()
      .from(schema.scholarBiographies)
      .where(eq(schema.scholarBiographies.scholarId, scholar.id))
      .limit(1),
    db
      .select()
      .from(schema.articles)
      .where(and(eq(schema.articles.authorId, scholar.id), eq(schema.articles.status, "published")))
      .orderBy(desc(schema.articles.publishedAt))
      .limit(10),
    db
      .select()
      .from(schema.fatwas)
      .where(and(eq(schema.fatwas.muftiId, scholar.id), eq(schema.fatwas.status, "published")))
      .orderBy(desc(schema.fatwas.publishedAt))
      .limit(10),
    db
      .select()
      .from(schema.answers)
      .where(eq(schema.answers.scholarId, scholar.id))
      .orderBy(desc(schema.answers.createdAt))
      .limit(10),
  ]);

  const references = await answerReferences(
    db,
    answerRows.map((row) => row.id),
  );

  // The questions this scholar answered, so the profile can show the pair.
  const questionIds = answerRows.map((row) => row.questionId);
  const [questionRows, questionDepartments] = await Promise.all([
    questionIds.length
      ? db.select().from(schema.questions).where(inArray(schema.questions.id, questionIds))
      : Promise.resolve([] as (typeof schema.questions.$inferSelect)[]),
    questionDepartmentIds(db, questionIds),
  ]);
  const questionsById = new Map(questionRows.map((row) => [row.id, row]));

  return c.json({
    data: {
      scholar: toScholar(scholar, departments.get(scholar.id) ?? []),
      biography: biography[0] ? toScholarBiography(biography[0]) : null,
      articles: articles.map((row) => toArticle(row, [])),
      fatwas: fatwas.map((row) => toFatwa(row, [], [])),
      answers: answerRows.map((row) => {
        const question = questionsById.get(row.questionId);
        return {
          answer: toAnswer(row, references.get(row.id) ?? []),
          question: question
            ? toQuestion(question, questionDepartments.get(question.id) ?? [])
            : null,
        };
      }),
    },
  });
});
