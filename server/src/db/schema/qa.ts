/**
 * Q&A: the question readers ask, the scholar answers that follow, and the
 * evidence each answer stands on.
 *
 * `answers.scholarId` points at `users` because a scholar *is* an account — the
 * `scholars` row only carries what the directory and the routing engine need.
 */

import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { textArray } from "./columns.ts";
import { contentReferences } from "./content.ts";
import { questionStatusEnum, questionVisibilityEnum, urgencyEnum } from "./enums.ts";
import { users } from "./people.ts";
import { departments } from "./taxonomy.ts";

export const questions = pgTable(
  "questions",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    titleBn: text("title_bn").notNull(),
    bodyBn: text("body_bn").notNull(),
    askerId: text("asker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    askerDistrict: text("asker_district").notNull(),
    visibility: questionVisibilityEnum("visibility").notNull().default("public"),
    status: questionStatusEnum("status").notNull().default("open"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    answeredAt: timestamp("answered_at", { withTimezone: true, mode: "string" }),
    views: integer("views").notNull().default(0),
    followerCount: integer("follower_count").notNull().default(0),
    /** Maintained counter; the answers table is the truth. */
    answerCount: integer("answer_count").notNull().default(0),
    /** Does the asker want a formal fatwa rather than a general answer? */
    fatwaRequested: boolean("fatwa_requested").notNull().default(false),
    urgency: urgencyEnum("urgency").notNull().default("normal"),
    /** Authored topic keys — slugs, matched exactly by the topic pages. */
    topicIds: textArray("topic_ids"),
  },
  (t) => [
    uniqueIndex("questions_slug_key").on(t.slug),
    index("questions_status_created_idx").on(t.status, t.createdAt),
    index("questions_asker_idx").on(t.askerId),
    index("questions_urgency_idx").on(t.urgency),
    index("questions_topic_ids_idx").using("gin", t.topicIds),
  ],
);

export const questionDepartments = pgTable(
  "question_departments",
  {
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.questionId, t.departmentId] }),
    index("question_departments_department_idx").on(t.departmentId),
  ],
);

export const answers = pgTable(
  "answers",
  {
    id: text("id").primaryKey(),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    scholarId: text("scholar_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    bodyBn: text("body_bn").notNull(),
    /** Marked by the asker as the accepted answer. */
    accepted: boolean("accepted").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    upvotes: integer("upvotes").notNull().default(0),
    downvotes: integer("downvotes").notNull().default(0),
    /** A scholar may escalate a general answer into a formal fatwa. */
    becameFatwaSlug: text("became_fatwa_slug"),
  },
  (t) => [
    index("answers_question_idx").on(t.questionId),
    index("answers_scholar_idx").on(t.scholarId),
    index("answers_accepted_idx").on(t.accepted),
  ],
);

export const answerReferences = pgTable(
  "answer_references",
  {
    answerId: text("answer_id")
      .notNull()
      .references(() => answers.id, { onDelete: "cascade" }),
    referenceId: text("reference_id")
      .notNull()
      .references(() => contentReferences.id, { onDelete: "cascade" }),
    /** Order the scholar attached them in. */
    position: integer("position").notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.answerId, t.referenceId] }),
    index("answer_references_reference_idx").on(t.referenceId),
  ],
);
