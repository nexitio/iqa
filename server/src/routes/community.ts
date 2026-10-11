/**
 * Community routes.
 *
 * Threads are readable by anyone; replying needs an account and a thread that is
 * not locked. Moderation state travels with the thread so a client never has to
 * guess whether its reply will be accepted.
 */

import { and, asc, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import { Hono } from "hono";
import { requireIdentity, type AppBindings } from "../context.ts";
import { discussionDepartmentIds } from "../db/relations.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest, forbidden, notFound } from "../http/errors.ts";
import { booleanParam, enumParam, listQuery, listResponse } from "../http/query.ts";
import { toDiscussion, toDiscussionReply } from "../present/dto.ts";
import { resolveDepartment, resolveTopic, taggedOrInDepartment } from "./filters.ts";

export const communityRoutes = new Hono<AppBindings>();

communityRoutes.get("/discussions", async (c) => {
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 12);

  const conditions: (SQL | undefined)[] = [];

  const moderation = enumParam(url, "moderation", [
    "clean",
    "under-review",
    "locked",
  ] as const);
  if (moderation) conditions.push(eq(schema.discussions.moderationState, moderation));

  if (c.req.query("author")) {
    conditions.push(eq(schema.discussions.authorId, c.req.query("author")!));
  }

  const department = c.req.query("department");
  if (department) {
    const resolved = await resolveDepartment(db, department);
    conditions.push(
      inArray(
        schema.discussions.id,
        db
          .select({ id: schema.discussionDepartments.discussionId })
          .from(schema.discussionDepartments)
          .where(eq(schema.discussionDepartments.departmentId, resolved.id)),
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
        topicIds: schema.discussions.topicIds,
        parentId: schema.discussions.id,
        joinTable: schema.discussionDepartments,
        childColumn: schema.discussionDepartments.discussionId,
        departmentColumn: schema.discussionDepartments.departmentId,
      }),
    );
  }

  if (page.q) {
    const like = `%${page.q}%`;
    conditions.push(
      or(
        sql`${schema.discussions.titleBn} ilike ${like}`,
        sql`${schema.discussions.bodyBn} ilike ${like}`,
      ),
    );
  }

  const where = and(...conditions.filter((condition): condition is SQL => Boolean(condition)));

  const [rows, total] = await Promise.all([
    db
      .select()
      .from(schema.discussions)
      .where(where)
      .orderBy(desc(schema.discussions.pinned), desc(schema.discussions.createdAt))
      .limit(page.limit)
      .offset(page.offset),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.discussions)
      .where(where)
      .then((result) => result[0]?.value ?? 0),
  ]);

  const departments = await discussionDepartmentIds(
    db,
    rows.map((row) => row.id),
  );

  return c.json(
    listResponse(
      rows.map((row) => toDiscussion(row, departments.get(row.id) ?? [])),
      total,
      page,
    ),
  );
});

communityRoutes.get("/discussions/:slug", async (c) => {
  const db = c.get("db");
  const slug = c.req.param("slug");

  const [discussion] = await db
    .select()
    .from(schema.discussions)
    .where(or(eq(schema.discussions.slug, slug), eq(schema.discussions.id, slug)))
    .limit(1);

  if (!discussion) throw notFound(`No discussion "${slug}"`);

  const [departments, replies] = await Promise.all([
    discussionDepartmentIds(db, [discussion.id]),
    db
      .select()
      .from(schema.discussionReplies)
      .where(eq(schema.discussionReplies.discussionId, discussion.id))
      .orderBy(desc(schema.discussionReplies.accepted), asc(schema.discussionReplies.createdAt)),
  ]);

  return c.json({
    data: {
      discussion: toDiscussion(discussion, departments.get(discussion.id) ?? []),
      replies: replies.map(toDiscussionReply),
    },
  });
});

/** Reply to a thread. Locked threads refuse replies, as the reader expects. */
communityRoutes.post("/discussions/:slug/replies", async (c) => {
  const identity = requireIdentity(c);
  const db = c.get("db");
  const slug = c.req.param("slug");

  const [discussion] = await db
    .select()
    .from(schema.discussions)
    .where(or(eq(schema.discussions.slug, slug), eq(schema.discussions.id, slug)))
    .limit(1);
  if (!discussion) throw notFound(`No discussion "${slug}"`);
  if (discussion.moderationState === "locked") {
    throw forbidden("This thread is locked");
  }

  const body = await c.req.json<{ bodyBn?: string }>();
  const bodyBn = body.bodyBn?.trim();
  if (!bodyBn || bodyBn.length < 2) throw badRequest("bodyBn is required");
  if (bodyBn.length > 4000) throw badRequest("bodyBn must be at most 4000 characters");

  const reply = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(schema.discussionReplies)
      .values({
        id: `rep-${Date.now().toString(36)}`,
        discussionId: discussion.id,
        authorId: identity.userId,
        bodyBn,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        isScholarReply: identity.role === "scholar",
        accepted: false,
      })
      .returning();

    await tx
      .update(schema.discussions)
      .set({ replyCount: discussion.replyCount + 1 })
      .where(eq(schema.discussions.id, discussion.id));

    return created!;
  });

  return c.json({ data: toDiscussionReply(reply) }, 201);
});
