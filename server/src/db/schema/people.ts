/**
 * People: accounts, scholars, the follow graph between them, and the long-form
 * biography only a profile page asks for.
 *
 * `users` is one table for all three roles. A scholar is an account with a
 * `scholarId`; the `scholars` row carries what the app routes on (departments,
 * availability, statistics) while `scholar_biographies` carries the prose.
 */

import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import type { BioAward, BioIjazah, BioService, BioStudent, BioTeacher, BioWork, Credential, Scholar } from "@/lib/types";
import { localized, localizedList, textArray } from "./columns.ts";
import { applicationStatusEnum, fiqhFocusEnum, roleEnum, userStatusEnum } from "./enums.ts";
import { departments } from "./taxonomy.ts";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: roleEnum("role").notNull().default("user"),
    avatarColor: text("avatar_color").notNull(),
    district: text("district").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "string" }).notNull(),
    /** Set when this account also has a scholar profile. */
    scholarId: text("scholar_id"),
    interests: textArray("interests"),
    isVerified: boolean("is_verified").notNull().default(false),
    status: userStatusEnum("status").notNull().default("active"),
    /**
     * Denormalised counter behind the admin user table. The write routes
     * increment it when a contribution is published.
     */
    contributions: integer("contributions").notNull().default(0),
  },
  (t) => [
    uniqueIndex("users_email_key").on(t.email),
    index("users_role_idx").on(t.role),
    index("users_district_idx").on(t.district),
  ],
);

export const userFollowingScholars = pgTable(
  "user_following_scholars",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scholarId: text("scholar_id")
      .notNull()
      .references(() => scholars.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.scholarId] }),
    index("user_following_scholars_scholar_idx").on(t.scholarId),
  ],
);

export const userFollowingDepartments = pgTable(
  "user_following_departments",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    departmentSlug: text("department_slug")
      .notNull()
      .references(() => departments.slug, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.departmentSlug] }),
    index("user_following_departments_slug_idx").on(t.departmentSlug),
  ],
);

export const scholars = pgTable(
  "scholars",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: localized("name"),
    /** Honorific: মুফতি / মুহাদ্দিস / ড. */
    honorific: localized("honorific"),
    avatarColor: text("avatar_color").notNull(),
    shortBio: localized("short_bio"),
    bio: localized("bio"),
    primaryDepartmentId: text("primary_department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "restrict" }),
    specialization: localizedList("specialization"),
    languages: textArray("languages"),
    credentials: jsonb("credentials").$type<Credential[]>().notNull().default([]),
    madrasah: localized("madrasah"),
    district: text("district").notNull(),
    verified: boolean("verified").notNull().default(false),
    availableForQuestions: boolean("available_for_questions").notNull().default(true),
    /** Median first-response time, hours — powers "usually replies in". */
    responseTimeHours: doublePrecision("response_time_hours").notNull().default(0),
    rating: doublePrecision("rating").notNull().default(0),
    stats: jsonb("stats").$type<Scholar["stats"]>().notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true, mode: "string" }).notNull(),
    fiqhFocus: fiqhFocusEnum("fiqh_focus").array().notNull().default([]),
  },
  (t) => [
    uniqueIndex("scholars_slug_key").on(t.slug),
    index("scholars_district_idx").on(t.district),
    index("scholars_primary_department_idx").on(t.primaryDepartmentId),
    index("scholars_available_idx").on(t.availableForQuestions),
  ],
);

/** Which departments a scholar is filed under (also the reverse of that view). */
export const scholarDepartments = pgTable(
  "scholar_departments",
  {
    scholarId: text("scholar_id")
      .notNull()
      .references(() => scholars.id, { onDelete: "cascade" }),
    departmentId: text("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.scholarId, t.departmentId] }),
    index("scholar_departments_department_idx").on(t.departmentId),
  ],
);

export const scholarBiographies = pgTable("scholar_biographies", {
  scholarId: text("scholar_id")
    .primaryKey()
    .references(() => scholars.id, { onDelete: "cascade" }),
  born: localized("born"),
  family: localized("family"),
  /** Paragraphs separated by a blank line. */
  narrative: localized("narrative"),
  now: localized("now"),
  teachers: jsonb("teachers").$type<BioTeacher[]>().notNull().default([]),
  ijazah: jsonb("ijazah").$type<BioIjazah[]>().notNull().default([]),
  service: jsonb("service").$type<BioService[]>().notNull().default([]),
  works: jsonb("works").$type<BioWork[]>().notNull().default([]),
  students: jsonb("students").$type<BioStudent[]>().notNull().default([]),
  awards: jsonb("awards").$type<BioAward[]>().notNull().default([]),
  sources: localizedList("sources"),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull(),
});

/** An application to join the scholar panel, before it becomes a `scholars` row. */
export const scholarApplications = pgTable(
  "scholar_applications",
  {
    id: text("id").primaryKey(),
    nameBn: text("name_bn").notNull(),
    nameEn: text("name_en").notNull(),
    madrasahBn: text("madrasah_bn").notNull(),
    district: text("district").notNull(),
    departments: textArray("departments"),
    credentialsBn: textArray("credentials_bn"),
    submittedAt: timestamp("submitted_at", { withTimezone: true, mode: "string" }).notNull(),
    status: applicationStatusEnum("status").notNull().default("pending"),
    experienceYears: integer("experience_years").notNull().default(0),
    email: text("email").notNull(),
  },
  (t) => [index("scholar_applications_status_idx").on(t.status)],
);