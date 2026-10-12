/**
 * HTTP acceptance test.
 *
 * Runs against a *running* server (default http://127.0.0.1:8787) and checks the
 * things a unit test cannot: that routes are mounted, that the joins actually
 * produce the arrays the frontend types promise, and that the guarded writes
 * refuse the wrong caller.
 *
 * It writes: one account, one question, one answer, one reply, one bookmark, and
 * signs in as three seeded accounts. Re-run `pnpm --filter @ilm/server db:seed`
 * afterwards to return to a pristine dataset.
 *
 *     node --experimental-strip-types server/scripts/smoke.ts
 *     SMOKE_BASE_URL=http://127.0.0.1:8787 pnpm --filter @ilm/server smoke
 */

// Loads `server/.env` before any of the constants below read it. Without it the
// seeded password silently fell back to the placeholder, so every sign-in this
// suite makes was refused even though the seed had hashed the configured one.
import "../src/env.ts";
import { createHash, generateKeyPairSync, randomBytes, sign } from "node:crypto";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { encodeCBOR, type CBORType } from "@levischuck/tiny-cbor";
import { ARTICLES, FATWAS } from "../../src/lib/data/content.ts";
import { DEPARTMENTS, TOPICS } from "../../src/lib/data/departments.ts";
import { DISCUSSIONS } from "../../src/lib/data/community.ts";
import { DUAS, DUA_CATEGORIES } from "../../src/lib/data/duas.ts";
import { HADITH_COLLECTIONS, HADITHS } from "../../src/lib/data/hadith.ts";
import { QURAN_AYAHS, QURAN_SURAHS } from "../../src/lib/data/quran.ts";
import { QUESTIONS } from "../../src/lib/data/questions.ts";
import { SCHOLARS } from "../../src/lib/data/scholars.ts";
import { ADMIN_USERS, REPORTS, SCHOLAR_APPLICATIONS } from "../../src/lib/data/admin.ts";
import { CURRENT_USER, BOOKMARK_COLLECTIONS, BOOKMARKS, NOTIFICATIONS } from "../../src/lib/data/personal.ts";
import { DISTRICTS } from "../../src/lib/bn.ts";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:8787";

/**
 * The expectations are derived from the dataset the seed read, so this test
 * says "the API agrees with the source data" rather than "the API agrees with
 * whatever I typed here last time".
 */
const expected = {
  publishedArticles: ARTICLES.filter((row) => row.status === "published").length,
  publishedFatwas: FATWAS.filter((row) => row.status === "published").length,
  publicQuestions: QUESTIONS.filter((row) => row.visibility === "public").length,
  articles: ARTICLES.length,
  fatwas: FATWAS.length,
  questions: QUESTIONS.length,
  discussions: DISCUSSIONS.length,
  duas: DUAS.length,
  duaCategories: DUA_CATEGORIES.length,
  hadiths: HADITHS.length,
  collections: HADITH_COLLECTIONS.length,
  surahs: QURAN_SURAHS.length,
  ayahs: QURAN_AYAHS.length,
  scholars: SCHOLARS.length,
  departments: DEPARTMENTS.length,
  topics: TOPICS.length,
  districts: DISTRICTS.length,
  users: new Set([
    CURRENT_USER.id,
    ...ADMIN_USERS.map((row) => row.id),
    ...SCHOLARS.map((row) => row.id),
    ...QUESTIONS.map((row) => row.askerId),
  ]).size,
  reports: REPORTS.length,
  applications: SCHOLAR_APPLICATIONS.length,
  notifications: NOTIFICATIONS.length,
  bookmarks: BOOKMARKS.length,
  collectionsOwned: BOOKMARK_COLLECTIONS.length,
};


let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail?: unknown) {
  if (condition) {
    passed += 1;
    console.log(`  ok   ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL ${name}${detail === undefined ? "" : ` -> ${JSON.stringify(detail)}`}`);
  }
}

interface ApiResponse {
  status: number;
  body: unknown;
  headers: Headers;
}

async function call(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
    /** "manual" to inspect a redirect instead of following it into a browser flow. */
    redirect?: "follow" | "manual" | "error";
  } = {},
): Promise<ApiResponse> {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    redirect: options.redirect ?? "follow",
    headers: {
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Non-JSON answers are reported as-is by the checks that care.
  }
  return { status: response.status, body, headers: response.headers };
}

/**
 * The session cookie a sign-in answered with, formatted for the next request.
 *
 * Node's `fetch` keeps no cookie jar, so the test carries the cookie itself —
 * which is also what makes a forged or missing one cheap to test.
 */
function sessionCookie(response: ApiResponse): string {
  const header = response.headers.get("set-cookie") ?? "";
  const match = header.split(/,\s*(?=ilm_session=)/).find((value) => value.startsWith("ilm_session="));
  return match ? match.split(";")[0]!.trim() : "";
}

/** A list payload, or [] when the request failed — one bad response stays one bad response. */
/* eslint-disable @typescript-eslint/no-explicit-any -- assertions, not production code */
const rows = (response: ApiResponse): any[] => {
  const value = (response.body as { data?: unknown } | null)?.data;
  return Array.isArray(value) ? value : [];
};

/** An object payload, or {} — so a failed request reports as a failed check. */
const shape = <T>(response: ApiResponse): T => {
  const value = (response.body as { data?: unknown } | null)?.data;
  return (value && typeof value === "object" ? value : {}) as T;
};

function section(title: string) {
  console.log(`\n${title}`);
}

/* -------------------------------------------------------------------------- */

section("health and status");
const health = await call("/api/v1/health");
check("GET /health is 200", health.status === 200, health.body);
const status = await call("/api/v1/status");
const counts = (status.body as { counts: Record<string, number> }).counts;
check(
  "GET /status reports the seeded counts",
  counts?.hadiths === expected.hadiths &&
    counts?.articles === expected.articles &&
    counts?.ayahs === expected.ayahs &&
    counts?.users === expected.users,
  { got: counts, expected: { hadiths: expected.hadiths, articles: expected.articles, ayahs: expected.ayahs, users: expected.users } },
);

section("taxonomy");
const departments = await call("/api/v1/departments");
const departmentList = rows(departments);
check(
  `GET /departments returns ${expected.departments}`,
  departmentList.length === expected.departments,
  departmentList.length,
);
check(
  "a department carries its scholars",
  departmentList.some((row) => row.scholarIds.length > 0),
);
const department = await call("/api/v1/departments/family");
check(
  "GET /departments/family resolves scholars and topics",
  department.status === 200 &&
    Array.isArray(shape<{ scholars: unknown[] }>(department).scholars) &&
    Array.isArray(shape<{ topics: unknown[] }>(department).topics),
);

const topics = await call("/api/v1/topics");
check(`GET /topics returns ${expected.topics}`, rows(topics).length === expected.topics, rows(topics).length);
const topic = await call("/api/v1/topics/dowry");
check(
  "GET /topics/dowry returns tag keys",
  shape<{ tagKeys: string[] }>(topic).tagKeys.includes("dowry"),
);
const districts = await call("/api/v1/districts");
check(`GET /districts returns ${expected.districts}`, rows(districts).length === expected.districts);
check("GET /topics/nope is 404", (await call("/api/v1/topics/nope")).status === 404);

section("Qur'an, hadith, dua");
const surahs = await call("/api/v1/quran/surahs");
check(`GET /quran/surahs returns ${expected.surahs}`, rows(surahs).length === expected.surahs);
const surah = await call("/api/v1/quran/surahs/2");
const ayahs = shape<{ surah: { number: number }; ayahs: { ref: string }[] }>(surah).ayahs;
check("GET /quran/surahs/2 returns ayahs", ayahs.length > 0, ayahs.length);
const ayahByRef = await call(`/api/v1/quran/ayahs?ref=${ayahs[0]!.ref}`);
check("GET /quran/ayahs?ref= resolves one ayah", ayahByRef.status === 200, ayahByRef.body);
const arabic = shape<{ arabic: string }>(ayahByRef).arabic;
check("the ayah text is not empty", typeof arabic === "string" && arabic.length > 0);

const collections = await call("/api/v1/hadith/collections");
check(`GET /hadith/collections returns ${expected.collections}`, rows(collections).length === expected.collections);
const collection = await call("/api/v1/hadith/collections/bukhari");
check(
  "GET /hadith/collections/bukhari returns books",
  shape<{ books: unknown[] }>(collection).books.length > 0,
);
const hadith = await call("/api/v1/hadith/bukhari/1");
check("GET /hadith/bukhari/1 resolves the hadith", hadith.status === 200, hadith.body);
check("the hadith carries a grade", typeof shape<{ grade: string }>(hadith).grade === "string");
check(
  "GET /hadith/hadiths?topic=fiqh filters by tag",
  rows(await call("/api/v1/hadith/hadiths?topic=fiqh")).length > 0,
);

const duas = await call("/api/v1/duas");
check(`GET /duas returns ${expected.duas}`, rows(duas).length === expected.duas);
check(
  "GET /duas?category= identifies a real category",
  (await call("/api/v1/duas?category=nope")).status === 400,
);

const daily = await call("/api/v1/daily");
const dailyData = shape<{ ayahs: unknown[]; hadiths: unknown[]; dhikr: unknown[] }>(daily);
check(
  "GET /daily resolves the rotation",
  dailyData.ayahs.length > 0 && dailyData.hadiths.length > 0 && dailyData.dhikr.length > 0,
  { ayahs: dailyData.ayahs.length, hadiths: dailyData.hadiths.length, dhikr: dailyData.dhikr.length },
);

section("authored content");
const articles = await call("/api/v1/articles");
const articleList = rows(articles);
check(
  `GET /articles returns the ${expected.publishedArticles} published articles`,
  articleList.length === expected.publishedArticles,
  articleList.length,
);
check(
  "every listed article is published",
  articleList.every((row) => (row as { status: string }).status === "published"),
);
check(
  "the whole table is reachable with ?status=",
  rows(await call("/api/v1/articles?status=draft")).length > 0,
);
check("an article body arrives as paragraphs", Array.isArray(articleList[0]!.bodyBn));

const article = await call("/api/v1/articles/sud-mukt-jibon-halal-uparjon");
const articleDetail = shape<{
  article: { referenceCount: number; publishedAt: string };
  references: unknown[];
  author: { id: string } | null;
}>(article);
check(
  "GET /articles/:slug returns its citations",
  articleDetail.references.length > 0,
  articleDetail.references.length,
);
check(
  "the citation count matches the column",
  articleDetail.references.length === articleDetail.article.referenceCount,
  { found: articleDetail.references.length, declared: articleDetail.article.referenceCount },
);
check(
  "publishedAt is ISO-8601",
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(articleDetail.article.publishedAt),
  articleDetail.article.publishedAt,
);
check("the author is attached", articleDetail.author !== null);

const byTopic = await call("/api/v1/articles?topic=dowry");
const topicArticles = rows(byTopic);
check("?topic=dowry finds the dowry article", topicArticles.length > 0, topicArticles.length);
check(
  "?topic=dowry matches authored tags only by default",
  topicArticles.every((row) => row.topicIds.includes("dowry")),
  topicArticles.map((row) => row.topicIds),
);
const related = rows(await call("/api/v1/articles?topic=dowry&includeRelated=true"));
check(
  "?includeRelated=true widens to the topic's departments",
  related.length >= topicArticles.length &&
    related.some((row) => !row.topicIds.includes("dowry")),
  { strict: topicArticles.length, related: related.length },
);
const byDepartment = await call("/api/v1/articles?department=family");
check(
  "?department=family finds articles",
  rows(byDepartment).length > 0,
);
check(
  "?status=draft is allowed for a reader",
  (await call("/api/v1/articles?status=draft")).status === 200,
);
check("a bad status is 400", (await call("/api/v1/articles?status=nonsense")).status === 400);

const fatwas = await call("/api/v1/fatwas");
check(
  `GET /fatwas returns the ${expected.publishedFatwas} published fatwas`,
  rows(fatwas).length === expected.publishedFatwas,
  rows(fatwas).length,
);
check(
  "?pinned=true narrows the list",
  rows(await call("/api/v1/fatwas?pinned=true")).length < 8,
);
// A fatwa is filed under departments and never tagged with a topic key, so a
// topic filter is the department tier: every row it returns sits in one of the
// topic's departments, and it is a strict subset of the archive.
const dowry = TOPICS.find((row) => row.slug === "dowry")!;
const dowryDepartmentIds = DEPARTMENTS.filter((department) =>
  dowry.departmentSlugs.includes(department.slug),
).map((department) => department.id);
const rulingsByTopic = rows(await call("/api/v1/fatwas?topic=dowry&limit=100"));
check(
  "GET /fatwas?topic=dowry returns the rulings filed under its departments",
  rulingsByTopic.length > 0 &&
    rulingsByTopic.every((row) =>
      row.departmentIds.some((id: string) => dowryDepartmentIds.includes(id)),
    ),
  rulingsByTopic.length,
);
check(
  "the fatwa topic filter narrows the archive",
  rulingsByTopic.length < rows(await call("/api/v1/fatwas?limit=100")).length,
  rulingsByTopic.length,
);
check(
  "GET /fatwas?topic=nope is 400",
  (await call("/api/v1/fatwas?topic=nope")).status === 400,
);
const fatwaSlug = rows(fatwas)[0]!.slug;
const fatwa = await call(`/api/v1/fatwas/${fatwaSlug}`);
const fatwaDetail = shape<{ references: unknown[] }>(fatwa);
check("GET /fatwas/:slug returns its citations", fatwaDetail.references.length > 0);

const references = await call("/api/v1/references?kind=ayah");
check(
  "GET /references?kind=ayah returns only ayah citations",
  rows(references).every((row) => row.kind === "ayah"),
);

section("Q&A and community");
const questions = await call("/api/v1/questions");
check(
  `GET /questions returns the ${expected.publicQuestions} public questions`,
  rows(questions).length === expected.publicQuestions,
  rows(questions).length,
);
// Chosen from the dataset's own questions: this suite posts a question of its
// own, and a previous run's answer carries no citations to check.
const seededQuestionSlugs = new Set(QUESTIONS.map((row) => row.slug));
const questionWithAnswers = rows(questions).find(
  (row) => row.status === "answered" && seededQuestionSlugs.has(row.slug),
)!;
const question = await call(`/api/v1/questions/${questionWithAnswers.slug}`);
const questionDetail = shape<{
  answers: { references: { id: string }[] }[];
}>(question);
check("GET /questions/:slug returns its answers", questionDetail.answers.length > 0);
check(
  "answers carry their citations",
  questionDetail.answers.some((answer) => answer.references.length > 0),
);
check(
  "GET /questions/:slug?unknown is 404",
  (await call("/api/v1/questions/not-a-question")).status === 404,
);
// The Q&A index counts the questions that asked for a formal ruling, so the
// filter has to mean what it says: every row it returns carries the flag, and the
// two values between them account for the whole public archive.
const askedForFatwa = rows(await call("/api/v1/questions?fatwaRequested=true&limit=100"));
const notAskedForFatwa = rows(await call("/api/v1/questions?fatwaRequested=false&limit=100"));
check(
  "GET /questions?fatwaRequested=true returns only questions asking for a ruling",
  askedForFatwa.length > 0 && askedForFatwa.every((row) => row.fatwaRequested === true),
  askedForFatwa.length,
);
check(
  "the fatwaRequested filters partition the archive",
  askedForFatwa.length + notAskedForFatwa.length === expected.publicQuestions,
  askedForFatwa.length + notAskedForFatwa.length,
);
check(
  "GET /questions?fatwaRequested=nonsense is a 400",
  (await call("/api/v1/questions?fatwaRequested=nonsense")).status === 400,
);

const discussions = await call("/api/v1/discussions");
const discussionList = rows(discussions);
check(
  `GET /discussions returns ${expected.discussions}`,
  discussionList.length === expected.discussions,
  discussionList.length,
);
const discussion = await call(`/api/v1/discussions/${discussionList[0]!.slug}`);
check(
  "GET /discussions/:slug returns its replies",
  shape<{ replies: unknown[] }>(discussion).replies.length > 0,
);

section("scholars and profiles");
const scholars = await call("/api/v1/scholars");
check(`GET /scholars returns ${expected.scholars}`, rows(scholars).length === expected.scholars);
const scholarSlug = rows(scholars)[0]!.slug;
check(
  "a scholar carries department ids",
  rows(scholars).every((row) => Array.isArray(row.departmentIds)),
);
check(
  "GET /scholars?department=family filters",
  rows(await call("/api/v1/scholars?department=family")).length > 0,
);
const scholar = await call(`/api/v1/scholars/${scholarSlug}`);
const scholarDetail = shape<{
  biography: { narrative: { bn: string } } | null;
  articles: unknown[];
  answers: { question: unknown }[];
}>(scholar);
check("a scholar has a biography", scholarDetail.biography !== null);
check(
  "a scholar profile lists answers with their questions",
  scholarDetail.answers.length > 0 && scholarDetail.answers[0]!.question !== null,
);

section("search");
const search = await call("/api/v1/search?q=%E0%A6%B8%E0%A7%81%E0%A6%A6");
const searchBody = search.body as { total: number; groups: { kind: string }[] };
check("GET /search finds content", searchBody.total > 0, searchBody);
check(
  "search results are grouped",
  searchBody.groups.length > 1 &&
    searchBody.groups.some((group) => group.kind === "ayah" || group.kind === "hadith"),
  searchBody.groups.map((group) => group.kind),
);
check("a one-letter query is 400", (await call("/api/v1/search?q=a")).status === 400);

section("accounts and sessions");

const seededPassword = process.env.ILM_SEED_PASSWORD ?? "ilm-dev-password";
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const smokeEmail = `smoke-${suffix}@example.test`;

const registered = await call("/api/v1/auth/register", {
  method: "POST",
  body: {
    name: "স্মোক টেস্ট ব্যবহারকারী",
    email: smokeEmail,
    password: "smoke-test-password",
    district: "dhaka",
    // Sent on purpose: a privilege must never be taken from the request body.
    role: "admin",
  },
});
check("POST /auth/register creates an account", registered.status === 201, registered.body);
check(
  "a role in the request body is ignored",
  shape<{ role: string }>(registered).role === "user",
  shape<{ role: string }>(registered),
);
const throwawayCookie = sessionCookie(registered);
check("registering signs the new account in", throwawayCookie.startsWith("ilm_session="));
check(
  "GET /auth/session returns the signed-in account",
  shape<{ user: { email: string } | null }>(
    await call("/api/v1/auth/session", { headers: { cookie: throwawayCookie } }),
  ).user?.email === smokeEmail,
);
check(
  "registering the same address again is 409",
  (
    await call("/api/v1/auth/register", {
      method: "POST",
      body: { name: "ডুপ্লিকেট", email: smokeEmail, password: "smoke-test-password", district: "dhaka" },
    })
  ).status === 409,
);
check(
  "a short password is 400",
  (
    await call("/api/v1/auth/register", {
      method: "POST",
      body: {
        name: "খাটো পাসওয়ার্ড",
        email: `short-${suffix}@example.test`,
        password: "short",
        district: "dhaka",
      },
    })
  ).status === 400,
);
check(
  "an unknown district is 400",
  (
    await call("/api/v1/auth/register", {
      method: "POST",
      body: {
        name: "অজানা জেলা",
        email: `district-${suffix}@example.test`,
        password: "smoke-test-password",
        district: "atlantis",
      },
    })
  ).status === 400,
);

const registerCookie = registered.headers.get("set-cookie") ?? "";
check("the session cookie is HttpOnly", /HttpOnly/i.test(registerCookie), registerCookie);
check("the session cookie is SameSite=Lax", /SameSite=Lax/i.test(registerCookie), registerCookie);
check("the session cookie is scoped to /", /Path=\//i.test(registerCookie), registerCookie);
check(
  "the session cookie is not Secure outside production",
  !/Secure/i.test(registerCookie),
  registerCookie,
);
check(
  "auth answers are never cached",
  (await call("/api/v1/auth/session")).headers.get("cache-control") === "private, no-store",
);

check(
  "a write from a foreign origin is 403",
  (
    await call("/api/v1/auth/login", {
      method: "POST",
      headers: { origin: "https://evil.example" },
      body: { email: smokeEmail, password: "smoke-test-password" },
    })
  ).status === 403,
);
const fromDevServer = await call("/api/v1/auth/login", {
  method: "POST",
  headers: { origin: "http://localhost:3000" },
  body: { email: smokeEmail, password: "smoke-test-password" },
});
check("a write from the dev server's origin is allowed", fromDevServer.status === 200, fromDevServer.body);
check(
  "the answer permits the credentialed cross-origin call",
  fromDevServer.headers.get("access-control-allow-credentials") === "true",
);

// A throwaway address, so the budget that is spent here is not the one the
// sign-ins above need on a re-run.
let firstLimitedAttempt = 0;
for (let attempt = 1; attempt <= 10; attempt += 1) {
  const response = await call("/api/v1/auth/login", {
    method: "POST",
    body: { email: `ratelimit-${suffix}@example.test`, password: "wrong-password-attempt" },
  });
  if (response.status === 429) {
    firstLimitedAttempt = attempt;
    break;
  }
}
check(
  "repeated sign-in attempts are rate limited",
  firstLimitedAttempt === 9,
  { firstLimitedAt: firstLimitedAttempt },
);

async function signInWith(email: string, password: string) {
  const response = await call("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
  return { response, cookie: sessionCookie(response) };
}

/** Sign in with a seeded account and keep the cookie the answer carried. */
async function signIn(email: string) {
  return signInWith(email, seededPassword);
}

/** The body of a login answer, whether it ended in a session or a challenge. */
const loginData = (response: ApiResponse) =>
  (response.body as {
    data?: { mfaRequired?: boolean; pendingToken?: string; factors?: { kind: string }[] };
  } | null)?.data ?? {};

const readerSession = await signIn("abdullah.almamun@gmail.com");
check(
  "POST /auth/login signs in a reader with the seed password",
  readerSession.response.status === 200 && readerSession.cookie.startsWith("ilm_session="),
  readerSession.response.body,
);
const scholarSession = await signIn("abdur.rahman@ilm.bd");
check(
  "POST /auth/login signs in a scholar",
  scholarSession.response.status === 200 && scholarSession.cookie !== "",
  scholarSession.response.body,
);
const adminSession = await signIn("mahbub.alam@ilm.bd");
check(
  "POST /auth/login signs in an admin",
  adminSession.response.status === 200 && adminSession.cookie !== "",
  adminSession.response.body,
);

const messageOf = (response: ApiResponse) =>
  (response.body as { error?: { message?: string } } | null)?.error?.message;
const wrongPassword = await call("/api/v1/auth/login", {
  method: "POST",
  body: { email: "abdullah.almamun@gmail.com", password: "definitely-not-the-password" },
});
const unknownEmail = await call("/api/v1/auth/login", {
  method: "POST",
  body: { email: `nobody-${suffix}@example.test`, password: "definitely-not-the-password" },
});
check("a wrong password is 401", wrongPassword.status === 401);
check("an unknown address is 401 too", unknownEmail.status === 401);
check(
  "both failures answer identically, so neither enumerates accounts",
  messageOf(wrongPassword) === messageOf(unknownEmail),
  { wrongPassword: messageOf(wrongPassword), unknownEmail: messageOf(unknownEmail) },
);

section("signing out");
check(
  "POST /auth/logout ends the session",
  (await call("/api/v1/auth/logout", { method: "POST", headers: { cookie: throwawayCookie } })).status === 200,
);
check(
  "the revoked cookie stops working",
  (await call("/api/v1/me", { headers: { cookie: throwawayCookie } })).status === 401,
);
check(
  "GET /auth/session with the revoked cookie is signed out",
  shape<{ user: unknown }>(await call("/api/v1/auth/session", { headers: { cookie: throwawayCookie } }))
    .user === null,
);
check(
  "POST /auth/logout without a session is still 200",
  (await call("/api/v1/auth/logout", { method: "POST" })).status === 200,
);

section("identity and guarded writes");
check("GET /me without a session is 401", (await call("/api/v1/me")).status === 401);
check(
  "GET /me with a forged cookie is 401",
  (await call("/api/v1/me", { headers: { cookie: "ilm_session=forged" } })).status === 401,
);
check(
  "GET /auth/session signed out is 200 with no account",
  shape<{ user: unknown }>(await call("/api/v1/auth/session")).user === null,
);
check(
  "POST /questions without a session is 401",
  (await call("/api/v1/questions", { method: "POST", body: { titleBn: "x".repeat(12), bodyBn: "y".repeat(25) } }))
    .status === 401,
);

const me = { cookie: readerSession.cookie };
const scholarHeaders = { cookie: scholarSession.cookie };
const adminHeaders = { cookie: adminSession.cookie };

const meResponse = await call("/api/v1/me", { headers: me });
check("GET /me with an identity returns the account", meResponse.status === 200);
check(
  "GET /me includes the email only for its owner",
  typeof shape<{ email: string }>(meResponse).email === "string",
);
const bookmarkCollections = await call("/api/v1/me/bookmark-collections", { headers: me });
check(
  "GET /me/bookmark-collections counts its bookmarks",
  rows(bookmarkCollections).reduce((sum, row) => sum + row.count, 0) === expected.bookmarks &&
    rows(bookmarkCollections).length === expected.collectionsOwned,
  rows(bookmarkCollections),
);
check(
  "GET /me/learning derives a streak from the seeded week",
  shape<{ streakDays: number }>(await call("/api/v1/me/learning", { headers: me })).streakDays > 0,
);

const asked = await call("/api/v1/questions", {
  method: "POST",
  headers: me,
  body: {
    titleBn: "স্মোক টেস্টে জিজ্ঞাসা করা একটি প্রশ্ন",
    bodyBn: "এই প্রশ্নটি স্বয়ংক্রিয় পরীক্ষার সময় তৈরি হয়েছে, এতে শর্ত পূরণের জন্য পর্যাপ্ত লেখা আছে।",
    departmentIds: ["fiqh"],
    topicIds: ["tawakkul"],
  },
});
check("POST /questions with an identity creates one", asked.status === 201, asked.body);
const askedSlug = shape<{ slug: string }>(asked).slug;

const answerAsUser = await call(`/api/v1/questions/${askedSlug}/answers`, {
  method: "POST",
  headers: me,
  body: { bodyBn: "একজন সাধারণ ব্যবহারকারীর জবাব, যা অনুমোদিত নয়।" },
});
check("POST an answer as a reader is 403", answerAsUser.status === 403);

const answerAsScholar = await call(`/api/v1/questions/${askedSlug}/answers`, {
  method: "POST",
  headers: scholarHeaders,
  body: { bodyBn: "এই উত্তরটি পরীক্ষার সময় একজন আলেমের পক্ষ থেকে দেওয়া হয়েছে।" },
});
check("POST an answer as a scholar is 201", answerAsScholar.status === 201, answerAsScholar.body);
const afterAnswer = await call(`/api/v1/questions/${askedSlug}`);
check(
  "the question now reports its answer and status",
  shape<{ question: { answerCount: number; status: string } }>(afterAnswer).question.answerCount === 1 &&
    shape<{ question: { status: string } }>(afterAnswer).question.status === "answered",
);

const discussionSlug = discussionList.find((row) => row.moderationState !== "locked")!.slug;
const reply = await call(`/api/v1/discussions/${discussionSlug}/replies`, {
  method: "POST",
  headers: me,
  body: { bodyBn: "পরীক্ষার সময় দেওয়া একটি মন্তব্য।" },
});
check("POST a discussion reply is 201", reply.status === 201, reply.body);

const bookmark = await call("/api/v1/me/bookmarks", {
  method: "POST",
  headers: me,
  body: {
    kind: "ayah",
    titleBn: "পরীক্ষার বুকমার্ক",
    previewBn: "পরীক্ষার সময় সংরক্ষিত",
    refBn: "সূরা আল-বাকারা, আয়াত ১",
    href: "/quran/2#ayah-1",
  },
});
check("POST /me/bookmarks is 201", bookmark.status === 201, bookmark.body);
const bookmarkId = shape<{ id: string }>(bookmark).id;
check(
  "DELETE /me/bookmarks/:id removes it",
  (await call(`/api/v1/me/bookmarks/${bookmarkId}`, { method: "DELETE", headers: me })).status === 200,
);
check(
  "deleting it twice is 404",
  (await call(`/api/v1/me/bookmarks/${bookmarkId}`, { method: "DELETE", headers: me })).status === 404,
);

/* -------------------------------------------------------------------------- */
/* A software authenticator                                                   */
/* -------------------------------------------------------------------------- */

const b64 = (value: Uint8Array) => Buffer.from(value).toString("base64url");
const unb64 = (value: string) => new Uint8Array(Buffer.from(value, "base64url"));
const sha256 = (value: Uint8Array | string) => createHash("sha256").update(value).digest();

/**
 * A genuine ES256 passkey, assembled in-process.
 *
 * Nothing here is mocked. The server runs its own WebAuthn verification against
 * these bytes over HTTP, so a passing check means a real ceremony completed:
 * client data type, challenge, origin, rpID hash, COSE public key and the
 * signature over authenticatorData all have to agree.
 */
function createAuthenticator(rpId: string, origin: string) {
  const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const { x, y } = publicKey.export({ format: "jwk" }) as { x: string; y: string };
  const credentialId = randomBytes(32).toString("base64url");

  // COSE_Key: 1 = kty (EC2), 3 = alg (ES256), -1 = crv (P-256), -2/-3 = x/y.
  const coseKey = encodeCBOR(
    new Map<number, CBORType>([
      [1, 2],
      [3, -7],
      [-1, 1],
      [-2, unb64(x)],
      [-3, unb64(y)],
    ]),
  );

  /** rpIdHash | flags | counter, plus the attested credential data when registering. */
  function authData(flags: number, counter: number, attested?: Uint8Array) {
    const counterBytes = Buffer.alloc(4);
    counterBytes.writeUInt32BE(counter, 0);
    const parts: Buffer[] = [sha256(rpId), Buffer.from([flags]), counterBytes];

    if (attested) {
      const length = Buffer.alloc(2);
      length.writeUInt16BE(unb64(credentialId).length, 0);
      parts.push(
        Buffer.alloc(16), // AAGUID: zeroes for a software authenticator
        length,
        Buffer.from(unb64(credentialId)),
        Buffer.from(attested),
      );
    }
    return Buffer.concat(parts);
  }

  const clientData = (type: "webauthn.create" | "webauthn.get", challenge: string) =>
    Buffer.from(JSON.stringify({ type, challenge, origin, crossOrigin: false }));

  return {
    credentialId,
    /** The registration response a browser would post, built byte for byte. */
    registration(challenge: string) {
      const attestationObject = encodeCBOR(
        new Map<string, CBORType>([
          ["fmt", "none"],
          ["attStmt", new Map()],
          // UP (user present) | AT (attested credential data included)
          ["authData", new Uint8Array(authData(0x41, 0, coseKey))],
        ]),
      );

      return {
        id: credentialId,
        rawId: credentialId,
        type: "public-key",
        clientExtensionResults: {},
        response: {
          clientDataJSON: b64(clientData("webauthn.create", challenge)),
          attestationObject: b64(attestationObject),
          transports: ["internal"],
        },
      };
    },
    /** The assertion a browser would post, signed with the private key. */
    assertion(challenge: string, counter: number) {
      const data = authData(0x01, counter); // UP
      const client = clientData("webauthn.get", challenge);
      const signature = sign("sha256", Buffer.concat([data, sha256(client)]), privateKey);

      return {
        id: credentialId,
        rawId: credentialId,
        type: "public-key",
        clientExtensionResults: {},
        response: {
          clientDataJSON: b64(client),
          authenticatorData: b64(data),
          signature: b64(signature),
          userHandle: null,
        },
      };
    },
  };
}

section("second factors: enrolling an address and a number");

const throwawayPassword = "smoke-test-password";

// Signed back in: the account has no factor yet, so this is still a single step.
const beforeMfa = await signInWith(smokeEmail, throwawayPassword);
check(
  "an account with no factor signs in in one step",
  beforeMfa.response.status === 200 && beforeMfa.cookie !== "",
  beforeMfa.response.body,
);
const mfaSession = { cookie: beforeMfa.cookie };
check(
  "GET /me/mfa starts with nothing enrolled",
  shape<{ enabled: boolean }>(await call("/api/v1/me/mfa", { headers: mfaSession })).enabled === false,
);
check(
  "enrolling without the account password is 400",
  (
    await call("/api/v1/me/mfa/email/start", {
      method: "POST",
      headers: mfaSession,
      body: { email: "reader@example.test" },
    })
  ).status === 400,
);
check(
  "enrolling with the wrong password is 401",
  (
    await call("/api/v1/me/mfa/email/start", {
      method: "POST",
      headers: mfaSession,
      body: { password: "not-the-password", email: "reader@example.test" },
    })
  ).status === 401,
);
check(
  "enrolling without a session is 401",
  (
    await call("/api/v1/me/mfa/email/start", {
      method: "POST",
      body: { password: throwawayPassword, email: "reader@example.test" },
    })
  ).status === 401,
);

const emailStart = await call("/api/v1/me/mfa/email/start", {
  method: "POST",
  headers: mfaSession,
  body: { password: throwawayPassword, email: "reader@example.test" },
});
const emailChallenge = shape<{ challengeId: string; devCode?: string; destination: string }>(emailStart);
check("POST /me/mfa/email/start sends a code", emailStart.status === 200, emailStart.body);
check(
  "the address is masked in the answer",
  emailChallenge.destination === "re****@example.test",
  emailChallenge.destination,
);
check(
  "a code is returned only because nothing was delivered",
  /^\d{6}$/.test(emailChallenge.devCode ?? ""),
  emailChallenge.devCode,
);
check(
  "a wrong code is 401",
  (
    await call("/api/v1/me/mfa/email/confirm", {
      method: "POST",
      headers: mfaSession,
      body: { challengeId: emailChallenge.challengeId, code: "000000" },
    })
  ).status === 401,
);

const emailConfirm = await call("/api/v1/me/mfa/email/confirm", {
  method: "POST",
  headers: mfaSession,
  body: { challengeId: emailChallenge.challengeId, code: emailChallenge.devCode },
});
const emailEnrolled = shape<{ factor: { kind: string }; recoveryCodes?: string[] }>(emailConfirm);
check("POST /me/mfa/email/confirm enrols the address", emailConfirm.status === 201, emailConfirm.body);
check("the factor reports its channel", emailEnrolled.factor.kind === "email", emailEnrolled.factor);
const recoveryCodes = emailEnrolled.recoveryCodes ?? [];
check("the first factor issues ten recovery codes", recoveryCodes.length === 10, recoveryCodes.length);
check(
  "a spent code cannot be replayed",
  (
    await call("/api/v1/me/mfa/email/confirm", {
      method: "POST",
      headers: mfaSession,
      body: { challengeId: emailChallenge.challengeId, code: emailChallenge.devCode },
    })
  ).status === 401,
);

check(
  "a number that is not a Bangladeshi mobile is 400",
  (
    await call("/api/v1/me/mfa/sms/start", {
      method: "POST",
      headers: mfaSession,
      body: { password: throwawayPassword, phone: "12345" },
    })
  ).status === 400,
);
const smsStart = await call("/api/v1/me/mfa/sms/start", {
  method: "POST",
  headers: mfaSession,
  body: { password: throwawayPassword, phone: "01712345678" },
});
const smsChallenge = shape<{ challengeId: string; devCode?: string; destination: string }>(smsStart);
check("POST /me/mfa/sms/start accepts a local number", smsStart.status === 200, smsStart.body);
check(
  "the number is stored in one canonical form and masked",
  smsChallenge.destination === "**********5678",
  smsChallenge.destination,
);
const smsConfirm = await call("/api/v1/me/mfa/sms/confirm", {
  method: "POST",
  headers: mfaSession,
  body: { challengeId: smsChallenge.challengeId, code: smsChallenge.devCode },
});
check("POST /me/mfa/sms/confirm enrols the number", smsConfirm.status === 201, smsConfirm.body);
check(
  "a later factor does not reissue recovery codes",
  shape<{ recoveryCodes?: string[] }>(smsConfirm).recoveryCodes === undefined,
);
check(
  "GET /me/mfa lists both factors",
  shape<{ factors: unknown[]; recoveryCodesRemaining: number }>(
    await call("/api/v1/me/mfa", { headers: mfaSession }),
  ).factors.length === 2,
);

section("signing in with a code");

const challenged = await signInWith(smokeEmail, throwawayPassword);
const challengeData = loginData(challenged.response);
check(
  "the password now only starts the sign-in",
  challenged.response.status === 200 && challengeData.mfaRequired === true,
  challenged.response.body,
);
check(
  "the answer lists the enrolled channels",
  (challengeData.factors ?? []).map((factor) => factor.kind).sort().join(",") === "email,sms",
  challengeData.factors,
);
check("no session is issued at that point", challenged.cookie === "", challenged.cookie);

const pendingToken = challengeData.pendingToken ?? "";
check(
  "a pending token is not a session",
  (await call("/api/v1/me", { headers: { cookie: `ilm_session=${pendingToken}` } })).status === 401,
);
check(
  "an unknown pending token is 401",
  (
    await call("/api/v1/auth/mfa/challenge", {
      method: "POST",
      body: { pendingToken: "not-a-pending-token", kind: "email" },
    })
  ).status === 401,
);

const codeChallenge = await call("/api/v1/auth/mfa/challenge", {
  method: "POST",
  body: { pendingToken, kind: "sms" },
});
const codeData = shape<{ challengeId: string; devCode?: string }>(codeChallenge);
check(
  "POST /auth/mfa/challenge sends a login code",
  codeChallenge.status === 200 && /^\d{6}$/.test(codeData.devCode ?? ""),
  codeChallenge.body,
);
check(
  "a wrong code does not sign anyone in",
  (
    await call("/api/v1/auth/mfa/verify", {
      method: "POST",
      body: { pendingToken, challengeId: codeData.challengeId, code: "000000" },
    })
  ).status === 401,
);

const completed = await call("/api/v1/auth/mfa/verify", {
  method: "POST",
  body: { pendingToken, challengeId: codeData.challengeId, code: codeData.devCode },
});
check("POST /auth/mfa/verify completes the sign-in", completed.status === 200, completed.body);
const codeCookie = sessionCookie(completed);
check("it issues a session cookie", codeCookie.startsWith("ilm_session="), codeCookie);
check(
  "that cookie reaches the account's own data",
  shape<{ email: string }>(await call("/api/v1/me", { headers: { cookie: codeCookie } })).email ===
    smokeEmail,
);
check(
  "the completed attempt cannot be replayed",
  (
    await call("/api/v1/auth/mfa/verify", {
      method: "POST",
      body: { pendingToken, challengeId: codeData.challengeId, code: codeData.devCode },
    })
  ).status === 401,
);

// Five wrong guesses exhaust one code, which is what stops a six-digit space
// from being walked at leisure.
const brute = await signInWith(smokeEmail, throwawayPassword);
const bruteToken = loginData(brute.response).pendingToken ?? "";
const bruteChallenge = await call("/api/v1/auth/mfa/challenge", {
  method: "POST",
  body: { pendingToken: bruteToken, kind: "email" },
});
const bruteData = shape<{ challengeId: string }>(bruteChallenge);
const attemptStatuses: number[] = [];
for (let attempt = 0; attempt < 6; attempt += 1) {
  attemptStatuses.push(
    (
      await call("/api/v1/auth/mfa/verify", {
        method: "POST",
        body: { pendingToken: bruteToken, challengeId: bruteData.challengeId, code: "000000" },
      })
    ).status,
  );
}
check(
  "five wrong codes exhaust the challenge",
  attemptStatuses.join(",") === "401,401,401,401,429,401",
  attemptStatuses.join(","),
);

section("passkeys");

const authenticator = createAuthenticator("localhost", "http://localhost:3000");
const otherKey = createAuthenticator("localhost", "http://localhost:3000");

const passkeyStart = await call("/api/v1/me/mfa/passkey/start", {
  method: "POST",
  headers: mfaSession,
  body: { password: throwawayPassword },
});
const registration = shape<{ challengeId: string; options: { challenge: string; rp: { id: string } } }>(
  passkeyStart,
);
check(
  "POST /me/mfa/passkey/start returns registration options",
  passkeyStart.status === 200 && typeof registration.options.challenge === "string",
  passkeyStart.body,
);
check(
  "the options name the relying party",
  registration.options.rp?.id === "localhost",
  registration.options.rp,
);

const passkeyConfirm = await call("/api/v1/me/mfa/passkey/confirm", {
  method: "POST",
  headers: mfaSession,
  body: {
    challengeId: registration.challengeId,
    response: authenticator.registration(registration.options.challenge),
    label: "স্মোক পাসকি",
  },
});
check(
  "POST /me/mfa/passkey/confirm verifies a real attestation",
  passkeyConfirm.status === 201,
  passkeyConfirm.body,
);
check(
  "a tampered registration is refused",
  (
    await call("/api/v1/me/mfa/passkey/confirm", {
      method: "POST",
      headers: mfaSession,
      body: {
        challengeId: registration.challengeId,
        response: otherKey.registration(registration.options.challenge),
      },
    })
  ).status === 401,
);

const passkeyLogin = await signInWith(smokeEmail, throwawayPassword);
const passkeyPending = loginData(passkeyLogin.response).pendingToken ?? "";
const optionsResponse = await call("/api/v1/auth/mfa/passkey/options", {
  method: "POST",
  body: { pendingToken: passkeyPending },
});
const assertionOptions = shape<{ challengeId: string; options: { challenge: string } }>(optionsResponse);
check(
  "POST /auth/mfa/passkey/options offers the enrolled passkey",
  optionsResponse.status === 200 && typeof assertionOptions.options.challenge === "string",
  optionsResponse.body,
);
check(
  "an assertion signed by a different key is refused",
  (
    await call("/api/v1/auth/mfa/passkey/verify", {
      method: "POST",
      body: {
        pendingToken: passkeyPending,
        challengeId: assertionOptions.challengeId,
        response: otherKey.assertion(assertionOptions.options.challenge, 0),
      },
    })
  ).status === 401,
);

// A fresh challenge: the refused attempt consumed the first one.
const optionsAgain = await call("/api/v1/auth/mfa/passkey/options", {
  method: "POST",
  body: { pendingToken: passkeyPending },
});
const realOptions = shape<{ challengeId: string; options: { challenge: string } }>(optionsAgain);
const passkeyComplete = await call("/api/v1/auth/mfa/passkey/verify", {
  method: "POST",
  body: {
    pendingToken: passkeyPending,
    challengeId: realOptions.challengeId,
    response: authenticator.assertion(realOptions.options.challenge, 1),
  },
});
check("POST /auth/mfa/passkey/verify completes the sign-in", passkeyComplete.status === 200, passkeyComplete.body);
const passkeyCookie = sessionCookie(passkeyComplete);
check("the passkey issues a session cookie", passkeyCookie.startsWith("ilm_session="), passkeyCookie);
check(
  "that cookie reaches the account's own data",
  shape<{ email: string }>(await call("/api/v1/me", { headers: { cookie: passkeyCookie } })).email ===
    smokeEmail,
);

section("credential-first passkeys");

/*
 * What conditional UI asks for: no cookie, no pending token, no account named.
 * The account is settled only when the assertion names a credential.
 */
const autofillOptions = await call("/api/v1/auth/passkey/options", { method: "POST" });
const autofill = shape<{
  challengeId: string;
  options: { challenge: string; allowCredentials: unknown[] };
}>(autofillOptions);
check(
  "POST /auth/passkey/options asks for an empty allow list",
  autofillOptions.status === 200 &&
    typeof autofill.options.challenge === "string" &&
    autofill.options.allowCredentials?.length === 0,
  autofillOptions.body,
);
check(
  "an anonymous assertion signed by a different key is refused",
  (
    await call("/api/v1/auth/passkey/verify", {
      method: "POST",
      body: {
        challengeId: autofill.challengeId,
        response: otherKey.assertion(autofill.options.challenge, 0),
      },
    })
  ).status === 401,
);

// A fresh challenge again: the refused attempt consumed the first one.
const autofillAgain = await call("/api/v1/auth/passkey/options", { method: "POST" });
const realAutofill = shape<{ challengeId: string; options: { challenge: string } }>(autofillAgain);
const autofillComplete = await call("/api/v1/auth/passkey/verify", {
  method: "POST",
  body: {
    challengeId: realAutofill.challengeId,
    response: authenticator.assertion(realAutofill.options.challenge, 2),
  },
});
check(
  "POST /auth/passkey/verify signs the passkey's owner in with no password",
  autofillComplete.status === 200,
  autofillComplete.body,
);
const autofillCookie = sessionCookie(autofillComplete);
check(
  "the credential-first assertion issues a session cookie",
  autofillCookie.startsWith("ilm_session="),
  autofillCookie,
);
check(
  "that session reaches the account the assertion named",
  shape<{ email: string }>(await call("/api/v1/me", { headers: { cookie: autofillCookie } })).email ===
    smokeEmail,
);
check(
  "an anonymous challenge is single use",
  (
    await call("/api/v1/auth/passkey/verify", {
      method: "POST",
      body: {
        challengeId: realAutofill.challengeId,
        response: authenticator.assertion(realAutofill.options.challenge, 3),
      },
    })
  ).status === 401,
);
check(
  "an unknown credential cannot start anything",
  (
    await call("/api/v1/auth/passkey/verify", {
      method: "POST",
      body: { challengeId: "mfc-nope", response: { id: "no-such-credential" } },
    })
  ).status === 401,
);

// Bytes that are not ASN.1 at all: the signature library throws on them rather
// than answering "not verified", and a refusal is what a caller must get either
// way — the input is a browser's, not a server fault.
const malformed = shape<{ challengeId: string; options: { challenge: string } }>(
  await call("/api/v1/auth/passkey/options", { method: "POST" }),
);
check(
  "an unparsable signature is refused, not a 500",
  (
    await call("/api/v1/auth/passkey/verify", {
      method: "POST",
      body: {
        challengeId: malformed.challengeId,
        response: {
          id: authenticator.credentialId,
          rawId: authenticator.credentialId,
          type: "public-key",
          clientExtensionResults: {},
          response: {
            clientDataJSON: b64(
              Buffer.from(
                JSON.stringify({
                  type: "webauthn.get",
                  challenge: malformed.options.challenge,
                  origin: "http://localhost:3000",
                  crossOrigin: false,
                }),
              ),
            ),
            authenticatorData: b64(
              Buffer.concat([sha256("localhost"), Buffer.from([0x01]), Buffer.alloc(4)]),
            ),
            signature: Buffer.alloc(64, 0x07).toString("base64url"),
            userHandle: null,
          },
        },
      },
    })
  ).status === 401,
);

section("recovery codes");

const recoveryLogin = await signInWith(smokeEmail, throwawayPassword);
const recoveryToken = loginData(recoveryLogin.response).pendingToken ?? "";
const recovery = await call("/api/v1/auth/mfa/recovery", {
  method: "POST",
  body: { pendingToken: recoveryToken, code: recoveryCodes[0] },
});
check("a recovery code completes the sign-in", recovery.status === 200, recovery.body);
check("it issues a session", sessionCookie(recovery).startsWith("ilm_session="), recovery.body);

const reuseLogin = await signInWith(smokeEmail, throwawayPassword);
const reuseToken = loginData(reuseLogin.response).pendingToken ?? "";
check(
  "a recovery code is single use",
  (
    await call("/api/v1/auth/mfa/recovery", {
      method: "POST",
      body: { pendingToken: reuseToken, code: recoveryCodes[0] },
    })
  ).status === 401,
);
check(
  "a nonsense recovery code is refused",
  (
    await call("/api/v1/auth/mfa/recovery", {
      method: "POST",
      body: { pendingToken: reuseToken, code: "aaaa-bbbb-cccc-dddd" },
    })
  ).status === 401,
);
check(
  "the spent code is counted as spent",
  shape<{ recoveryCodesRemaining: number }>(await call("/api/v1/me/mfa", { headers: mfaSession }))
    .recoveryCodesRemaining === 9,
);

section("removing factors");

const factorsNow = shape<{ factors: { id: string; kind: string }[] }>(
  await call("/api/v1/me/mfa", { headers: mfaSession }),
).factors;
const emailFactor = factorsNow.find((factor) => factor.kind === "email")!;
check(
  "removing a factor requires the account password",
  (
    await call(`/api/v1/me/mfa/${emailFactor.id}`, {
      method: "DELETE",
      headers: mfaSession,
      body: { password: "not-the-password" },
    })
  ).status === 401,
);
check(
  "DELETE /me/mfa/:id removes it",
  (
    await call(`/api/v1/me/mfa/${emailFactor.id}`, {
      method: "DELETE",
      headers: mfaSession,
      body: { password: throwawayPassword },
    })
  ).status === 200,
);
check(
  "an unknown factor is 400",
  (
    await call("/api/v1/me/mfa/mfa-does-not-exist", {
      method: "DELETE",
      headers: mfaSession,
      body: { password: throwawayPassword },
    })
  ).status === 400,
);
check(
  "regenerating replaces the outstanding codes",
  shape<{ recoveryCodes: string[] }>(
    await call("/api/v1/me/mfa/recovery-codes", {
      method: "POST",
      headers: mfaSession,
      body: { password: throwawayPassword },
    }),
  ).recoveryCodes.length === 10,
);

for (const factor of factorsNow.filter((row) => row.kind !== "email")) {
  await call(`/api/v1/me/mfa/${factor.id}`, {
    method: "DELETE",
    headers: mfaSession,
    body: { password: throwawayPassword },
  });
}
const afterRemoval = shape<{ enabled: boolean; recoveryCodesRemaining: number }>(
  await call("/api/v1/me/mfa", { headers: mfaSession }),
);
check("with every factor removed 2FA is off", afterRemoval.enabled === false, afterRemoval);
check("and no recovery codes are left behind", afterRemoval.recoveryCodesRemaining === 0, afterRemoval);
check(
  "regenerating codes is refused while 2FA is off",
  (
    await call("/api/v1/me/mfa/recovery-codes", {
      method: "POST",
      headers: mfaSession,
      body: { password: throwawayPassword },
    })
  ).status === 400,
);
const plainLogin = await signInWith(smokeEmail, throwawayPassword);
check(
  "the password signs in directly again",
  plainLogin.response.status === 200 && loginData(plainLogin.response).mfaRequired === undefined,
  plainLogin.response.body,
);

section("changing the password");

const newThrowawayPassword = "smoke-test-password-two";
const passwordSession = await signInWith(smokeEmail, throwawayPassword);
const passwordCookie = passwordSession.cookie;
check(
  "the account signs in with the password it registered with",
  passwordSession.response.status === 200 && passwordCookie !== "",
  passwordSession.response.body,
);
check(
  "changing a password without a session is 401",
  (
    await call("/api/v1/me/password", {
      method: "POST",
      body: { currentPassword: throwawayPassword, newPassword: newThrowawayPassword },
    })
  ).status === 401,
);
check(
  "the wrong current password is 401",
  (
    await call("/api/v1/me/password", {
      method: "POST",
      headers: { cookie: passwordCookie },
      body: { currentPassword: "not-the-password", newPassword: newThrowawayPassword },
    })
  ).status === 401,
);
check(
  "a new password below the policy is 400",
  (
    await call("/api/v1/me/password", {
      method: "POST",
      headers: { cookie: passwordCookie },
      body: { currentPassword: throwawayPassword, newPassword: "short" },
    })
  ).status === 400,
);
check(
  "reusing the current password is 400",
  (
    await call("/api/v1/me/password", {
      method: "POST",
      headers: { cookie: passwordCookie },
      body: { currentPassword: throwawayPassword, newPassword: throwawayPassword },
    })
  ).status === 400,
);

// A second device, so "every other session was ended" has something to end.
const otherDevice = await signInWith(smokeEmail, throwawayPassword);
check("a second device is signed in", otherDevice.cookie !== "");
const changed = await call("/api/v1/me/password", {
  method: "POST",
  headers: { cookie: passwordCookie },
  body: { currentPassword: throwawayPassword, newPassword: newThrowawayPassword },
});
check("POST /me/password changes it", changed.status === 200, changed.body);
check(
  "every other device was signed out by the change",
  (await call("/api/v1/me", { headers: { cookie: otherDevice.cookie } })).status === 401,
);
check(
  "the device that changed it stays signed in",
  (await call("/api/v1/me", { headers: { cookie: passwordCookie } })).status === 200,
);
check(
  "the answer reports how many sessions ended",
  shape<{ otherSessionsRevoked: number }>(changed).otherSessionsRevoked >= 1,
  changed.body,
);
check(
  "the old password no longer signs in",
  (await signInWith(smokeEmail, throwawayPassword)).response.status === 401,
);
const afterChange = await signInWith(smokeEmail, newThrowawayPassword);
check(
  "the new password signs in",
  afterChange.response.status === 200 && afterChange.cookie !== "",
  afterChange.response.body,
);

section("admin");
// Registration above added an account, so anything counting users is compared
// against a fresh count rather than the snapshot taken before the auth section.
const liveCounts = ((await call("/api/v1/status")).body as { counts: Record<string, number> }).counts;
check(
  "registering added exactly one account",
  liveCounts!.users === counts!.users + 1,
  { before: counts!.users, after: liveCounts!.users },
);
check("GET /admin/overview without a role is 401", (await call("/api/v1/admin/overview")).status === 401);
check(
  "GET /admin/overview as a reader is 403",
  (await call("/api/v1/admin/overview", { headers: me })).status === 403,
);
const overview = await call("/api/v1/admin/overview", { headers: adminHeaders });
const overviewData = shape<{
  overview: { totalUsers: number; publishedFatwas: number; totalScholars: number };
  unavailable: string[];
}>(overview);
check(
  "GET /admin/overview counts the real tables",
  overviewData.overview.totalUsers === liveCounts!.users &&
    overviewData.overview.publishedFatwas === expected.publishedFatwas &&
    overviewData.overview.totalScholars === expected.scholars,
  overviewData.overview,
);
check(
  "the overview names what it cannot compute",
  overviewData.unavailable.includes("dailyActiveTrend"),
);
check(
  "GET /admin/reports returns the seeded reports",
  rows(await call("/api/v1/admin/reports", { headers: adminHeaders })).length === expected.reports,
);
check(
  "GET /admin/applications returns the seeded applications",
  rows(await call("/api/v1/admin/applications", { headers: adminHeaders })).length ===
    expected.applications,
);
check(
  "GET /admin/users returns rows for the admin console",
  rows(await call("/api/v1/admin/users", { headers: adminHeaders }))[0]
    ?.contributions !== undefined,
);

section("active devices");

// Placed last among the signed-in sections because it deliberately ends other
// sessions: the reader account's other cookies are used by everything above.
const deviceA = await signIn("abdullah.almamun@gmail.com");
const deviceB = await signIn("abdullah.almamun@gmail.com");
const deviceC = await signIn("abdullah.almamun@gmail.com");
check(
  "three separate sign-ins produce three cookies",
  [deviceA, deviceB, deviceC].every((device) => device.cookie.startsWith("ilm_session=")),
);

check("GET /me/sessions without a session is 401", (await call("/api/v1/me/sessions")).status === 401);
const devices = await call("/api/v1/me/sessions", { headers: { cookie: deviceA.cookie } });
const deviceList = rows(devices);
check("GET /me/sessions lists the signed-in devices", deviceList.length >= 3, deviceList.length);
check(
  "exactly one of them is the current device",
  deviceList.filter((row) => row.current === true).length === 1,
  deviceList.map((row) => row.current),
);
check("the current device is listed first", deviceList[0]?.current === true, deviceList[0]);
check(
  "each device carries a readable label and a last-seen time",
  typeof deviceList[0]?.device === "string" &&
    deviceList[0].device.length > 0 &&
    typeof deviceList[0]?.lastSeenAt === "string",
  deviceList[0],
);
check(
  "the response never carries the session token",
  !JSON.stringify(devices.body).includes(deviceA.cookie.slice("ilm_session=".length)),
);
check(
  "a session id is not derived from the token",
  deviceList.every((row) => String(row.id).startsWith("sess-")),
  deviceList.map((row) => row.id),
);

const currentDevice = deviceList.find((row) => row.current === true)!;
check(
  "the device in use cannot be revoked from the list",
  (
    await call(`/api/v1/me/sessions/${currentDevice.id}`, {
      method: "DELETE",
      headers: { cookie: deviceA.cookie },
    })
  ).status === 400,
);
check(
  "an unknown session id is 404",
  (
    await call("/api/v1/me/sessions/sess-not-real", {
      method: "DELETE",
      headers: { cookie: deviceA.cookie },
    })
  ).status === 404,
);

// Each device identifies its own row by asking who it is — which is also the
// only way to name a session without ever publishing its token.
const deviceBCurrent = rows(await call("/api/v1/me/sessions", { headers: { cookie: deviceB.cookie } })).find(
  (row) => row.current === true,
)!;
check("a second device sees itself as current", deviceBCurrent.id !== currentDevice.id);
check(
  "revoking that device is 200",
  (
    await call(`/api/v1/me/sessions/${deviceBCurrent.id}`, {
      method: "DELETE",
      headers: { cookie: deviceA.cookie },
    })
  ).status === 200,
);
check(
  "the revoked device's cookie stops working",
  (await call("/api/v1/me", { headers: { cookie: deviceB.cookie } })).status === 401,
);

// One account's session id must not be usable from another account.
const stranger = await signIn("rafiqul.islam@example.com");
const strangerCurrent = rows(
  await call("/api/v1/me/sessions", { headers: { cookie: stranger.cookie } }),
).find((row) => row.current === true)!;
check(
  "another account's session is a 404, not a hint that it exists",
  (
    await call(`/api/v1/me/sessions/${strangerCurrent.id}`, {
      method: "DELETE",
      headers: { cookie: deviceA.cookie },
    })
  ).status === 404,
);
check(
  "and that account's session is untouched",
  (await call("/api/v1/me", { headers: { cookie: stranger.cookie } })).status === 200,
);

const revokeAll = await call("/api/v1/me/sessions", {
  method: "DELETE",
  headers: { cookie: deviceA.cookie },
});
check(
  "DELETE /me/sessions ends every other device",
  revokeAll.status === 200 && shape<{ revoked: number }>(revokeAll).revoked >= 1,
  revokeAll.body,
);
check(
  "the device that asked is still signed in",
  (await call("/api/v1/me", { headers: { cookie: deviceA.cookie } })).status === 200,
);
check(
  "the other device is gone",
  (await call("/api/v1/me", { headers: { cookie: deviceC.cookie } })).status === 401,
);
check(
  "the list is down to the one device left",
  rows(await call("/api/v1/me/sessions", { headers: { cookie: deviceA.cookie } })).length === 1,
);

/* -------------------------------------------------------------------------- */
/* A stub identity provider                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A working OAuth provider, written here.
 *
 * It exists because the provider configuration is *data*: pointing a provider row
 * at this server runs the same code path a Facebook sign-in runs, so the state
 * handling, the transport choices, the claim mapping and the account rules are all
 * exercised for real — including the failure paths that are impossible to provoke
 * against a live provider on demand.
 *
 * What it does not establish is Meta's or Google's behaviour; no local test can.
 */
const stub = {
  /** What the provider reports for the next sign-in. */
  profile: {
    sub: "subject-0",
    email: "",
    email_verified: true,
    name: "সোশ্যাল ব্যবহারকারী",
    picture: "",
  },
  /** The last access token the userinfo endpoint was handed, and how. */
  sawTokenInQuery: null as string | null,
  tokensIssued: 0,
};

const stubServer = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");

  if (url.pathname === "/authorize") {
    const back = new URL(url.searchParams.get("redirect_uri") ?? "http://127.0.0.1/");
    back.searchParams.set("code", "stub-code");
    back.searchParams.set("state", url.searchParams.get("state") ?? "");
    response.writeHead(302, { location: back.toString() });
    response.end();
    return;
  }

  if (url.pathname === "/token") {
    stub.tokensIssued += 1;
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ access_token: "stub-access-token", token_type: "bearer" }));
    return;
  }

  if (url.pathname === "/userinfo") {
    stub.sawTokenInQuery = url.searchParams.get("access_token");
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(stub.profile));
    return;
  }

  response.writeHead(404);
  response.end();
});

await new Promise<void>((resolve) => stubServer.listen(0, "127.0.0.1", resolve));
const stubBase = `http://127.0.0.1:${(stubServer.address() as AddressInfo).port}`;
const stubRedirect = `${baseUrl}/api/v1/auth/social/stub/callback`;

const stubSecret = "stub-client-secret-value";

/** The provider configuration, with room for one deliberate mistake per case. */
const providerBody = (overrides: Record<string, unknown> = {}) => ({
  slug: "stub",
  name: { bn: "পরীক্ষা প্রদানকারী", en: "Stub provider" },
  enabled: false,
  clientId: "stub-client-id",
  clientSecret: stubSecret,
  redirectUri: stubRedirect,
  authorizationUrl: `${stubBase}/authorize`,
  tokenUrl: `${stubBase}/token`,
  userinfoUrl: `${stubBase}/userinfo`,
  scopes: ["openid", "email"],
  tokenMethod: "post",
  clientAuth: "body",
  userinfoAuth: "bearer",
  sendAppSecretProof: false,
  claims: {
    subject: "sub",
    email: "email",
    name: "name",
    picture: "picture",
    emailVerified: "email_verified",
  },
  ...overrides,
});

/** start → provider → callback, the way a browser would, returning the callback answer. */
async function stubSignIn(options: { json?: boolean; returnTo?: string } = {}): Promise<ApiResponse> {
  const start = await call(
    `/api/v1/auth/social/stub/start${options.returnTo ? `?returnTo=${encodeURIComponent(options.returnTo)}` : ""}`,
    { redirect: "manual" },
  );
  if (start.status !== 302) return start;

  const atProvider = await fetch(start.headers.get("location")!, { redirect: "manual" });
  const back = new URL(atProvider.headers.get("location")!);

  return call(`${back.pathname}${back.search}`, {
    redirect: "manual",
    headers: options.json === false ? {} : { accept: "application/json" },
  });
}

section("social providers: administered, not deployed");

check(
  "listing providers without a session is 401",
  (await call("/api/v1/admin/social-providers")).status === 401,
);
check(
  "creating a provider as a reader is 403",
  (
    await call("/api/v1/admin/social-providers", {
      method: "POST",
      // The reader session from earlier in the suite; still valid on purpose.
      headers: { cookie: deviceA.cookie },
      body: providerBody(),
    })
  ).status === 403,
);
check(
  "an http endpoint outside loopback is refused",
  (
    await call("/api/v1/admin/social-providers", {
      method: "POST",
      headers: adminHeaders,
      body: providerBody({ authorizationUrl: "http://accounts.example.com/authorize" }),
    })
  ).status === 400,
);
check(
  "a provider with no subject claim is refused",
  (
    await call("/api/v1/admin/social-providers", {
      method: "POST",
      headers: adminHeaders,
      body: providerBody({ claims: { subject: "" } }),
    })
  ).status === 400,
);

const providerCreated = await call("/api/v1/admin/social-providers", {
  method: "POST",
  headers: adminHeaders,
  body: providerBody(),
});
const stubProvider = shape<{ id: string; enabled: boolean; hasClientSecret: boolean }>(
  providerCreated,
);
check("an admin creates a provider", providerCreated.status === 201, providerCreated.body);
check("it reports that a secret is set", stubProvider.hasClientSecret === true);
check(
  "the secret is never returned",
  !JSON.stringify(providerCreated.body).includes(stubSecret),
  providerCreated.body,
);
check("a new provider starts disabled", stubProvider.enabled === false);
check(
  "a disabled provider is not offered to a sign-in page",
  !rows(await call("/api/v1/auth/social/providers")).some((row) => row.slug === "stub"),
);
check("starting a disabled provider is 404", (await call("/api/v1/auth/social/stub/start")).status === 404);

const enabledPatch = await call(`/api/v1/admin/social-providers/${stubProvider.id}`, {
  method: "PATCH",
  headers: adminHeaders,
  body: { enabled: true },
});
check(
  "PATCH enables it without resending the secret",
  enabledPatch.status === 200 &&
    shape<{ enabled: boolean }>(enabledPatch).enabled === true &&
    !JSON.stringify(enabledPatch.body).includes(stubSecret),
  enabledPatch.body,
);
const offered = rows(await call("/api/v1/auth/social/providers"));
check("an enabled provider is offered", offered.some((row) => row.slug === "stub"));
check(
  "the public list carries nothing but a slug and a label",
  offered.every((row) => Object.keys(row).sort().join(",") === "name,slug"),
  offered,
);

const inspected = await call(`/api/v1/admin/social-providers/${stubProvider.id}/inspect`, {
  method: "POST",
  headers: adminHeaders,
});
check(
  "inspect hands over the redirect URI to register",
  shape<{ redirectUri: string }>(inspected).redirectUri === stubRedirect,
  inspected.body,
);
check(
  "inspect proves the stored secret still decrypts",
  shape<{ secretReadable: boolean }>(inspected).secretReadable === true,
);
check("inspect never leaks the secret", !JSON.stringify(inspected.body).includes(stubSecret));

section("social sign-in");

const socialEmail = `social-${suffix}@example.test`;
stub.profile = {
  sub: `subject-${suffix}`,
  email: socialEmail,
  email_verified: true,
  name: "সোশ্যাল ব্যবহারকারী",
  picture: `${stubBase}/pic.png`,
};

const startAttempt = await call("/api/v1/auth/social/stub/start", { redirect: "manual" });
const authorizeUrl = new URL(startAttempt.headers.get("location") ?? "http://127.0.0.1/");
check(
  "GET /start hands the browser to the provider",
  startAttempt.status === 302 && authorizeUrl.origin === stubBase,
  authorizeUrl.toString(),
);
check(
  "with the configured client id, redirect uri and scopes",
  authorizeUrl.searchParams.get("client_id") === "stub-client-id" &&
    authorizeUrl.searchParams.get("redirect_uri") === stubRedirect &&
    authorizeUrl.searchParams.get("scope") === "openid email",
  authorizeUrl.search,
);
check(
  "and a state we generated",
  (authorizeUrl.searchParams.get("state") ?? "").length > 20,
);

const signedIn = await stubSignIn();
check("the callback completes the sign-in", signedIn.status === 200, signedIn.body);
const firstSignIn = shape<{ user: { id: string; email: string }; created: boolean; linked: boolean }>(
  signedIn,
);
check(
  "it creates an account for the address the provider returned",
  firstSignIn.created === true && firstSignIn.user.email === socialEmail,
  firstSignIn,
);
const socialCookie = sessionCookie(signedIn);
check("it issues a session cookie", socialCookie.startsWith("ilm_session="), socialCookie);
check(
  "that session reaches the new account",
  shape<{ email: string }>(await call("/api/v1/me", { headers: { cookie: socialCookie } })).email ===
    socialEmail,
);
check(
  "the token reached the provider the way the config said",
  stub.sawTokenInQuery === null,
  stub.sawTokenInQuery,
);

const returning = await stubSignIn();
const secondSignIn = shape<{ user: { id: string }; created: boolean }>(returning);
check(
  "a returning subject finds the same account rather than a second one",
  secondSignIn.created === false && secondSignIn.user.id === firstSignIn.user.id,
  secondSignIn,
);

const browserFlow = await stubSignIn({ json: false, returnTo: "/settings" });
check("a browser is redirected rather than answered with JSON", browserFlow.status === 302, browserFlow.body);
const landing = new URL(browserFlow.headers.get("location") ?? "http://127.0.0.1/");
check(
  "and lands on the app, on the path it asked for",
  landing.origin === "http://localhost:3000" && landing.pathname === "/settings",
  landing.toString(),
);

check(
  "a callback with a forged state is refused",
  (
    await call("/api/v1/auth/social/stub/callback?code=stub-code&state=forged-state-value", {
      redirect: "manual",
      headers: { accept: "application/json" },
    })
  ).status === 400,
);
check(
  "cancelling at the provider is reported, not treated as a login",
  (
    await call("/api/v1/auth/social/stub/callback?error=access_denied&state=whatever", {
      redirect: "manual",
      headers: { accept: "application/json" },
    })
  ).status === 400,
);

// The same failure, as a browser sees it: no `accept: application/json`, so a
// JSON body would leave a visitor stranded on the API's origin. Only the status
// travels — the sign-in page owns the wording.
const cancelledByBrowser = await call(
  "/api/v1/auth/social/stub/callback?error=access_denied&state=whatever",
  { redirect: "manual" },
);
const cancelledLanding = new URL(cancelledByBrowser.headers.get("location") ?? "http://127.0.0.1/");
check(
  "a browser that cancels lands back on the sign-in page with the reason",
  cancelledByBrowser.status === 302 &&
    cancelledLanding.origin === "http://localhost:3000" &&
    cancelledLanding.pathname === "/login" &&
    cancelledLanding.searchParams.get("socialError") === "400",
  { status: cancelledByBrowser.status, location: cancelledLanding.toString() },
);

// Replaying a completed ceremony: the state is spent, so it cannot be reused.
const spentStart = await call("/api/v1/auth/social/stub/start", { redirect: "manual" });
const spentAtProvider = await fetch(spentStart.headers.get("location")!, { redirect: "manual" });
const spentBack = new URL(spentAtProvider.headers.get("location")!);
const spentPath = `${spentBack.pathname}${spentBack.search}`;
check(
  "the first use of a state succeeds",
  (await call(spentPath, { redirect: "manual", headers: { accept: "application/json" } })).status ===
    200,
);
check(
  "replaying it is refused",
  (await call(spentPath, { redirect: "manual", headers: { accept: "application/json" } })).status ===
    400,
);

section("social account linking");

const readerEmail = "abdullah.almamun@gmail.com";

// The provider claims an address that already belongs to a password account, but
// does not claim to have confirmed it — which is Facebook's actual position.
stub.profile = {
  sub: `unconfirmed-${suffix}`,
  email: readerEmail,
  email_verified: false,
  name: "অচেনা",
  picture: "",
};
check(
  "an unconfirmed address on an existing account is refused",
  (await stubSignIn()).status === 409,
);

stub.profile = {
  sub: `confirmed-${suffix}`,
  email: readerEmail,
  email_verified: true,
  name: "আব্দুল্লাহ",
  picture: "",
};
const confirmed = await stubSignIn();
check(
  "a confirmed address attaches to the account that already owns it",
  confirmed.status === 200 && shape<{ user: { id: string } }>(confirmed).user.id === "user-me",
  confirmed.body,
);
check(
  "the reader account still signs in with its own password",
  (await signIn(readerEmail)).response.status === 200,
);

// A provider that asserts nothing about the address behaves as Facebook does,
// whatever the payload happens to contain.
await call(`/api/v1/admin/social-providers/${stubProvider.id}`, {
  method: "PATCH",
  headers: adminHeaders,
  body: { claims: { emailVerified: null } },
});
stub.profile = {
  sub: `noassert-${suffix}`,
  email: readerEmail,
  email_verified: true,
  name: "অচেনা",
  picture: "",
};
check(
  "a provider that asserts nothing is never trusted to link by address",
  (await stubSignIn()).status === 409,
);
await call(`/api/v1/admin/social-providers/${stubProvider.id}`, {
  method: "PATCH",
  headers: adminHeaders,
  body: { claims: { emailVerified: "email_verified" } },
});

// No address at all: an account needs one, and inventing a placeholder would be
// worse than saying so.
stub.profile = { sub: `noemail-${suffix}`, email: "", email_verified: true, name: "বে-নাম", picture: "" };
check("a sign-in with no email address is refused", (await stubSignIn()).status === 400);

section("connected accounts");

const readerForSocial = await signIn(readerEmail);
check("GET /me/identities needs a session", (await call("/api/v1/me/identities")).status === 401);
const readerIdentities = rows(
  await call("/api/v1/me/identities", { headers: { cookie: readerForSocial.cookie } }),
);
check(
  "the linked provider is listed on the account",
  readerIdentities.length === 1 && readerIdentities[0].provider.slug === "stub",
  readerIdentities,
);
check(
  "the entry records the provider's own subject",
  typeof readerIdentities[0].subject === "string" && readerIdentities[0].subject.length > 0,
);
check(
  "unlinking an account that has a password still requires it",
  (
    await call(`/api/v1/me/identities/${readerIdentities[0].id}`, {
      method: "DELETE",
      headers: { cookie: readerForSocial.cookie },
      body: {},
    })
  ).status === 400,
);
check(
  "unlinking with the password works",
  (
    await call(`/api/v1/me/identities/${readerIdentities[0].id}`, {
      method: "DELETE",
      headers: { cookie: readerForSocial.cookie },
      body: { password: seededPassword },
    })
  ).status === 200,
);
check(
  "and the account no longer lists it",
  rows(await call("/api/v1/me/identities", { headers: { cookie: readerForSocial.cookie } })).length ===
    0,
);

// An account created by a provider has no password, so unlinking its only
// identity would lock it out — and is refused rather than allowed.
const socialOnlyIdentities = rows(
  await call("/api/v1/me/identities", { headers: { cookie: socialCookie } }),
);
check(
  "a provider-created account shows its identity",
  socialOnlyIdentities.length === 1,
  socialOnlyIdentities,
);
check(
  "removing the only way in is refused",
  (
    await call(`/api/v1/me/identities/${socialOnlyIdentities[0].id}`, {
      method: "DELETE",
      headers: { cookie: socialCookie },
      body: {},
    })
  ).status === 400,
);

// Linking deliberately, from a signed-in session.
stub.profile = {
  sub: `linked-${suffix}`,
  email: "another.address@example.test",
  email_verified: false,
  name: "সংযুক্ত",
  picture: "",
};
check("GET /link needs a session", (await call("/api/v1/auth/social/stub/link", { redirect: "manual" })).status === 401);
const linkStart = await call("/api/v1/auth/social/stub/link", {
  headers: { cookie: readerForSocial.cookie },
  redirect: "manual",
});
check("GET /link starts a link ceremony", linkStart.status === 302, linkStart.body);
const atLinkProvider = await fetch(linkStart.headers.get("location")!, { redirect: "manual" });
const linkBack = new URL(atLinkProvider.headers.get("location")!);
const linked = await call(`${linkBack.pathname}${linkBack.search}`, {
  redirect: "manual",
  headers: { accept: "application/json" },
});
check(
  "an unconfirmed address links anyway, because the owner asked for it",
  linked.status === 200 &&
    shape<{ linked: boolean }>(linked).linked === true,
  linked.body,
);
check(
  "and it appears on the account",
  rows(await call("/api/v1/me/identities", { headers: { cookie: readerForSocial.cookie } })).length ===
    1,
);

//
// The section created a provider row, so it removes it again. Leaving it behind
// is what made a second run fail on the unique slug, and an enabled row pointing
// at a socket that is about to close is a broken button on the sign-in page until
// somebody notices.
//
check(
  "an admin removes the provider again",
  (
    await call(`/api/v1/admin/social-providers/${stubProvider.id}`, {
      method: "DELETE",
      headers: adminHeaders,
    })
  ).status === 200,
);
check(
  "and the sign-in page stops offering it",
  !rows(await call("/api/v1/auth/social/providers")).some((row) => row.slug === "stub"),
);

// The stub is a listening socket, so it has to be closed or the process hangs.
await new Promise<void>((resolve) => stubServer.close(() => resolve()));

section("errors");
check("an unknown route is 404 JSON", (await call("/api/v1/nope")).status === 404);
check(
  "a bad limit is 400 with the allowed range",
  (await call("/api/v1/articles?limit=9999")).status === 400,
);
check(
  "an unknown department is 400, not an empty list",
  (await call("/api/v1/articles?department=nope")).status === 400,
);

console.log(`\n${passed} passed, ${failed} failed`);
console.log("Writes were made: re-run `pnpm --filter @ilm/server db:seed` for a pristine dataset.");
process.exit(failed === 0 ? 0 : 1);

// Top-level await needs a module, not a script.
export {};
