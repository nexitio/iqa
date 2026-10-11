/**
 * Admin console.
 *
 * Everything here needs the admin role. The dashboard is *computed* from the
 * real tables at request time — no stored totals — so it can never disagree with
 * the content it summarises. Two mock fields have no honest source yet and are
 * documented as such below rather than filled with invented numbers.
 */

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { requireRole, type AppBindings } from "../context.ts";
import type { AdminOverview, ScholarDashboard } from "@/lib/types";
import * as schema from "../db/schema/index.ts";
import { listQuery, listResponse } from "../http/query.ts";
import {
  toActivityEntry,
  toAdminUserRow,
  toContentReport,
  toReviewItem,
  toScholarApplication,
} from "../present/dto.ts";

export const adminRoutes = new Hono<AppBindings>();

async function scalar(promise: Promise<{ value: number }[]>): Promise<number> {
  const rows = await promise;
  return rows[0]?.value ?? 0;
}

adminRoutes.get("/admin/overview", async (c) => {
  requireRole(c, "admin");
  const db = c.get("db");

  const [
    totalUsers,
    totalScholars,
    pendingScholarApplications,
    openQuestions,
    answeredQuestions,
    publishedFatwas,
    pendingReview,
    flaggedContent,
    surahs,
    ayahs,
    hadiths,
    duas,
  ] = await Promise.all([
    scalar(db.select({ value: sql<number>`count(*)::int` }).from(schema.users)),
    scalar(db.select({ value: sql<number>`count(*)::int` }).from(schema.scholars)),
    scalar(
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(schema.scholarApplications)
        .where(eq(schema.scholarApplications.status, "pending")),
    ),
    scalar(
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(schema.questions)
        .where(inArray(schema.questions.status, ["open", "routed"])),
    ),
    scalar(
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(schema.questions)
        .where(eq(schema.questions.status, "answered")),
    ),
    scalar(
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(schema.fatwas)
        .where(eq(schema.fatwas.status, "published")),
    ),
    scalar(
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(schema.reviewItems)
        .where(inArray(schema.reviewItems.status, ["pending", "in-review"])),
    ),
    scalar(
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(schema.contentReports)
        .where(eq(schema.contentReports.status, "pending")),
    ),
    scalar(db.select({ value: sql<number>`count(*)::int` }).from(schema.quranSurahs)),
    scalar(db.select({ value: sql<number>`count(*)::int` }).from(schema.quranAyahs)),
    scalar(db.select({ value: sql<number>`count(*)::int` }).from(schema.hadiths)),
    scalar(db.select({ value: sql<number>`count(*)::int` }).from(schema.duas)),
  ]);

  /**
   * The mock's dashboard also carried trend series and activity rates. Those
   * need an events table — one row per read, per day — which this schema does
   * not have yet, so they are reported empty instead of invented.
   */
  const overview: AdminOverview = {
    totalUsers,
    activeToday: 0,
    totalScholars,
    pendingScholarApplications,
    openQuestions,
    unansweredOver24h: 0,
    publishedFatwas,
    pendingReview,
    flaggedContent,
    quranReads7d: 0,
    dailyActiveTrend: [],
    questionsTrend: [],
    topDepartments: [],
    districtBreakdown: [],
  };

  return c.json({
    data: {
      overview,
      content: { surahs, ayahs, hadiths, duas, answeredQuestions },
      /** What the console can honestly compute today, listed so the gap is visible. */
      unavailable: ["activeToday", "unansweredOver24h", "quranReads7d", "dailyActiveTrend", "questionsTrend", "topDepartments", "districtBreakdown"],
    },
  });
});

adminRoutes.get("/admin/users", async (c) => {
  requireRole(c, "admin");
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 50);

  const role = c.req.query("role");
  const rows = await db
    .select()
    .from(schema.users)
    .where(role ? eq(schema.users.role, role as "user") : undefined)
    .orderBy(desc(schema.users.joinedAt))
    .limit(page.limit)
    .offset(page.offset);

  const total = await scalar(db.select({ value: sql<number>`count(*)::int` }).from(schema.users));

  return c.json(
    listResponse(
      rows.map((row) => toAdminUserRow(row, row.status)),
      total,
      page,
    ),
  );
});

adminRoutes.get("/admin/reports", async (c) => {
  requireRole(c, "admin");
  const db = c.get("db");
  const url = new URL(c.req.url);
  const page = listQuery(url, 50);

  const status = c.req.query("status");
  const rows = await db
    .select()
    .from(schema.contentReports)
    .where(status ? eq(schema.contentReports.status, status as "pending") : undefined)
    .orderBy(desc(schema.contentReports.reportedAt))
    .limit(page.limit)
    .offset(page.offset);

  const total = await scalar(
    db.select({ value: sql<number>`count(*)::int` }).from(schema.contentReports),
  );

  return c.json(listResponse(rows.map(toContentReport), total, page));
});

adminRoutes.get("/admin/review", async (c) => {
  requireRole(c, "admin");
  const db = c.get("db");

  const rows = await db
    .select()
    .from(schema.reviewItems)
    .orderBy(desc(schema.reviewItems.flaggedReferences), desc(schema.reviewItems.submittedAt));

  return c.json({ data: rows.map(toReviewItem) });
});

adminRoutes.get("/admin/activity", async (c) => {
  requireRole(c, "admin");
  const db = c.get("db");

  const rows = await db
    .select()
    .from(schema.platformActivity)
    .orderBy(desc(schema.platformActivity.at))
    .limit(50);

  return c.json({ data: rows.map(toActivityEntry) });
});

adminRoutes.get("/admin/applications", async (c) => {
  requireRole(c, "admin");
  const db = c.get("db");
  const status = c.req.query("status");

  const rows = await db
    .select()
    .from(schema.scholarApplications)
    .where(
      status ? eq(schema.scholarApplications.status, status as "pending") : undefined,
    )
    .orderBy(desc(schema.scholarApplications.submittedAt));

  return c.json({ data: rows.map(toScholarApplication) });
});

/** One scholar's console dashboard, computed from their own work. */
adminRoutes.get("/scholar/:id/dashboard", async (c) => {
  const identity = requireRole(c, "scholar", "admin");
  const db = c.get("db");
  const scholarId = c.req.param("id");

  if (identity.role === "scholar" && identity.userId !== scholarId) {
    return c.json({ error: { message: "Scholars may only read their own dashboard" } }, 403);
  }

  const [routedQuestions, answered, answers, followers, drafts] = await Promise.all([
    scalar(
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(schema.questions)
        .where(inArray(schema.questions.status, ["open", "routed"])),
    ),
    scalar(
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(schema.answers)
        .where(
          and(
            eq(schema.answers.scholarId, scholarId),
            sql`${schema.answers.createdAt} > now() - interval '7 days'`,
          ),
        ),
    ),
    db
      .select({ value: sql<number>`count(*)::int` })
      .from(schema.answers)
      .where(eq(schema.answers.scholarId, scholarId))
      .then((rows) => rows[0]?.value ?? 0),
    scalar(
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(schema.userFollowingScholars)
        .where(eq(schema.userFollowingScholars.scholarId, scholarId)),
    ),
    scalar(
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(schema.articles)
        .where(
          and(
            eq(schema.articles.authorId, scholarId),
            inArray(schema.articles.status, ["draft", "in-review", "changes-requested"]),
          ),
        ),
    ),
  ]);

  const dashboard: ScholarDashboard = {
    scholarId,
    routedQuestions,
    answeredThisWeek: answered,
    avgResponseHours: 0,
    helpfulRate: 0,
    totalViews: 0,
    newFollowers: followers,
    pendingDrafts: drafts,
    streakDays: 0,
    weeklyAnswers: [],
    topDepartments: [],
  };

  return c.json({
    data: {
      dashboard,
      totals: { answers },
      unavailable: ["avgResponseHours", "helpfulRate", "totalViews", "streakDays", "weeklyAnswers", "topDepartments"],
    },
  });
});
