/**
 * Shared list filters.
 *
 * Every content list can be narrowed by `department` and `topic`. A topic filter
 * is resolved to the keys it should match — its slug *and* its id, because the
 * dataset tags content with either — plus the departments it covers, which is
 * the fallback tier the topic pages use.
 */

import { arrayOverlaps, eq, inArray, or, type SQL } from "drizzle-orm";
import type { PgColumn, PgTable } from "drizzle-orm/pg-core";
import type { Database } from "../db/index.ts";
import * as schema from "../db/schema/index.ts";
import { badRequest } from "../http/errors.ts";

export interface DepartmentFilter {
  id: string;
  slug: string;
}

export async function resolveDepartment(
  db: Database,
  value: string,
): Promise<DepartmentFilter> {
  const [row] = await db
    .select({ id: schema.departments.id, slug: schema.departments.slug })
    .from(schema.departments)
    .where(or(eq(schema.departments.slug, value), eq(schema.departments.id, value)))
    .limit(1);

  if (!row) throw badRequest(`No department "${value}"`);
  return row;
}

export interface TopicFilter {
  id: string;
  slug: string;
  /** `topic_ids` keys to match — the slug and the id. */
  keys: string[];
  /** Department ids whose content also counts as relevant. */
  departmentIds: string[];
}

export async function findTopic(db: Database, value: string): Promise<TopicFilter | null> {
  const [topic] = await db
    .select({ id: schema.topics.id, slug: schema.topics.slug })
    .from(schema.topics)
    .where(or(eq(schema.topics.slug, value), eq(schema.topics.id, value)))
    .limit(1);

  if (!topic) return null;

  const slugs = await db
    .select({ slug: schema.topicDepartments.departmentSlug })
    .from(schema.topicDepartments)
    .where(eq(schema.topicDepartments.topicId, topic.id));

  const departmentIds = slugs.length
    ? (
        await db
          .select({ id: schema.departments.id })
          .from(schema.departments)
          .where(inArray(schema.departments.slug, slugs.map((row) => row.slug)))
      ).map((row) => row.id)
    : [];

  return { id: topic.id, slug: topic.slug, keys: [topic.slug, topic.id], departmentIds };
}

/** `findTopic`, for a filter: an unknown value is a 400, not a 404. */
export async function resolveTopic(db: Database, value: string): Promise<TopicFilter> {
  const filter = await findTopic(db, value);
  if (!filter) throw badRequest(`No topic "${value}"`);
  return filter;
}

/**
 * Match a row by its authored tags, or by membership of one of the departments.
 *
 * Passing the columns in (rather than importing a table) is what lets the same
 * helper serve articles, questions and discussions, whose join tables differ.
 */
export function taggedOrInDepartment(options: {
  db: Database;
  keys: string[];
  departmentIds: string[];
  /**
   * Off by default: `?topic=dowry` means *tagged* dowry. The topic pages want
   * the wider set, so they pass `?includeRelated=true` (see `/topics/:slug`).
   */
  includeRelated?: boolean;
  /** e.g. `articles.topicIds` — a text[] column of any owning table. */
  topicIds: PgColumn;
  parentId: PgColumn;
  joinTable: PgTable;
  /** e.g. `articleDepartments.articleId` */
  childColumn: PgColumn;
  /** e.g. `articleDepartments.departmentId` */
  departmentColumn: PgColumn;
}): SQL | undefined {
  // arrayOverlaps, not a hand-written `&&`: node-postgres only serialises a JS
  // array correctly when the driver knows the parameter is an array.
  const tagMatch = arrayOverlaps(options.topicIds, options.keys);
  if (!options.includeRelated || options.departmentIds.length === 0) return tagMatch;

  const { db, joinTable, childColumn, departmentColumn, parentId } = options;
  return or(
    tagMatch,
    inArray(
      parentId,
      db
        .select({ id: childColumn })
        .from(joinTable)
        .where(inArray(departmentColumn, options.departmentIds)),
    ),
  );
}
