/**
 * Community. Threads are moderated, so the moderation state and the note behind
 * it live on the thread itself rather than in a separate audit surface the
 * reader would never see.
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
import { moderationStateEnum } from "./enums.ts";
import { users } from "./people.ts";
import { departments } from "./taxonomy.ts";
import { textArray } from "./columns.ts";

export const discussions = pgTable(
  "discussions",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    titleBn: text("title_bn").notNull(),
    bodyBn: text("body_bn").notNull(),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    /** Maintained counter; `discussion_replies` is the truth. */
    replyCount: integer("reply_count").notNull().default(0),
    upvotes: integer("upvotes").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    pinned: boolean("pinned").notNull().default(false),
    moderationState: moderationStateEnum("moderation_state").notNull().default("clean"),
    moderationNoteBn: text("moderation_note_bn"),
    tags: textArray("tags"),
    /** Authored topic keys — a mix of topic slugs and department slugs. */
    topicIds: textArray("topic_ids"),
  },
  (t) => [
    uniqueIndex("discussions_slug_key").on(t.slug),
    index("discussions_created_idx").on(t.createdAt),
    index("discussions_author_idx").on(t.authorId),
    index("discussions_pinned_idx").on(t.pinned),
    index("discussions_topic_ids_idx").using("gin", t.topicIds),
  ],
);

export const discussionDepartments = pgTable(
  "discussion_departments",
  {
    discussionId: text("discussion_id")
      .notNull()
      .references(() => discussions.id, { onDelete: "cascade" }),
    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.discussionId, t.departmentId] }),
    index("discussion_departments_department_idx").on(t.departmentId),
  ],
);

export const discussionReplies = pgTable(
  "discussion_replies",
  {
    id: text("id").primaryKey(),
    discussionId: text("discussion_id")
      .notNull()
      .references(() => discussions.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bodyBn: text("body_bn").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    upvotes: integer("upvotes").notNull().default(0),
    isScholarReply: boolean("is_scholar_reply").notNull().default(false),
    accepted: boolean("accepted").notNull().default(false),
  },
  (t) => [
    index("discussion_replies_discussion_idx").on(t.discussionId, t.createdAt),
    index("discussion_replies_author_idx").on(t.authorId),
  ],
);
