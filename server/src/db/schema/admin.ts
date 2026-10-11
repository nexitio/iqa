/**
 * Moderation and audit.
 *
 * The admin console also shows aggregate dashboards; those are computed from
 * the real tables at request time (`GET /api/v1/admin/overview`) rather than
 * stored, so nothing here duplicates a number that can be counted.
 */

import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
  activityKindEnum,
  reportReasonEnum,
  reportSeverityEnum,
  reportStatusEnum,
  reportTargetEnum,
  reviewKindEnum,
  reviewStatusEnum,
} from "./enums.ts";
import { textArray } from "./columns.ts";
import { users } from "./people.ts";

/** A reader's report against a question, answer, article, fatwa or comment. */
export const contentReports = pgTable(
  "content_reports",
  {
    id: text("id").primaryKey(),
    contentType: reportTargetEnum("content_type").notNull(),
    contentTitleBn: text("content_title_bn").notNull(),
    contentHref: text("content_href").notNull(),
    reason: reportReasonEnum("reason").notNull(),
    reasonLabelBn: text("reason_label_bn").notNull(),
    reportedByBn: text("reported_by_bn").notNull(),
    reportedAt: timestamp("reported_at", { withTimezone: true, mode: "string" }).notNull(),
    severity: reportSeverityEnum("severity").notNull().default("low"),
    status: reportStatusEnum("status").notNull().default("pending"),
    /** The moderator who picked it up, by display name. */
    assignedToBn: text("assigned_to_bn"),
  },
  (t) => [
    index("content_reports_status_severity_idx").on(t.status, t.severity),
    index("content_reports_reported_at_idx").on(t.reportedAt),
  ],
);

/** A draft waiting on the review board. */
export const reviewItems = pgTable(
  "review_items",
  {
    id: text("id").primaryKey(),
    kind: reviewKindEnum("kind").notNull(),
    titleBn: text("title_bn").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Snapshotted display name so the board renders without a join. */
    authorNameBn: text("author_name_bn").notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "string" }).notNull(),
    departments: textArray("departments"),
    referenceCount: integer("reference_count").notNull().default(0),
    wordCount: integer("word_count").notNull().default(0),
    status: reviewStatusEnum("status").notNull().default("pending"),
    /** References a reviewer flagged as weak or wrongly attributed. */
    flaggedReferences: integer("flagged_references").notNull().default(0),
  },
  (t) => [index("review_items_status_idx").on(t.status, t.submittedAt)],
);

/** The platform activity log behind the admin audit feed. */
export const platformActivity = pgTable(
  "platform_activity",
  {
    id: text("id").primaryKey(),
    actorBn: text("actor_bn").notNull(),
    actionBn: text("action_bn").notNull(),
    targetBn: text("target_bn").notNull(),
    at: timestamp("at", { withTimezone: true, mode: "string" }).notNull(),
    kind: activityKindEnum("kind").notNull(),
  },
  (t) => [index("platform_activity_at_idx").on(t.at)],
);