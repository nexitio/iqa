/**
 * Postgres enums.
 *
 * One per closed set of values in `src/lib/types.ts`. Using a real enum rather
 * than text keeps the database as strict as the TypeScript model: a status the
 * frontend cannot render cannot be written in the first place.
 */

import { pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "scholar", "user"]);

/** The channels a second factor can use. */
export const mfaFactorKindEnum = pgEnum("mfa_factor_kind", ["passkey", "email", "sms"]);

/** Why a challenge was issued: proving an existing account, or adding a factor. */
export const mfaChallengePurposeEnum = pgEnum("mfa_challenge_purpose", ["login", "enroll"]);

/*
 * OAuth transport styles.
 *
 * These three are the axes providers actually disagree on, and they are columns
 * rather than code paths so that adding a provider is an admin form, not a
 * deployment: Facebook exchanges its code over GET with the secret in the query,
 * Google posts a form, and one sends the access token in a query parameter while
 * the other wants a bearer header.
 */
export const oauthTokenMethodEnum = pgEnum("oauth_token_method", ["get", "post"]);

export const oauthClientAuthEnum = pgEnum("oauth_client_auth", ["body", "basic"]);
export const oauthUserinfoAuthEnum = pgEnum("oauth_userinfo_auth", ["bearer", "query"]);

/** A provider redirect is either a sign-in attempt or a deliberate link. */
export const oauthStatePurposeEnum = pgEnum("oauth_state_purpose", ["login", "link"]);

/** Account standing shown in the admin user table. */
export const userStatusEnum = pgEnum("user_status", ["active", "suspended", "pending"]);

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "in-review",
  "published",
  "changes-requested",
]);

export const fatwaStatusEnum = pgEnum("fatwa_status", ["draft", "in-review", "published"]);

export const questionStatusEnum = pgEnum("question_status", [
  "open",
  "routed",
  "answered",
  "closed",
]);

export const questionVisibilityEnum = pgEnum("question_visibility", [
  "public",
  "anonymous",
  "private",
]);

export const urgencyEnum = pgEnum("urgency", ["normal", "urgent"]);

/** Where a surah was revealed. */
export const revelationPlaceEnum = pgEnum("revelation_place", ["meccan", "medinan"]);

export const hadithGradeEnum = pgEnum("hadith_grade", [
  "sahih",
  "hasan",
  "daif",
  "muttafaqun-alaih",
]);

/** What a citation points at. */
export const referenceKindEnum = pgEnum("reference_kind", ["ayah", "hadith"]);

/** The legal school a fatwa is issued within. */
export const fiqhEnum = pgEnum("fiqh", ["hanafi", "comparative"]);

/** Degrees of fiqh specialisation a scholar accepts questions within. */
export const fiqhFocusEnum = pgEnum("fiqh_focus", ["hanafi", "general", "usul", "comparative"]);

export const moderationStateEnum = pgEnum("moderation_state", [
  "clean",
  "under-review",
  "locked",
]);

export const bookmarkKindEnum = pgEnum("bookmark_kind", [
  "ayah",
  "hadith",
  "dua",
  "article",
  "fatwa",
  "answer",
  "question",
  "discussion",
]);

export const readingKindEnum = pgEnum("reading_kind", ["quran", "article", "hadith", "journey"]);

export const feedKindEnum = pgEnum("feed_kind", [
  "daily-ayah",
  "daily-hadith",
  "answer",
  "article",
  "fatwa",
  "discussion",
  "question",
  "journey",
]);

export const notificationKindEnum = pgEnum("notification_kind", [
  "answer",
  "mention",
  "follow",
  "reshare",
  "moderation",
  "daily",
  "journey",
  "system",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "pending",
  "approved",
  "rejected",
]);

export const reportTargetEnum = pgEnum("report_target", [
  "question",
  "answer",
  "article",
  "fatwa",
  "discussion",
  "comment",
]);

export const reportReasonEnum = pgEnum("report_reason", [
  "misinformation",
  "sectarian",
  "abuse",
  "spam",
  "off-topic",
  "copyright",
]);

export const reportSeverityEnum = pgEnum("report_severity", ["low", "medium", "high"]);

export const reportStatusEnum = pgEnum("report_status", ["pending", "resolved", "dismissed"]);

export const reviewKindEnum = pgEnum("review_kind", ["article", "fatwa"]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "in-review",
  "changes-requested",
]);

export const activityKindEnum = pgEnum("activity_kind", [
  "publish",
  "scholar",
  "moderation",
  "user",
  "system",
]);
