/**
 * The public content API, as the Next server dials it.
 *
 * The pages that read articles and fatwas used to import the mock dataset, which
 * meant the app could only ever show the fixture. This is the replacement: the
 * same entities, fetched from the API that owns them, with the shapes the pages
 * already render — the DTOs on the server are annotated with these very types, so
 * a field the server stops sending fails the server's typecheck rather than
 * arriving here as `undefined`.
 *
 * Two things are deliberate:
 *
 *  - **Nothing throws.** A page that cannot reach the API renders an empty or
 *    error state with its own wording; it does not take the whole route down with
 *    it. The refused reason is logged here, for the developer, and never shown.
 *  - **Public content is cached for a minute.** These reads are anonymous and
 *    identical for everyone, so they go through Next's data cache rather than
 *    hitting the API on every request. A minute is the window in which a freshly
 *    published piece may not be visible yet — the price of not running an editor
 *    action through a revalidate call that does not exist yet.
 *
 * The address is `serverApiUrl`, not the browser's own `/api/v1` mirror: this
 * module runs in the Next server, which can reach the API directly, and a page
 * should not make the server call itself over HTTP.
 */

import { serverApiUrl } from "./api-server";
import type {
  Answer,
  Article,
  ContentReference,
  Department,
  Discussion,
  District,
  Fatwa,
  Hadith,
  Question,
  Scholar,
  ScholarBiography,
  Topic,
} from "./types";

/**
 * The outcome of a read: the entity, or why there is none.
 *
 * `status` is carried because two failures are not the same thing to a page: a
 * `404` means this slug does not exist and deserves `notFound()`, while anything
 * else means the archive is temporarily unreachable and deserves an error state
 * the reader can retry. `0` is a connection that never happened.
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

/** The API's own paginated envelope, flattened to what a page consumes. */
export interface ContentPage<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * The API's list body: the rows under `data`, and the page's bookkeeping beside
 * them — which is why `get` cannot read a list on its own.
 */
interface ListEnvelope<T> {
  data: T[];
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

/** Long enough for a cold query, short enough that a stalled API is not a stuck page. */
const TIMEOUT_MS = 5000;

/** Content changes when an editor publishes it, not between two page views. */
const REVALIDATE_SECONDS = 60;

/** The API refuses anything larger, and a page that wants "all" wants this. */
export const MAX_LIMIT = 100;

/** One GET, the body exactly as sent. The only place a response shape is read. */
async function request<T>(path: string): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(serverApiUrl(path), {
      headers: { accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error(`Content API request to ${path} failed:`, error);
    return { ok: false, status: 0, message: "The content service could not be reached." };
  }

  const payload: unknown = await response.json().catch(() => null);
  const body = payload as { data?: unknown; error?: { message?: string } } | null;

  if (!response.ok) {
    const message = body?.error?.message ?? `The content service answered ${response.status}.`;
    console.error(`Content API request to ${path} was refused: ${message}`);
    return { ok: false, status: response.status, message };
  }

  return { ok: true, data: body as T };
}

/**
 * One GET with the response's single `data` field peeled off — a detail, or a
 * whole-collection read like the taxonomy lists.
 *
 * A **list** is not this shape. There `data` *is* the rows, with the page's
 * bookkeeping beside them at the top level, so paginated reads use `getPage`
 * instead: peeling twice would leave nothing but the pages that read them empty.
 */
async function get<T>(path: string): Promise<ApiResult<T>> {
  const result = await request<{ data: T }>(path);
  if (!result.ok) return result;

  return { ok: true, data: result.data?.data as T };
}

/** A paginated read, flattened. A single-row list still answers with a total. */
async function getPage<T>(path: string): Promise<ApiResult<ContentPage<T>>> {
  const result = await request<ListEnvelope<T>>(path);
  if (!result.ok) return result;

  const { data: rows, page, limit, total, totalPages } = result.data;
  const items = Array.isArray(rows) ? rows : [];

  return {
    ok: true,
    data: {
      items,
      total: total ?? items.length,
      page: page ?? 1,
      limit: limit ?? items.length,
      totalPages: totalPages ?? 1,
    },
  };
}

/** Drops empty values, so a blank filter is simply absent rather than `?topic=`. */
function query(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/* -------------------------------------------------------------------------- */
/* Articles                                                                   */
/* -------------------------------------------------------------------------- */

export interface ArticleQuery {
  /** A department slug. */
  department?: string;
  /** A topic slug; `includeRelated` widens it to the topic's departments. */
  topic?: string;
  includeRelated?: boolean;
  /** An author id. */
  author?: string;
  /** Defaults to published — drafts need `status` named explicitly. */
  status?: "draft" | "in-review" | "published" | "changes-requested";
  sort?: "recent" | "popular";
  q?: string;
  page?: number;
  limit?: number;
}

export async function fetchArticles(
  input: ArticleQuery = {},
): Promise<ApiResult<ContentPage<Article>>> {
  return getPage<Article>(`/api/v1/articles${query({ ...input })}`);
}

/** One article with the evidence attached to it and who wrote it. */
export interface ArticleDetail {
  article: Article;
  references: ContentReference[];
  /** The author as the API exposes them: a name, and the scholar profile behind it. */
  author: { id: string; name: string; scholarId: string | null } | null;
}

export async function fetchArticle(slug: string): Promise<ApiResult<ArticleDetail>> {
  return get<ArticleDetail>(`/api/v1/articles/${encodeURIComponent(slug)}`);
}

/* -------------------------------------------------------------------------- */
/* Fatwas                                                                     */
/* -------------------------------------------------------------------------- */

export interface FatwaQuery {
  /** A department slug. */
  department?: string;
  fiqh?: "hanafi" | "comparative";
  mufti?: string;
  pinned?: boolean;
  status?: "draft" | "in-review" | "published";
  q?: string;
  page?: number;
  limit?: number;
}

export async function fetchFatwas(input: FatwaQuery = {}): Promise<ApiResult<ContentPage<Fatwa>>> {
  return getPage<Fatwa>(`/api/v1/fatwas${query({ ...input })}`);
}

export interface FatwaDetail {
  fatwa: Fatwa;
  references: ContentReference[];
}

export async function fetchFatwa(slug: string): Promise<ApiResult<FatwaDetail>> {
  return get<FatwaDetail>(`/api/v1/fatwas/${encodeURIComponent(slug)}`);
}

/* -------------------------------------------------------------------------- */
/* Taxonomy, people and questions                                             */
/* -------------------------------------------------------------------------- */

/** Unpaginated: the departments a reader can filter by. */
export async function fetchDepartments(): Promise<ApiResult<Department[]>> {
  return get<Department[]>("/api/v1/departments");
}

export interface TopicQuery {
  q?: string;
  /** `false` is the topics that are not trending — not "whatever they are". */
  trending?: boolean;
}

export async function fetchTopics(input: TopicQuery = {}): Promise<ApiResult<Topic[]>> {
  return get<Topic[]>("/api/v1/topics" + query({ ...input }));
}

/**
 * One topic, with the two things a topic page cannot guess.
 *
 * `tagKeys` are the values its content tags itself with and `departmentSlugs` is
 * the fallback tier beneath them, so a page reads the vocabulary the API owns
 * rather than assuming a topic slug is what the rows carry.
 */
export interface TopicDetail {
  topic: Topic;
  tagKeys: string[];
  departmentSlugs: string[];
}

export async function fetchTopic(slug: string): Promise<ApiResult<TopicDetail>> {
  return get<TopicDetail>(`/api/v1/topics/${encodeURIComponent(slug)}`);
}

export async function fetchDistricts(): Promise<ApiResult<District[]>> {
  return get<District[]>("/api/v1/districts");
}

export interface ScholarQuery {
  district?: string;
  available?: boolean;
  verified?: boolean;
  department?: string;
  q?: string;
  page?: number;
  limit?: number;
}

/**
 * Scholars, for the directory and for the bylines a content page has to draw.
 *
 * The default limit is the API's own maximum, not its page size: this reader is
 * used to build an id → scholar index, and a lookup that silently returned only
 * the first page would leave bylines blank on exactly the pages worth reading.
 */
export async function fetchScholars(
  input: ScholarQuery = {},
): Promise<ApiResult<ContentPage<Scholar>>> {
  return getPage<Scholar>(`/api/v1/scholars${query({ limit: MAX_LIMIT, ...input })}`);
}

/**
 * One scholar: the profile, the long-form biography, and their published work.
 *
 * `answers` pairs each answer with the question it answered, which is what a
 * profile needs to render a contribution as a row a reader can follow.
 */
export interface ScholarDetail {
  scholar: Scholar;
  biography: ScholarBiography | null;
  articles: Article[];
  fatwas: Fatwa[];
  answers: { answer: Answer; question: Question | null }[];
}

export async function fetchScholar(slug: string): Promise<ApiResult<ScholarDetail>> {
  return get<ScholarDetail>(`/api/v1/scholars/${encodeURIComponent(slug)}`);
}

export interface QuestionQuery {
  status?: Question["status"];
  urgency?: Question["urgency"];
  /** A formal ruling was asked for, rather than an answer alone. */
  fatwaRequested?: boolean;
  department?: string;
  /**
   * A topic slug. It matches *tagged* questions by default; `includeRelated` adds
   * the topic's own departments, which is the two-tier match a topic page wants.
   */
  topic?: string;
  includeRelated?: boolean;
  /** Only the questions this user asked. */
  asker?: string;
  /** Only the questions this scholar answered. */
  answeredBy?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export async function fetchQuestions(
  input: QuestionQuery = {},
): Promise<ApiResult<ContentPage<Question>>> {
  return getPage<Question>(`/api/v1/questions${query({ ...input })}`);
}

/** One question, with the answers scholars gave it, accepted first. */
export interface QuestionDetail {
  question: Question;
  answers: Answer[];
}

export async function fetchQuestion(slug: string): Promise<ApiResult<QuestionDetail>> {
  return get<QuestionDetail>(`/api/v1/questions/${encodeURIComponent(slug)}`);
}

export interface AnswerQuery {
  scholar?: string;
  question?: string;
  accepted?: boolean;
  page?: number;
  limit?: number;
}

/** Answers across the archive, for the totals an index page shows. */
export async function fetchAnswers(
  input: AnswerQuery = {},
): Promise<ApiResult<ContentPage<Answer>>> {
  return getPage<Answer>(`/api/v1/answers${query({ limit: MAX_LIMIT, ...input })}`);
}

/* -------------------------------------------------------------------------- */
/* Community and library                                                      */
/* -------------------------------------------------------------------------- */

export interface DiscussionQuery {
  /** A topic slug — tagged threads by default, `includeRelated` adds its departments. */
  topic?: string;
  includeRelated?: boolean;
  department?: string;
  author?: string;
  moderation?: Discussion["moderationState"];
  q?: string;
  page?: number;
  limit?: number;
}

export async function fetchDiscussions(
  input: DiscussionQuery = {},
): Promise<ApiResult<ContentPage<Discussion>>> {
  return getPage<Discussion>(`/api/v1/discussions${query({ ...input })}`);
}

/** Hadith are tagged with a department, so their `topic` filter is one too. */
export interface HadithQuery {
  collection?: string;
  book?: number;
  grade?: Hadith["grade"];
  topic?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export async function fetchHadiths(
  input: HadithQuery = {},
): Promise<ApiResult<ContentPage<Hadith>>> {
  return getPage<Hadith>(`/api/v1/hadith/hadiths${query({ ...input })}`);
}

/* -------------------------------------------------------------------------- */
/* People                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The public half of an account — a name to put on a question, and nothing more.
 *
 * There is no email here and there never will be: the API's `toPublicUser` is the
 * only shape it answers a profile read with.
 */
export interface PublicProfile {
  user: { id: string; name: string; district: string; avatarColor: string };
  stats: { answers: number; publishedArticles: number };
}

export async function fetchPublicUser(id: string): Promise<ApiResult<PublicProfile>> {
  return get<PublicProfile>(`/api/v1/users/${encodeURIComponent(id)}`);
}

/* -------------------------------------------------------------------------- */
/* Lookups                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Index a fetched collection by a key, for the id → entity lookups a card does.
 *
 * The cards used to reach into the mock dataset for this (`SCHOLAR_BY_ID[id]`),
 * which is why the pages now hand them the entry they resolved — see the optional
 * `author` / `mufti` props on the knowledge cards.
 */
export function indexBy<T, K extends keyof T>(rows: T[], key: K): Map<T[K], T> {
  return new Map(rows.map((row) => [row[key], row]));
}
