/**
 * Q&A routes.
 *
 * Reads are public: questions and the answers scholars gave them. Writes are
 * real but gated behind the development identity headers (see `context.ts`) —
 * asking a question needs an account, and answering one needs a scholar account,
 * exactly as it will once sessions exist.
 */

import { and, asc, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import { requireIdentity, requireRole, type AppBindings } from "../context.ts";
import type { Database } from "../db/index.ts";
import { answerReferences, questionDepartmentIds } from "../db/relations.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest, notFound } from "../http/errors.ts";
import { booleanParam, enumParam, listQuery, listResponse } from "../http/query.ts";
import { toAnswer, toQuestion } from "../present/dto.ts";
import { resolveDepartment, resolveTopic, taggedOrInDepartment } from "./filters.ts";

export const qaRoutes = new Hono<AppBindings>();

qaRoutes.get("/questions", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 12);

  const conditions: (SQL | undefined)[] = [];

  const status = enumParam(url, "status", ["open", "routed", "answered", "closed"] as const);
  if (status) conditions.push(eq(schema.questions.status, status));

  const urgency = enumParam(url, "urgency", ["normal", "urgent"] as const);
  if (urgency) conditions.push(eq(schema.questions.urgency, urgency));

  // Which questions asked for a formal ruling, so an index can count them without
  // pulling the whole archive back to tally it itself.
  const fatwaRequested = booleanParam(url, "fatwaRequested");
  if (fatwaRequested !== undefined) {
    conditions.push(eq(schema.questions.fatwaRequested, fatwaRequested));
  }

  // Anonymous and private questions are not public reading; without an identity
  // only public ones are listed.
  const identity = c.get("identity");
  conditions.push(
    identity?.role === "admin" || identity?.role === "scholar"
      ? or(
          eq(schema.questions.visibility, "public"),
          eq(schema.questions.visibility, "anonymous"),
          eq(schema.questions.askerId, identity.userId),
        )
      : eq(schema.questions.visibility, "public"),
  );

  if (c.req.query("asker")) conditions.push(eq(schema.questions.askerId, c.req.query("asker")!));
  if (c.req.query("answeredBy")) {
    conditions.push(
      inArray(
        schema.questions.id,
        db
          .select({ id: schema.answers.questionId })
          .from(schema.answers)
          .where(eq(schema.answers.scholarId, c.req.query("answeredBy")!)),
      ),
    );
  }

  const department = c.req.query("department");
  if (department) {
    const resolved = await resolveDepartment(db, department);
    conditions.push(
      inArray(
        schema.questions.id,
        db
          .select({ id: schema.questionDepartments.questionId })
          .from(schema.questionDepartments)
          .where(eq(schema.questionDepartments.departmentId, resolved.id)),
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
        topicIds: schema.questions.topicIds,
        parentId: schema.questions.id,
        joinTable: schema.questionDepartments,
        childColumn: schema.questionDepartments.questionId,
        departmentColumn: schema.questionDepartments.departmentId,
      }),
    );
  }

  if (page.q) {
    const like = `%${page.q}%`;
    conditions.push(
      or(sql`${schema.questions.titleBn} ilike ${like}`, sql`${schema.questions.bodyBn} ilike ${like}`),
    );
  }

  const where = and(...conditions.filter((condition): condition is SQL => Boolean(condition)));

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(schema.questions)
      .where(where)
      .orderBy(desc(schema.questions.urgency), desc(schema.questions.createdAt))
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.questions)
      .where(where)
      .then((result) => result[0]?.value ?? 0),
  ]);

  const departments = await questionDepartmentIds(
    db,
    rows.map((row) => row.id),
  );

  return c.json(
    listResponse(
      rows.map((row) => toQuestion(row, departments.get(row.id) ?? [])),
      total,
      page,
    ),
  );
});

qaRoutes.get("/questions/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");

  const [question] = await db
    .select()
    .from(schema.questions)
    .where(or(eq(schema.questions.slug, slug), eq(schema.questions.id, slug)))
    .limit(1);

  if (!question) throw notFound(`No question "${slug}"`);

  const identity = c.get("identity");
  const isStaff = identity?.role === "admin" || identity?.role === "scholar";
  const isAsker = identity?.userId === question.askerId;
  if (question.visibility === "private" && !isAsker && !isStaff) {
    throw notFound(`No question "${slug}"`);
  }

  const [departments, answerRows] = await Promise.all([
    questionDepartmentIds(db, [question.id]),
    db
      .select()
      .from(schema.answers)
      .where(eq(schema.answers.questionId, question.id))
      .orderBy(desc(schema.answers.accepted), desc(schema.answers.upvotes)),
  ]);

  const references = await answerReferences(
    db,
    answerRows.map((row) => row.id),
  );

  return c.json({
    data: {
      question: toQuestion(question, departments.get(question.id) ?? []),
      answers: answerRows.map((row) => toAnswer(row, references.get(row.id) ?? [])),
    },
  });
});

/** Every answer one scholar gave, so a profile can list them without N queries. */
qaRoutes.get("/answers", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 20);

  const conditions: (SQL | undefined)[] = [];
  if (c.req.query("scholar")) {
    conditions.push(eq(schema.answers.scholarId, c.req.query("scholar")!));
  }
  if (c.req.query("question")) {
    conditions.push(eq(schema.answers.questionId, c.req.query("question")!));
  }
  if (c.req.query("accepted")) {
    conditions.push(eq(schema.answers.accepted, c.req.query("accepted") !== "false"));
  }

  const where = and(...conditions.filter((condition): condition is SQL => Boolean(condition)));

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(schema.answers)
      .where(where)
      .orderBy(asc(schema.answers.createdAt))
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.answers)
      .where(where)
      .then((result) => result[0]?.value ?? 0),
  ]);

  const references = await answerReferences(
    db,
    rows.map((row) => row.id),
  );

  return c.json(
    listResponse(
      rows.map((row) => toAnswer(row, references.get(row.id) ?? [])),
      total,
      page,
    ),
  );
});

/**
 * Ask a question.
 *
 * The slug is derived from the title rather than accepted from the client, so
 * two questions with the same wording cannot collide on `/questions/:slug`.
 */
qaRoutes.post("/questions", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const body = await c.req.json<{
    titleBn?: string;
    bodyBn?: string;
    departmentIds?: string[];
    topicIds?: string[];
    district?: string;
    visibility?: "public" | "anonymous" | "private";
    fatwaRequested?: boolean;
    urgency?: "normal" | "urgent";
  }>();

  const titleBn = body.titleBn?.trim();
  const bodyBn = body.bodyBn?.trim();
  if (!titleBn || titleBn.length < 10) {
    throw badRequest("titleBn must be at least 10 characters");
  }
  if (!bodyBn || bodyBn.length < 20) {
    throw badRequest("bodyBn must be at least 20 characters");
  }

  const visibility = body.visibility ?? "public";
  if (!["public", "anonymous", "private"].includes(visibility)) {
    throw badRequest("visibility must be public, anonymous or private");
  }

  const [asker] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, identity.userId))
    .limit(1);
  if (!asker) throw badRequest(`Unknown user "${identity.userId}"`);

  const slug = await uniqueQuestionSlug(db, titleBn);
  const departmentIds = (body.departmentIds ?? []).slice(0, 8);

  const [created] = await db
    .insert(schema.questions)
    .values({
      id: `q-${Date.now().toString(36)}`,
      slug,
      titleBn,
      bodyBn,
      askerId: identity.userId,
      askerDistrict: body.district?.trim() || asker.district,
      visibility,
      status: "open",
      createdAt: new Date().toISOString(),
      views: 0,
      followerCount: 0,
      answerCount: 0,
      fatwaRequested: body.fatwaRequested ?? false,
      urgency: body.urgency ?? "normal",
      topicIds: (body.topicIds ?? []).slice(0, 8),
    })
    .returning();

  if (departmentIds.length > 0) {
    await db
      .insert(schema.questionDepartments)
      .values(departmentIds.map((departmentId) => ({ questionId: created!.id, departmentId })));
  }

  return c.json({ data: toQuestion(created!, departmentIds) }, 201);
});

/**
 * A scholar answers a question.
 *
 * The maintained `answerCount` on the question is updated in the same
 * transaction, so the index never disagrees with the answers table.
 */
qaRoutes.post("/questions/:slug/answers", async (c) => {
  const identity = requireRole(c, "scholar", "admin");
  const db = c.get("db");
  const slug = c.req.param("slug");

  const [question] = await db
    .select()
    .from(schema.questions)
    .where(or(eq(schema.questions.slug, slug), eq(schema.questions.id, slug)))
    .limit(1);
  if (!question) throw notFound(`No question "${slug}"`);

  const body = await c.req.json<{ bodyBn?: string; referenceIds?: string[] }>();
  const bodyBn = body.bodyBn?.trim();
  if (!bodyBn || bodyBn.length < 20) {
    throw badRequest("bodyBn must be at least 20 characters");
  }

  const referenceIds = (body.referenceIds ?? []).slice(0, 20);
  const now = new Date().toISOString();

  const answer = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(schema.answers)
      .values({
        id: `a-${Date.now().toString(36)}`,
        questionId: question.id,
        scholarId: identity.userId,
        bodyBn,
        accepted: false,
        createdAt: now,
        upvotes: 0,
        downvotes: 0,
      })
      .returning();

    if (referenceIds.length > 0) {
      await tx
        .insert(schema.answerReferences)
        .values(
          referenceIds.map((referenceId, position) => ({
            answerId: created!.id,
            referenceId,
            position,
          })),
        );
    }

    await tx
      .update(schema.questions)
      .set({
        answerCount: question.answerCount + 1,
        status: "answered",
        answeredAt: question.answeredAt ?? now,
      })
      .where(eq(schema.questions.id, question.id));

    return created!;
  });

  const references = await answerReferences(db, [answer.id]);
  return c.json({ data: toAnswer(answer, references.get(answer.id) ?? []) }, 201);
});

/** A URL-safe slug from the Bangla title, with a numeric suffix when taken. */
async function uniqueQuestionSlug(db: Database, titleBn: string): Promise<string> {
  const base =
    titleBn
      .toLowerCase()
      .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "question";

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const [existing] = await db
      .select({ id: schema.questions.id })
      .from(schema.questions)
      .where(eq(schema.questions.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}
