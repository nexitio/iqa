/**
 * Seed the database from the frontend's mock dataset.
 *
 * `src/lib/data` is the product's real editorial content: 44 topics, 15
 * departments, the Qur'an subset, 30 ahadith, duas, articles, fatwas, questions,
 * answers and the community threads. This script is the bridge from that
 * dataset to the schema, and it is deliberately strict: an id that does not
 * resolve is reported, never invented.
 *
 * Two normalisations are worth knowing about before reading the code:
 *
 * 1. Topic keys are authored tags, not foreign keys. The dataset tags content
 *    with topic slugs ("dowry"), and hadiths with department ids ("fiqh"). They
 *    are stored verbatim in `topic_ids` so the API and the frontend agree on
 *    what the row says.
 * 2. Article and fatwa citations are *recovered* from the body text with the
 *    same function the frontend uses (`citedReferences`), then stored as real
 *    links — so the relation becomes queryable instead of recomputed per reader.
 *
 * Re-running is safe: every table is truncated first, and the whole seed runs in
 * one transaction, so a failure leaves the previous data untouched.
 */

import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { hashPassword } from "../src/auth/password.ts";
import { encryptSecret } from "../src/social/crypto.ts";
import { createDatabase, createPool, type Database } from "../src/db/index.ts";
import * as schema from "../src/db/schema/index.ts";

import { citedReferences } from "../../src/app/(app)/_content/citations.ts";
import { DISTRICTS } from "../../src/lib/bn.ts";
import { ADMIN_USERS, PLATFORM_ACTIVITY, REPORTS, REVIEW_QUEUE, SCHOLAR_APPLICATIONS } from "../../src/lib/data/admin.ts";
import { DISCUSSIONS, DISCUSSION_REPLIES } from "../../src/lib/data/community.ts";
import { ARTICLES, FATWAS, REFERENCES } from "../../src/lib/data/content.ts";
import { DAILY_AYAH_REFS, DAILY_HADITH_IDS, DHIKR_ROUTINE, FOCUS_THEMES } from "../../src/lib/data/daily.ts";
import { DEPARTMENTS, TOPICS } from "../../src/lib/data/departments.ts";
import { DUAS, DUA_CATEGORIES } from "../../src/lib/data/duas.ts";
import { FEED, FEED_SECTIONS } from "../../src/lib/data/feed.ts";
import { HADITH_BOOKS, HADITH_COLLECTIONS, HADITHS } from "../../src/lib/data/hadith.ts";
import {
  BOOKMARK_COLLECTIONS,
  BOOKMARKS,
  CURRENT_USER,
  JOURNEYS,
  NOTIFICATIONS,
  READING_PROGRESS,
  USER_PROFILES,
  WEEKLY_LEARNING_MINUTES,
} from "../../src/lib/data/personal.ts";
import { ANSWERS, QUESTIONS } from "../../src/lib/data/questions.ts";
import { QURAN_AYAHS, QURAN_SURAHS } from "../../src/lib/data/quran.ts";
import { SCHOLAR_BIOGRAPHIES } from "../../src/lib/data/scholar-bios.ts";
import { SCHOLARS } from "../../src/lib/data/scholars.ts";
import type { ContentReference } from "../../src/lib/types.ts";

/** Ids the seed could not resolve, collected so they are reported, not hidden. */
const warnings: string[] = [];

function warn(message: string) {
  warnings.push(message);
}

/** The `topicIds` of a row, unchanged — the API serves these back verbatim. */
const topicKeys = (ids: string[] | undefined) => ids ?? [];

/** Resolve a department id-or-slug to its canonical id (the table's key). */
function departmentId(key: string): string | null {
  const match = DEPARTMENTS.find((d) => d.id === key || d.slug === key);
  if (!match) {
    warn(`department "${key}" does not exist in src/lib/data/departments`);
    return null;
  }
  return match.id;
}

/** Resolve a department id-or-slug to its slug (the value user follows are keyed by). */
function departmentSlug(key: string): string | null {
  const match = DEPARTMENTS.find((d) => d.id === key || d.slug === key);
  if (!match) {
    warn(`department "${key}" does not exist in src/lib/data/departments`);
    return null;
  }
  return match.slug;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function withoutNulls<T>(values: (T | null)[]): T[] {
  return values.filter((value): value is T => value !== null);
}

/** The transaction handle — every insert goes through it, so a failure writes nothing. */
type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

/** Drizzle needs one statement per value batch; keep parameter counts sane. */
async function insertAll<T extends PgTable>(
  db: Tx,
  table: T,
  rows: T["$inferInsert"][],
  chunkSize = 200,
): Promise<number> {
  for (let i = 0; i < rows.length; i += chunkSize) {
    await db.insert(table).values(rows.slice(i, i + chunkSize) as never);
  }
  return rows.length;
}

/* -------------------------------------------------------------------------- */
/* People                                                                     */
/* -------------------------------------------------------------------------- */

interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "scholar" | "user";
  avatarColor: string;
  district: string;
  joinedAt: string;
  scholarId: string | null;
  interests: string[];
  isVerified: boolean;
  status: "active" | "suspended" | "pending";
  contributions: number;
}

const AVATAR_FALLBACK = ["primary", "accent", "info", "success", "warning", "danger"];

/**
 * One account per person, merged from three places.
 *
 * `USER_PROFILES` + `CURRENT_USER` hold the real profile fields, `ADMIN_USERS`
 * adds account standing and the contribution counter, and any scholar the first
 * two do not cover gets an account too — a scholar is a user, and an answer
 * without an account to attribute it to would be a dangling row.
 */
function buildUsers(): SeedUser[] {
  const byId = new Map<string, SeedUser>();

  for (const user of [CURRENT_USER, ...USER_PROFILES]) {
    byId.set(user.id, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarColor: user.avatarColor,
      district: user.district,
      joinedAt: user.joinedAt,
      scholarId: user.scholarId ?? (user.role === "scholar" ? user.id : null),
      interests: user.interests ?? [],
      isVerified: user.isVerified,
      status: "active",
      contributions: 0,
    });
  }

  for (const row of ADMIN_USERS) {
    const existing = byId.get(row.id);
    if (existing) {
      existing.email = existing.email || row.email;
      existing.status = row.status;
      existing.contributions = row.contributions;
      continue;
    }
    byId.set(row.id, {
      id: row.id,
      name: row.nameBn,
      email: row.email,
      role: row.role,
      avatarColor: AVATAR_FALLBACK[byId.size % AVATAR_FALLBACK.length]!,
      district: row.district,
      joinedAt: row.joinedAt,
      scholarId: row.role === "scholar" ? row.id : null,
      interests: [],
      isVerified: row.role === "scholar",
      status: row.status,
      contributions: row.contributions,
    });
  }

  let placeholderEmails = 0;
  for (const scholar of SCHOLARS) {
    const existing = byId.get(scholar.id);
    if (existing) {
      existing.scholarId = scholar.id;
      continue;
    }
    // `email` is NOT NULL and the dataset has no address for this scholar. The
    // reserved .invalid TLD makes the placeholder unmistakable and unroutable.
    placeholderEmails += 1;
    byId.set(scholar.id, {
      id: scholar.id,
      // The user row has a single name field and no honourific column, so the
      // two are composed once here; the profile and the feed read the title
      // from the scholars row, which keeps it out of the name itself.
      name: `${scholar.honorific.bn} ${scholar.name.bn}`,
      email: `${scholar.slug}@seed.invalid`,
      role: "scholar",
      avatarColor: scholar.avatarColor,
      district: scholar.district,
      joinedAt: scholar.joinedAt,
      scholarId: scholar.id,
      interests: [],
      isVerified: scholar.verified,
      status: "active",
      contributions: scholar.stats.answers + scholar.stats.articles + scholar.stats.fatwas,
    });
  }

  if (placeholderEmails > 0) {
    warn(
      `${placeholderEmails} scholar(s) had no email in the dataset; seeded with @seed.invalid addresses`,
    );
  }
  return [...byId.values()];
}

/**
 * The two providers, configured but switched off.
 *
 * Everything provider-specific is a value here rather than a branch in the flow,
 * so these rows are the whole of what an admin edits — and the placeholders make
 * it obvious that a real client id has to be pasted in before anything works.
 * `enabled` stays false until then: an enabled provider with a placeholder secret
 * would send readers to a consent screen that cannot succeed.
 */
function buildSocialProviders(): (typeof schema.socialProviders)["$inferInsert"][] {
  const now = new Date().toISOString();
  const api = "http://localhost:8787/api/v1/auth/social";

  return [
    {
      id: "sp-facebook",
      slug: "facebook",
      // The sign-in button is labelled with this, and a brand name is not
      // translated — Google's own Bangla UI keeps it as "Google". So both
      // languages carry the brand spelling, and an admin renaming the row is
      // what renames the button.
      name: { bn: "Facebook", en: "Facebook" },
      enabled: false,
      clientId: "REPLACE-WITH-FACEBOOK-APP-ID",
      clientSecretEncrypted: encryptSecret("REPLACE-WITH-FACEBOOK-APP-SECRET"),
      redirectUri: `${api}/facebook/callback`,
      authorizationUrl: "https://www.facebook.com/v26.0/dialog/oauth",
      tokenUrl: "https://graph.facebook.com/v26.0/oauth/access_token",
      userinfoUrl: "https://graph.facebook.com/v26.0/me",
      extraAuthorizeParams: {},
      // The Graph API returns nothing it was not asked for, field by field.
      userinfoParams: { fields: "id,name,email,picture" },
      scopes: ["public_profile", "email"],
      // Facebook exchanges its code with a GET, and documents the proof parameter.
      tokenMethod: "get",
      clientAuth: "body",
      userinfoAuth: "query",
      sendAppSecretProof: true,
      claimSubject: "id",
      claimEmail: "email",
      claimName: "name",
      claimPicture: "picture.data.url",
      // Meta documents no claim that the address itself is confirmed, so a
      // Facebook sign-in never auto-links to an existing password account.
      claimEmailVerified: null,
      createdAt: now,
      updatedAt: now,
      updatedBy: null,
    },
    {
      id: "sp-google",
      slug: "google",
      name: { bn: "Google", en: "Google" },
      enabled: false,
      clientId: "REPLACE-WITH-GOOGLE-CLIENT-ID",
      clientSecretEncrypted: encryptSecret("REPLACE-WITH-GOOGLE-CLIENT-SECRET"),
      redirectUri: `${api}/google/callback`,
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userinfoUrl: "https://openidconnect.googleapis.com/v1/userinfo",
      extraAuthorizeParams: { prompt: "select_account" },
      userinfoParams: {},
      scopes: ["openid", "email", "profile"],
      tokenMethod: "post",
      clientAuth: "body",
      userinfoAuth: "bearer",
      sendAppSecretProof: false,
      claimSubject: "sub",
      claimEmail: "email",
      claimName: "name",
      claimPicture: "picture",
      claimEmailVerified: "email_verified",
      createdAt: now,
      updatedAt: now,
      updatedBy: null,
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Citations                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * The citation pool, plus any reference an answer carries that the pool does not.
 *
 * Answers attach their own `ContentReference` objects, which mostly are the
 * pool entries; a few are unique to the answer. Both end up in the pool so a
 * citation is never a dangling id.
 */
function buildReferences(): { rows: (typeof schema.contentReferences.$inferInsert)[]; ids: Set<string> } {
  const byId = new Map<string, ContentReference>();

  for (const reference of REFERENCES) byId.set(reference.id, reference);
  const poolSize = byId.size;

  for (const answer of ANSWERS) {
    for (const reference of answer.references) {
      if (!byId.has(reference.id)) byId.set(reference.id, reference);
    }
  }

  const extra = byId.size - poolSize;
  if (extra > 0) {
    warn(`${extra} answer-only citation(s) added to the pool (not in content.REFERENCES)`);
  }

  return {
    ids: new Set(byId.keys()),
    rows: [...byId.values()].map((reference) => ({
      id: reference.id,
      kind: reference.kind,
      ref: reference.ref,
      arabic: reference.arabic,
      translationBn: reference.translationBn,
      refBn: reference.refBn,
      note: reference.note ?? null,
    })),
  };
}

const referenceKey = (kind: string, ref: string) => `${kind}:${ref}`;

/* -------------------------------------------------------------------------- */
/* Seed                                                                       */
/* -------------------------------------------------------------------------- */

const pool = createPool();
const db = createDatabase(pool);
const counts: Record<string, number> = {};

/**
 * Every seeded account signs in with one password.
 *
 * The hashes are computed *before* the transaction opens: scrypt is deliberately
 * slow, and holding a database connection through forty of them would serialize
 * the seed for no reason.
 */
const seedPassword = process.env.ILM_SEED_PASSWORD ?? "ilm-dev-password";
const users = buildUsers();
const now = new Date().toISOString();
const credentials = await Promise.all(
  users.map(async (user) => ({
    userId: user.id,
    passwordHash: await hashPassword(seedPassword),
    createdAt: now,
    updatedAt: now,
  })),
);

try {
  await db.transaction(async (tx) => {
    /* --- truncate ---------------------------------------------------------- */
    const tables = await tx.execute<{ table_name: string }>(sql`
      select table_name from information_schema.tables
      where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name
    `);
    const list = tables.rows.map((r) => `"${r.table_name}"`).join(", ");
    if (list) await tx.execute(sql.raw(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`));

    /* --- social providers --------------------------------------------------- */
    counts.social_providers = await insertAll(tx, schema.socialProviders, buildSocialProviders());

    /* --- taxonomy ---------------------------------------------------------- */
    counts.districts = await insertAll(tx, schema.districts, DISTRICTS);
    counts.departments = await insertAll(tx, schema.departments, DEPARTMENTS);
    counts.topics = await insertAll(tx, schema.topics, TOPICS);
    counts.topic_departments = await insertAll(
      tx,
      schema.topicDepartments,
      TOPICS.flatMap((topic) =>
        withoutNulls(unique(topic.departmentSlugs).map(departmentSlug)).map((slug) => ({
          topicId: topic.id,
          departmentSlug: slug,
        })),
      ),
    );

    /* --- people ------------------------------------------------------------ */
    counts.users = await insertAll(tx, schema.users, users);
    counts.auth_credentials = await insertAll(tx, schema.authCredentials, credentials);

    counts.scholars = await insertAll(
      tx,
      schema.scholars,
      SCHOLARS.map((scholar) => ({
        id: scholar.id,
        slug: scholar.slug,
        name: scholar.name,
        honorific: scholar.honorific,
        avatarColor: scholar.avatarColor,
        shortBio: scholar.shortBio,
        bio: scholar.bio,
        primaryDepartmentId: departmentId(scholar.primaryDepartmentId) ?? DEPARTMENTS[0]!.id,
        specialization: scholar.specialization,
        languages: scholar.languages,
        credentials: scholar.credentials,
        madrasah: scholar.madrasah,
        district: scholar.district,
        verified: scholar.verified,
        availableForQuestions: scholar.availableForQuestions,
        responseTimeHours: scholar.responseTimeHours,
        rating: scholar.rating,
        stats: scholar.stats,
        joinedAt: scholar.joinedAt,
        fiqhFocus: scholar.fiqhFocus,
      })),
    );

    const scholarDepartmentLinks = new Set<string>();
    for (const scholar of SCHOLARS) {
      for (const key of unique([scholar.primaryDepartmentId, ...scholar.departmentIds])) {
        const id = departmentId(key);
        if (id) scholarDepartmentLinks.add(`${scholar.id}|${id}`);
      }
    }
    for (const department of DEPARTMENTS) {
      for (const scholarId of department.scholarIds) {
        if (!SCHOLARS.some((s) => s.id === scholarId)) {
          warn(`department ${department.slug} lists unknown scholar ${scholarId}`);
          continue;
        }
        scholarDepartmentLinks.add(`${scholarId}|${department.id}`);
      }
    }
    counts.scholar_departments = await insertAll(
      tx,
      schema.scholarDepartments,
      [...scholarDepartmentLinks].map((pair) => {
        const [scholarId, department] = pair.split("|") as [string, string];
        return { scholarId, departmentId: department };
      }),
    );

    const scholarIds = new Set(SCHOLARS.map((s) => s.id));
    counts.scholar_biographies = await insertAll(
      tx,
      schema.scholarBiographies,
      SCHOLAR_BIOGRAPHIES.filter((bio) => {
        if (scholarIds.has(bio.scholarId)) return true;
        warn(`biography for unknown scholar ${bio.scholarId}`);
        return false;
      }),
    );

    counts.user_following_scholars = await insertAll(tx, schema.userFollowingScholars, [
      ...new Map(
        [CURRENT_USER, ...USER_PROFILES].flatMap((user) =>
          (user.followingScholarIds ?? [])
            .filter((scholarId) => {
              if (scholarIds.has(scholarId)) return true;
              warn(`user ${user.id} follows unknown scholar ${scholarId}`);
              return false;
            })
            .map((scholarId) => [`${user.id}|${scholarId}`, { userId: user.id, scholarId }] as const),
        ),
      ).values(),
    ]);

    counts.user_following_departments = await insertAll(
      tx,
      schema.userFollowingDepartments,
      [
        ...new Map(
          [CURRENT_USER, ...USER_PROFILES].flatMap((user) =>
            withoutNulls(unique(user.followingDepartmentSlugs ?? []).map(departmentSlug)).map(
              (slug) => [`${user.id}|${slug}`, { userId: user.id, departmentSlug: slug }] as const,
            ),
          ),
        ).values(),
      ],
    );

    counts.scholar_applications = await insertAll(
      tx,
      schema.scholarApplications,
      SCHOLAR_APPLICATIONS,
    );

    /* --- citations --------------------------------------------------------- */
    const references = buildReferences();
    counts.content_references = await insertAll(tx, schema.contentReferences, references.rows);

    /** Map a citation's (kind, ref) to the pool row, so links never dangle. */
    const referenceIdByKey = new Map<string, string>();
    for (const row of references.rows) {
      const key = referenceKey(row.kind, row.ref);
      if (!referenceIdByKey.has(key)) referenceIdByKey.set(key, row.id);
    }
    /** Turn citations into link rows, dropping (and reporting) anything unknown. */
    const linkCitations = (citations: { kind: string; ref: string }[]) =>
      citations.flatMap((citation, position) => {
        const referenceId = referenceIdByKey.get(referenceKey(citation.kind, citation.ref));
        if (!referenceId) {
          warn(`citation ${citation.kind}:${citation.ref} is not in the pool`);
          return [];
        }
        return [{ referenceId, position }];
      });

    /* --- authored content -------------------------------------------------- */
    counts.articles = await insertAll(
      tx,
      schema.articles,
      ARTICLES.map((article) => ({
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        bodyBn: article.bodyBn,
        authorId: article.authorId,
        coverTone: article.coverTone,
        status: article.status,
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        readingMinutes: article.readingMinutes,
        viewCount: article.viewCount,
        bookmarkCount: article.bookmarkCount,
        likeCount: article.likeCount,
        commentCount: article.commentCount,
        referenceCount: article.referenceCount,
        topicIds: topicKeys(article.topicIds),
      })),
    );

    counts.article_departments = await insertAll(
      tx,
      schema.articleDepartments,
      ARTICLES.flatMap((article) =>
        withoutNulls(unique(article.departmentIds).map(departmentId)).map((id) => ({
          articleId: article.id,
          departmentId: id,
        })),
      ),
    );

    counts.article_references = await insertAll(
      tx,
      schema.articleReferences,
      ARTICLES.flatMap((article) =>
        linkCitations(citedReferences(article.bodyBn, article.referenceCount)).map((link) => ({
          articleId: article.id,
          ...link,
        })),
      ),
    );

    counts.fatwas = await insertAll(
      tx,
      schema.fatwas,
      FATWAS.map((fatwa) => ({
        id: fatwa.id,
        slug: fatwa.slug,
        questionBn: fatwa.questionBn,
        rulingBn: fatwa.rulingBn,
        bodyBn: fatwa.bodyBn,
        questionerDistrict: fatwa.questionerDistrict,
        muftiId: fatwa.muftiId,
        fiqh: fatwa.fiqh,
        status: fatwa.status,
        publishedAt: fatwa.publishedAt,
        referenceCount: fatwa.referenceCount,
        viewCount: fatwa.viewCount,
        bookmarkCount: fatwa.bookmarkCount,
        pinned: fatwa.pinned,
      })),
    );

    counts.fatwa_cosigners = await insertAll(
      tx,
      schema.fatwaCosigners,
      FATWAS.flatMap((fatwa) =>
        unique(fatwa.coSignerIds).map((userId) => ({ fatwaId: fatwa.id, userId })),
      ),
    );

    counts.fatwa_departments = await insertAll(
      tx,
      schema.fatwaDepartments,
      FATWAS.flatMap((fatwa) =>
        withoutNulls(unique(fatwa.departmentIds).map(departmentId)).map((id) => ({
          fatwaId: fatwa.id,
          departmentId: id,
        })),
      ),
    );

    counts.fatwa_references = await insertAll(
      tx,
      schema.fatwaReferences,
      FATWAS.flatMap((fatwa) =>
        linkCitations(citedReferences(fatwa.bodyBn, fatwa.referenceCount)).map((link) => ({
          fatwaId: fatwa.id,
          ...link,
        })),
      ),
    );

    /* --- Q&A --------------------------------------------------------------- */
    counts.questions = await insertAll(
      tx,
      schema.questions,
      QUESTIONS.map((question) => ({
        id: question.id,
        slug: question.slug,
        titleBn: question.titleBn,
        bodyBn: question.bodyBn,
        askerId: question.askerId,
        askerDistrict: question.askerDistrict,
        visibility: question.visibility,
        status: question.status,
        createdAt: question.createdAt,
        answeredAt: question.answeredAt ?? null,
        views: question.views,
        followerCount: question.followerCount,
        answerCount: question.answerCount,
        fatwaRequested: question.fatwaRequested,
        urgency: question.urgency,
        topicIds: topicKeys(question.topicIds),
      })),
    );

    counts.question_departments = await insertAll(
      tx,
      schema.questionDepartments,
      QUESTIONS.flatMap((question) =>
        withoutNulls(unique(question.departmentIds).map(departmentId)).map((id) => ({
          questionId: question.id,
          departmentId: id,
        })),
      ),
    );

    counts.answers = await insertAll(
      tx,
      schema.answers,
      ANSWERS.map((answer) => ({
        id: answer.id,
        questionId: answer.questionId,
        scholarId: answer.scholarId,
        bodyBn: answer.bodyBn,
        accepted: answer.accepted,
        createdAt: answer.createdAt,
        upvotes: answer.upvotes,
        downvotes: answer.downvotes,
        becameFatwaSlug: answer.becameFatwaSlug ?? null,
      })),
    );

    counts.answer_references = await insertAll(
      tx,
      schema.answerReferences,
      ANSWERS.flatMap((answer) =>
        linkCitations(answer.references).map((link) => ({ answerId: answer.id, ...link })),
      ),
    );

    /* --- community --------------------------------------------------------- */
    counts.discussions = await insertAll(
      tx,
      schema.discussions,
      DISCUSSIONS.map((discussion) => ({
        id: discussion.id,
        slug: discussion.slug,
        titleBn: discussion.titleBn,
        bodyBn: discussion.bodyBn,
        authorId: discussion.authorId,
        createdAt: discussion.createdAt,
        replyCount: discussion.replyCount,
        upvotes: discussion.upvotes,
        viewCount: discussion.viewCount,
        pinned: discussion.pinned,
        moderationState: discussion.moderationState,
        moderationNoteBn: discussion.moderationNoteBn ?? null,
        tags: discussion.tags ?? [],
        topicIds: topicKeys(discussion.topicIds),
      })),
    );

    const discussionIds = new Set(DISCUSSIONS.map((d) => d.id));
    counts.discussion_departments = await insertAll(
      tx,
      schema.discussionDepartments,
      DISCUSSIONS.flatMap((discussion) =>
        withoutNulls(unique(discussion.departmentIds).map(departmentId)).map((id) => ({
          discussionId: discussion.id,
          departmentId: id,
        })),
      ),
    );

    counts.discussion_replies = await insertAll(
      tx,
      schema.discussionReplies,
      DISCUSSION_REPLIES.filter((reply) => {
        if (discussionIds.has(reply.discussionId)) return true;
        warn(`reply ${reply.id} points at unknown discussion ${reply.discussionId}`);
        return false;
      }),
    );

    /* --- Qur'an and hadith ------------------------------------------------- */
    counts.quran_surahs = await insertAll(tx, schema.quranSurahs, QURAN_SURAHS);
    counts.quran_ayahs = await insertAll(tx, schema.quranAyahs, QURAN_AYAHS);
    counts.hadith_collections = await insertAll(tx, schema.hadithCollections, HADITH_COLLECTIONS);
    counts.hadith_books = await insertAll(tx, schema.hadithBooks, HADITH_BOOKS);
    counts.hadiths = await insertAll(
      tx,
      schema.hadiths,
      HADITHS.map((hadith) => ({
        id: hadith.id,
        collectionSlug: hadith.collectionSlug,
        collectionName: hadith.collectionName,
        bookNumber: hadith.bookNumber,
        bookName: hadith.bookName,
        number: hadith.number,
        refBn: hadith.refBn,
        refEn: hadith.refEn,
        arabic: hadith.arabic,
        translationBn: hadith.translationBn,
        translationEn: hadith.translationEn,
        narrator: hadith.narrator,
        grade: hadith.grade,
        lessonBn: hadith.lessonBn ?? null,
        topicIds: topicKeys(hadith.topicIds),
      })),
    );

    counts.dua_categories = await insertAll(tx, schema.duaCategories, DUA_CATEGORIES);
    counts.duas = await insertAll(
      tx,
      schema.duas,
      DUAS.map((dua) => ({
        id: dua.id,
        slug: dua.slug,
        categorySlug: dua.categorySlug,
        title: dua.title,
        arabic: dua.arabic,
        transliterationBn: dua.transliterationBn,
        meaning: dua.meaning,
        reference: dua.reference,
        occasion: dua.occasion,
        repeat: dua.repeat ?? null,
        virtue: dua.virtue ?? null,
        tags: dua.tags ?? [],
      })),
    );

    /* --- personal ---------------------------------------------------------- */
    // The mock library belongs to the signed-in reader; a real backend scopes it.
    const me = CURRENT_USER.id;
    const collectionIds = new Set(BOOKMARK_COLLECTIONS.map((c) => c.id));

    counts.bookmark_collections = await insertAll(
      tx,
      schema.bookmarkCollections,
      BOOKMARK_COLLECTIONS.map((collection) => ({
        id: collection.id,
        userId: me,
        nameBn: collection.nameBn,
        tone: collection.tone,
      })),
    );

    counts.bookmarks = await insertAll(
      tx,
      schema.bookmarks,
      BOOKMARKS.map((bookmark) => ({
        id: bookmark.id,
        userId: me,
        kind: bookmark.kind,
        titleBn: bookmark.titleBn,
        previewBn: bookmark.previewBn,
        refBn: bookmark.refBn,
        href: bookmark.href,
        savedAt: bookmark.savedAt,
        collectionId:
          bookmark.collectionId && collectionIds.has(bookmark.collectionId)
            ? bookmark.collectionId
            : null,
      })),
    );

    counts.reading_progress = await insertAll(
      tx,
      schema.readingProgress,
      READING_PROGRESS.map((progress) => ({ ...progress, userId: me })),
    );

    counts.journeys = await insertAll(tx, schema.journeys, JOURNEYS);

    counts.journey_enrollments = await insertAll(
      tx,
      schema.journeyEnrollments,
      JOURNEYS.filter((journey) => journey.completedDays > 0).map((journey) => ({
        userId: me,
        journeyId: journey.id,
        status: "active",
        completedDays: journey.completedDays,
        startedAt: new Date(Date.now() - journey.completedDays * 86_400_000).toISOString(),
      })),
    );

    counts.app_notifications = await insertAll(
      tx,
      schema.appNotifications,
      NOTIFICATIONS.map((notification) => ({ ...notification, userId: me })),
    );

    counts.feed_sections = await insertAll(tx, schema.feedSections, FEED_SECTIONS);
    counts.feed_items = await insertAll(tx, schema.feedItems, FEED);

    // The mock keeps one week as an array; index 6 is today, index 0 six days ago.
    const today = new Date();
    counts.learning_daily_minutes = await insertAll(
      tx,
      schema.learningDailyMinutes,
      WEEKLY_LEARNING_MINUTES.map((minutes, index) => {
        const day = new Date(today.getTime() - (WEEKLY_LEARNING_MINUTES.length - 1 - index) * 86_400_000);
        return { userId: me, day: day.toISOString().slice(0, 10), minutes };
      }),
    );

    counts.dhikr_items = await insertAll(tx, schema.dhikrItems, DHIKR_ROUTINE);
    counts.focus_themes = await insertAll(tx, schema.focusThemes, FOCUS_THEMES);

    counts.daily_highlights = await insertAll(tx, schema.dailyHighlights, [
      {
        id: "current",
        ayahRefs: DAILY_AYAH_REFS,
        hadithIds: DAILY_HADITH_IDS,
        updatedAt: new Date().toISOString(),
      },
    ]);

    /* --- moderation -------------------------------------------------------- */
    counts.content_reports = await insertAll(tx, schema.contentReports, REPORTS);
    counts.review_items = await insertAll(tx, schema.reviewItems, REVIEW_QUEUE);
    counts.platform_activity = await insertAll(tx, schema.platformActivity, PLATFORM_ACTIVITY);
  });

  console.log("\nseeded rows");
  for (const [table, count] of Object.entries(counts).sort()) {
    console.log(`${String(count).padStart(6)}  ${table}`);
  }
  console.log(`${String(Object.values(counts).reduce((a, b) => a + b, 0)).padStart(6)}  TOTAL`);

  if (warnings.length > 0) {
    console.log(`\n${warnings.length} dataset note(s):`);
    for (const message of warnings) console.log(`  - ${message}`);
  } else {
    console.log("\nevery id in the dataset resolved");
  }

  // Said out loud because a shared password in a database is a hazard the
  // moment the database is reachable by anyone else.
  console.log(
    `\nall ${users.length} seeded accounts can sign in with their email from src/lib/data` +
      `\nand the password from ILM_SEED_PASSWORD (currently: ${seedPassword}). Development only.`,
  );
  console.log(
    "\nsocial providers facebook and google are seeded disabled, with placeholder credentials." +
      "\nSet the real ones from the admin console (GET/PATCH /api/v1/admin/social-providers) and enable them.",
  );
} catch (error) {
  console.error("\nseed failed, transaction rolled back");
  throw error;
} finally {
  await pool.end();
}
