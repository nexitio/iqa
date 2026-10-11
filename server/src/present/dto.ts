/**
 * DTOs — rows in, `src/lib/types.ts` out.
 *
 * Every mapper is annotated with the frontend type it produces, so the compiler
 * is the contract test: if the schema and the app model drift, the server stops
 * typechecking rather than shipping a field the UI cannot read.
 *
 * Two normalisations happen here and nowhere else:
 *
 * - timestamps are returned as ISO-8601 UTC strings, matching the dataset the
 *   frontend was built against (Postgres hands back its own text format);
 * - nullable columns become absent keys for fields the model declares optional.
 */

import type { ActivityEntry, AdminUserRow, ContentReport, ReviewItem, ScholarApplication } from "@/lib/data/admin";
import type { DhikrItem, FocusTheme } from "@/lib/data/daily";
import type { FeedSection } from "@/lib/data/feed";
import type {
  Answer,
  AppNotification,
  Article,
  Bookmark,
  BookmarkCollection,
  ContentReference,
  Department,
  Discussion,
  DiscussionReply,
  District,
  Dua,
  DuaCategory,
  Fatwa,
  FeedItem,
  Hadith,
  HadithBook,
  HadithCollection,
  Journey,
  Question,
  QuranAyah,
  QuranSurah,
  ReadingProgress,
  Scholar,
  ScholarBiography,
  Topic,
  User,
} from "@/lib/types";
import type * as schema from "../db/schema/index.ts";

type Row<T extends { $inferSelect: unknown }> = T["$inferSelect"];

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

/** ISO-8601 UTC, the shape the frontend dataset uses. */
const iso = (value: string): string => new Date(value).toISOString();
const isoOptional = (value: string | null): string | undefined =>
  value === null ? undefined : iso(value);

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                   */
/* -------------------------------------------------------------------------- */

export const toDistrict = (row: Row<typeof schema.districts>): District => ({
  id: row.id,
  name: row.name,
  division: row.division,
  lat: row.lat,
  lng: row.lng,
  timezone: row.timezone,
});

export const toDepartment = (
  row: Row<typeof schema.departments>,
  scholarIds: string[],
): Department => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  shortName: row.shortName,
  description: row.description,
  icon: row.icon,
  tone: row.tone as Department["tone"],
  scholarIds,
  trending: row.trending,
  stats: row.stats,
});

export const toTopic = (
  row: Row<typeof schema.topics>,
  departmentSlugs: string[],
): Topic => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description,
  departmentSlugs,
  contentCount: row.contentCount,
  trending: row.trending,
});

/* -------------------------------------------------------------------------- */
/* Qur'an, hadith, duas                                                       */
/* -------------------------------------------------------------------------- */

export const toSurah = (row: Row<typeof schema.quranSurahs>): QuranSurah => ({
  number: row.number,
  slug: row.slug,
  nameArabic: row.nameArabic,
  name: row.name,
  meaning: row.meaning,
  ayahCount: row.ayahCount,
  revelation: row.revelation,
  hasText: row.hasText,
  juz: row.juz,
  about: row.about ?? undefined,
});

export const toAyah = (row: Row<typeof schema.quranAyahs>): QuranAyah => ({
  surah: row.surah,
  number: row.number,
  ref: row.ref,
  arabic: row.arabic,
  translationBn: row.translationBn,
  translationEn: row.translationEn,
  transliterationBn: row.transliterationBn,
  tafsirBn: row.tafsirBn ?? undefined,
  sajda: row.sajda || undefined,
});

export const toHadithCollection = (
  row: Row<typeof schema.hadithCollections>,
): HadithCollection => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  author: row.author,
  nameArabic: row.nameArabic,
  description: row.description,
  hadithCount: row.hadithCount,
  authentic: row.authentic,
  bookCount: row.bookCount,
  tone: row.tone as HadithCollection["tone"],
});

export const toHadithBook = (row: Row<typeof schema.hadithBooks>): HadithBook => ({
  id: row.id,
  collectionSlug: row.collectionSlug,
  number: row.number,
  name: row.name,
  hadithCount: row.hadithCount,
});

export const toHadith = (row: Row<typeof schema.hadiths>): Hadith => ({
  id: row.id,
  collectionSlug: row.collectionSlug,
  collectionName: row.collectionName,
  bookNumber: row.bookNumber,
  bookName: row.bookName,
  number: row.number,
  refBn: row.refBn,
  refEn: row.refEn,
  arabic: row.arabic,
  translationBn: row.translationBn,
  translationEn: row.translationEn,
  narrator: row.narrator,
  grade: row.grade,
  topicIds: row.topicIds,
  lessonBn: row.lessonBn ?? undefined,
});

export const toDuaCategory = (row: Row<typeof schema.duaCategories>): DuaCategory => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  description: row.description,
  icon: row.icon,
  tone: row.tone as DuaCategory["tone"],
});

export const toDua = (row: Row<typeof schema.duas>): Dua => ({
  id: row.id,
  slug: row.slug,
  categorySlug: row.categorySlug,
  title: row.title,
  arabic: row.arabic,
  transliterationBn: row.transliterationBn,
  meaning: row.meaning,
  reference: row.reference,
  occasion: row.occasion,
  repeat: row.repeat ?? undefined,
  virtue: row.virtue ?? undefined,
  tags: row.tags,
});

/* -------------------------------------------------------------------------- */
/* Citations and authored content                                             */
/* -------------------------------------------------------------------------- */

export const toReference = (row: Row<typeof schema.contentReferences>): ContentReference => ({
  id: row.id,
  kind: row.kind,
  ref: row.ref,
  arabic: row.arabic,
  translationBn: row.translationBn,
  refBn: row.refBn,
  note: row.note ?? undefined,
});

export const toArticle = (
  row: Row<typeof schema.articles>,
  departmentIds: string[],
): Article => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  excerpt: row.excerpt,
  bodyBn: row.bodyBn,
  authorId: row.authorId,
  departmentIds,
  topicIds: row.topicIds,
  coverTone: row.coverTone,
  status: row.status,
  publishedAt: iso(row.publishedAt),
  updatedAt: iso(row.updatedAt),
  readingMinutes: row.readingMinutes,
  viewCount: row.viewCount,
  bookmarkCount: row.bookmarkCount,
  likeCount: row.likeCount,
  commentCount: row.commentCount,
  referenceCount: row.referenceCount,
});

export const toFatwa = (
  row: Row<typeof schema.fatwas>,
  departmentIds: string[],
  coSignerIds: string[],
): Fatwa => ({
  id: row.id,
  slug: row.slug,
  questionBn: row.questionBn,
  rulingBn: row.rulingBn,
  bodyBn: row.bodyBn,
  questionerDistrict: row.questionerDistrict,
  muftiId: row.muftiId,
  coSignerIds,
  departmentIds,
  fiqh: row.fiqh,
  status: row.status,
  publishedAt: iso(row.publishedAt),
  referenceCount: row.referenceCount,
  viewCount: row.viewCount,
  bookmarkCount: row.bookmarkCount,
  pinned: row.pinned,
});

/* -------------------------------------------------------------------------- */
/* Q&A and community                                                          */
/* -------------------------------------------------------------------------- */

export const toQuestion = (
  row: Row<typeof schema.questions>,
  departmentIds: string[],
): Question => ({
  id: row.id,
  slug: row.slug,
  titleBn: row.titleBn,
  bodyBn: row.bodyBn,
  askerId: row.askerId,
  askerDistrict: row.askerDistrict,
  visibility: row.visibility,
  departmentIds,
  topicIds: row.topicIds,
  status: row.status,
  createdAt: iso(row.createdAt),
  answeredAt: isoOptional(row.answeredAt),
  views: row.views,
  followerCount: row.followerCount,
  answerCount: row.answerCount,
  fatwaRequested: row.fatwaRequested,
  urgency: row.urgency,
});

export const toAnswer = (
  row: Row<typeof schema.answers>,
  references: ContentReference[],
): Answer => ({
  id: row.id,
  questionId: row.questionId,
  scholarId: row.scholarId,
  bodyBn: row.bodyBn,
  accepted: row.accepted,
  createdAt: iso(row.createdAt),
  upvotes: row.upvotes,
  downvotes: row.downvotes,
  references,
  becameFatwaSlug: row.becameFatwaSlug ?? undefined,
});

export const toDiscussion = (
  row: Row<typeof schema.discussions>,
  departmentIds: string[],
): Discussion => ({
  id: row.id,
  slug: row.slug,
  titleBn: row.titleBn,
  bodyBn: row.bodyBn,
  authorId: row.authorId,
  departmentIds,
  topicIds: row.topicIds,
  createdAt: iso(row.createdAt),
  replyCount: row.replyCount,
  upvotes: row.upvotes,
  viewCount: row.viewCount,
  pinned: row.pinned,
  moderationState: row.moderationState,
  moderationNoteBn: row.moderationNoteBn ?? undefined,
  tags: row.tags,
});

export const toDiscussionReply = (
  row: Row<typeof schema.discussionReplies>,
): DiscussionReply => ({
  id: row.id,
  discussionId: row.discussionId,
  authorId: row.authorId,
  bodyBn: row.bodyBn,
  createdAt: iso(row.createdAt),
  upvotes: row.upvotes,
  isScholarReply: row.isScholarReply,
  accepted: row.accepted,
});

/* -------------------------------------------------------------------------- */
/* People                                                                     */
/* -------------------------------------------------------------------------- */

export const toScholar = (
  row: Row<typeof schema.scholars>,
  departmentIds: string[],
): Scholar => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  honorific: row.honorific,
  avatarColor: row.avatarColor,
  shortBio: row.shortBio,
  bio: row.bio,
  departmentIds,
  primaryDepartmentId: row.primaryDepartmentId,
  specialization: row.specialization,
  languages: row.languages,
  credentials: row.credentials,
  madrasah: row.madrasah,
  district: row.district,
  verified: row.verified,
  availableForQuestions: row.availableForQuestions,
  responseTimeHours: row.responseTimeHours,
  rating: row.rating,
  stats: row.stats,
  joinedAt: iso(row.joinedAt),
  fiqhFocus: row.fiqhFocus,
});

export const toScholarBiography = (
  row: Row<typeof schema.scholarBiographies>,
): ScholarBiography => ({
  scholarId: row.scholarId,
  born: row.born,
  family: row.family,
  narrative: row.narrative,
  now: row.now,
  teachers: row.teachers,
  ijazah: row.ijazah,
  service: row.service,
  works: row.works,
  students: row.students,
  awards: row.awards,
  sources: row.sources,
  updatedAt: iso(row.updatedAt),
});

/** A user as anyone may see them: no email address leaves the server. */
export type PublicUser = Omit<User, "email">;

export const toPublicUser = (
  row: Row<typeof schema.users>,
  following: { scholarIds: string[]; departmentSlugs: string[] },
): PublicUser => ({
  id: row.id,
  name: row.name,
  role: row.role,
  avatarColor: row.avatarColor,
  district: row.district,
  joinedAt: iso(row.joinedAt),
  scholarId: row.scholarId ?? undefined,
  interests: row.interests,
  followingScholarIds: following.scholarIds,
  followingDepartmentSlugs: following.departmentSlugs,
  isVerified: row.isVerified,
});

/** The signed-in user's own record — the only view that includes the email. */
export const toUser = (
  row: Row<typeof schema.users>,
  following: { scholarIds: string[]; departmentSlugs: string[] },
): User => ({
  ...toPublicUser(row, following),
  email: row.email,
});

/* -------------------------------------------------------------------------- */
/* Personal                                                                   */
/* -------------------------------------------------------------------------- */

export const toBookmark = (row: Row<typeof schema.bookmarks>): Bookmark => ({
  id: row.id,
  kind: row.kind,
  titleBn: row.titleBn,
  previewBn: row.previewBn,
  refBn: row.refBn,
  href: row.href,
  savedAt: iso(row.savedAt),
  collectionId: row.collectionId ?? undefined,
});

export const toBookmarkCollection = (
  row: Row<typeof schema.bookmarkCollections>,
  count: number,
): BookmarkCollection => ({
  id: row.id,
  nameBn: row.nameBn,
  tone: row.tone,
  count,
});

export const toReadingProgress = (row: Row<typeof schema.readingProgress>): ReadingProgress => ({
  id: row.id,
  kind: row.kind,
  titleBn: row.titleBn,
  subtitleBn: row.subtitleBn,
  href: row.href,
  progress: row.progress,
  lastReadAt: iso(row.lastReadAt),
  resumeLabelBn: row.resumeLabelBn,
});

export const toJourney = (row: Row<typeof schema.journeys>): Journey => ({
  id: row.id,
  slug: row.slug,
  titleBn: row.titleBn,
  descriptionBn: row.descriptionBn,
  durationLabelBn: row.durationLabelBn,
  enrolled: row.enrolled,
  completedDays: row.completedDays,
  totalDays: row.totalDays,
  days: row.days,
  tone: row.tone,
  categoryBn: row.categoryBn,
});

export const toNotification = (row: Row<typeof schema.appNotifications>): AppNotification => ({
  id: row.id,
  kind: row.kind,
  titleBn: row.titleBn,
  bodyBn: row.bodyBn,
  createdAt: iso(row.createdAt),
  read: row.read,
  href: row.href,
  actorId: row.actorId ?? undefined,
});

export const toFeedItem = (row: Row<typeof schema.feedItems>): FeedItem => ({
  id: row.id,
  kind: row.kind,
  reasonBn: row.reasonBn,
  createdAt: iso(row.createdAt),
  articleId: row.articleId ?? undefined,
  fatwaId: row.fatwaId ?? undefined,
  questionId: row.questionId ?? undefined,
  discussionId: row.discussionId ?? undefined,
  scholarId: row.scholarId ?? undefined,
  ayahRef: row.ayahRef ?? undefined,
  hadithId: row.hadithId ?? undefined,
  journeyId: row.journeyId ?? undefined,
});

export const toFeedSection = (row: Row<typeof schema.feedSections>): FeedSection => ({
  id: row.id,
  titleBn: row.titleBn,
  titleEn: row.titleEn,
  kinds: row.kinds as FeedItem["kind"][],
});

export const toDhikrItem = (row: Row<typeof schema.dhikrItems>): DhikrItem => ({
  id: row.id,
  arabic: row.arabic,
  transliterationBn: row.transliterationBn,
  meaningBn: row.meaningBn,
  count: row.count,
  virtueBn: row.virtueBn,
});

export const toFocusTheme = (row: Row<typeof schema.focusThemes>): FocusTheme => ({
  id: row.id,
  titleBn: row.titleBn,
  emoji: row.emoji,
  descriptionBn: row.descriptionBn,
  departmentSlugs: row.departmentSlugs,
  targetMinutes: row.targetMinutes,
});

/* -------------------------------------------------------------------------- */
/* Admin                                                                      */
/* -------------------------------------------------------------------------- */

export const toScholarApplication = (
  row: Row<typeof schema.scholarApplications>,
): ScholarApplication => ({
  id: row.id,
  nameBn: row.nameBn,
  nameEn: row.nameEn,
  madrasahBn: row.madrasahBn,
  district: row.district,
  departments: row.departments,
  credentialsBn: row.credentialsBn,
  submittedAt: iso(row.submittedAt),
  status: row.status,
  experienceYears: row.experienceYears,
  email: row.email,
});

export const toContentReport = (row: Row<typeof schema.contentReports>): ContentReport => ({
  id: row.id,
  contentType: row.contentType,
  contentTitleBn: row.contentTitleBn,
  contentHref: row.contentHref,
  reason: row.reason,
  reasonLabelBn: row.reasonLabelBn,
  reportedByBn: row.reportedByBn,
  reportedAt: iso(row.reportedAt),
  severity: row.severity,
  status: row.status,
  assignedToBn: row.assignedToBn ?? undefined,
});

export const toReviewItem = (row: Row<typeof schema.reviewItems>): ReviewItem => ({
  id: row.id,
  kind: row.kind,
  titleBn: row.titleBn,
  authorId: row.authorId,
  authorNameBn: row.authorNameBn,
  submittedAt: iso(row.submittedAt),
  departments: row.departments,
  referenceCount: row.referenceCount,
  wordCount: row.wordCount,
  status: row.status,
  flaggedReferences: row.flaggedReferences,
});

export const toActivityEntry = (row: Row<typeof schema.platformActivity>): ActivityEntry => ({
  id: row.id,
  actorBn: row.actorBn,
  actionBn: row.actionBn,
  targetBn: row.targetBn,
  at: iso(row.at),
  kind: row.kind,
});

export const toAdminUserRow = (
  row: Row<typeof schema.users>,
  status: AdminUserRow["status"],
): AdminUserRow => ({
  id: row.id,
  nameBn: row.name,
  email: row.email,
  role: row.role,
  district: row.district,
  status,
  joinedAt: iso(row.joinedAt),
  contributions: row.contributions,
});
