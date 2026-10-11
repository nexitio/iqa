/**
 * Relation loaders.
 *
 * Every function here takes the parent ids a list endpoint already fetched and
 * returns a map, so a page of rows costs one extra query instead of one query
 * per row. They are deliberately dumb — a select and a group-by in JavaScript —
 * because a list route reads better when the shape of the join is visible.
 */

import { eq, inArray } from "drizzle-orm";
import type { ContentReference } from "@/lib/types";
import type { Database } from "./index.ts";
import { toReference } from "../present/dto.ts";
import * as schema from "./schema/index.ts";

export function group<K extends string, V extends string>(
  rows: { key: K; value: V }[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const row of rows) {
    const list = map.get(row.key);
    if (list) list.push(row.value);
    else map.set(row.key, [row.value]);
  }
  return map;
}

const empty = <T>() => new Map<string, T>();

export async function articleDepartmentIds(db: Database, ids: string[]) {
  if (ids.length === 0) return empty<string[]>();
  return group(
    await db
      .select({
        key: schema.articleDepartments.articleId,
        value: schema.articleDepartments.departmentId,
      })
      .from(schema.articleDepartments)
      .where(inArray(schema.articleDepartments.articleId, ids)),
  );
}

export async function fatwaDepartmentIds(db: Database, ids: string[]) {
  if (ids.length === 0) return empty<string[]>();
  return group(
    await db
      .select({
        key: schema.fatwaDepartments.fatwaId,
        value: schema.fatwaDepartments.departmentId,
      })
      .from(schema.fatwaDepartments)
      .where(inArray(schema.fatwaDepartments.fatwaId, ids)),
  );
}

export async function fatwaCoSignerIds(db: Database, ids: string[]) {
  if (ids.length === 0) return empty<string[]>();
  return group(
    await db
      .select({ key: schema.fatwaCosigners.fatwaId, value: schema.fatwaCosigners.userId })
      .from(schema.fatwaCosigners)
      .where(inArray(schema.fatwaCosigners.fatwaId, ids)),
  );
}

export async function questionDepartmentIds(db: Database, ids: string[]) {
  if (ids.length === 0) return empty<string[]>();
  return group(
    await db
      .select({
        key: schema.questionDepartments.questionId,
        value: schema.questionDepartments.departmentId,
      })
      .from(schema.questionDepartments)
      .where(inArray(schema.questionDepartments.questionId, ids)),
  );
}

export async function discussionDepartmentIds(db: Database, ids: string[]) {
  if (ids.length === 0) return empty<string[]>();
  return group(
    await db
      .select({
        key: schema.discussionDepartments.discussionId,
        value: schema.discussionDepartments.departmentId,
      })
      .from(schema.discussionDepartments)
      .where(inArray(schema.discussionDepartments.discussionId, ids)),
  );
}

/** scholar id → the departments they are filed under. */
export async function scholarDepartmentIds(db: Database, ids: string[]) {
  if (ids.length === 0) return empty<string[]>();
  return group(
    await db
      .select({
        key: schema.scholarDepartments.scholarId,
        value: schema.scholarDepartments.departmentId,
      })
      .from(schema.scholarDepartments)
      .where(inArray(schema.scholarDepartments.scholarId, ids)),
  );
}

/** department id → its scholars, for the directory pages. */
export async function departmentScholarIds(db: Database, ids: string[]) {
  if (ids.length === 0) return empty<string[]>();
  return group(
    await db
      .select({
        key: schema.scholarDepartments.departmentId,
        value: schema.scholarDepartments.scholarId,
      })
      .from(schema.scholarDepartments)
      .where(inArray(schema.scholarDepartments.departmentId, ids)),
  );
}

/** topic id → its department slugs. */
export async function topicDepartmentSlugs(db: Database, ids: string[]) {
  if (ids.length === 0) return empty<string[]>();
  return group(
    await db
      .select({
        key: schema.topicDepartments.topicId,
        value: schema.topicDepartments.departmentSlug,
      })
      .from(schema.topicDepartments)
      .where(inArray(schema.topicDepartments.topicId, ids)),
  );
}

/**
 * answer id → the citations attached to it, in the order the scholar added them.
 *
 * Assembled from three tables, so it is grouped in JavaScript rather than a
 * three-way join that would repeat the answer row once per citation.
 */
export async function answerReferences(
  db: Database,
  ids: string[],
): Promise<Map<string, ContentReference[]>> {
  if (ids.length === 0) return new Map();

  const rows = await db
    .select({
      answerId: schema.answerReferences.answerId,
      position: schema.answerReferences.position,
      reference: schema.contentReferences,
    })
    .from(schema.answerReferences)
    .innerJoin(
      schema.contentReferences,
      eq(schema.contentReferences.id, schema.answerReferences.referenceId),
    )
    .where(inArray(schema.answerReferences.answerId, ids));

  const collected = new Map<string, { position: number; reference: ContentReference }[]>();
  for (const row of rows) {
    const list = collected.get(row.answerId) ?? [];
    list.push({ position: row.position, reference: toReference(row.reference) });
    collected.set(row.answerId, list);
  }

  return new Map(
    [...collected].map(([answerId, list]) => [
      answerId,
      list.sort((a, b) => a.position - b.position).map((entry) => entry.reference),
    ]),
  );
}

export async function userFollowing(db: Database, userId: string) {
  const [scholars, departments] = await Promise.all([
    db
      .select({ scholarId: schema.userFollowingScholars.scholarId })
      .from(schema.userFollowingScholars)
      .where(eq(schema.userFollowingScholars.userId, userId)),
    db
      .select({ slug: schema.userFollowingDepartments.departmentSlug })
      .from(schema.userFollowingDepartments)
      .where(eq(schema.userFollowingDepartments.userId, userId)),
  ]);

  return {
    scholarIds: scholars.map((row) => row.scholarId),
    departmentSlugs: departments.map((row) => row.slug),
  };
}
