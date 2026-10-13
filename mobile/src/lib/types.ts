/**
 * Ilm — domain model (shared with the web app).
 *
 * Every shape here mirrors `src/lib/types.ts` on the web so data can move
 * between the two front ends without translation.
 */

export type Role = "admin" | "scholar" | "user";
export type Locale = "bn" | "en";

export interface Localized {
  bn: string;
  en: string;
}

export type MaybeLocalized = Partial<Localized> & { bn: string };

/* ----------------------------------------------------------------- people */

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  district: string;
  joinedAt: string;
  scholarId?: string;
  interests: string[];
  followingScholarIds: string[];
  followingDepartmentSlugs: string[];
  isVerified: boolean;
}

export interface Credential {
  id: string;
  title: Localized;
  institution: Localized;
  year: string;
}

export interface Scholar {
  id: string;
  slug: string;
  name: Localized;
  honorific: Localized;
  avatarColor: string;
  shortBio: Localized;
  bio: Localized;
  departmentIds: string[];
  primaryDepartmentId: string;
  specialization: Localized[];
  languages: string[];
  credentials: Credential[];
  madrasah: Localized;
  district: string;
  verified: boolean;
  availableForQuestions: boolean;
  responseTimeHours: number;
  rating: number;
  stats: {
    answers: number;
    articles: number;
    fatwas: number;
    followers: number;
    helpfulVotes: number;
  };
  joinedAt: string;
  fiqhFocus: ("hanafi" | "general" | "usul" | "comparative")[];
}

/* --------------------------------------------------------------- taxonomy */

export interface Department {
  id: string;
  slug: string;
  name: Localized;
  shortName: Localized;
  description: Localized;
  icon: string;
  tone: "primary" | "accent" | "info" | "success" | "warning" | "danger" | "scholar" | "user" | "admin";
  scholarIds: string[];
  trending: boolean;
  stats: { questions: number; answered: number; articles: number; fatwas: number; followers: number };
}

export interface Topic {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  departmentSlugs: string[];
  contentCount: number;
  trending: boolean;
}

/* ------------------------------------------------------------------ quran */

export type RevelationPlace = "meccan" | "medinan";

export interface QuranSurah {
  number: number;
  slug: string;
  nameArabic: string;
  name: Localized;
  meaning: Localized;
  ayahCount: number;
  revelation: RevelationPlace;
  hasText: boolean;
  juz: number;
  about?: Localized;
}

export interface QuranAyah {
  surah: number;
  number: number;
  ref: string;
  arabic: string;
  translationBn: string;
  translationEn: string;
  transliterationBn: string;
  tafsirBn?: string;
  sajda?: boolean;
}

/* ----------------------------------------------------------------- hadith */

export type HadithGrade = "sahih" | "hasan" | "daif" | "muttafaqun-alaih";

export interface HadithCollection {
  id: string;
  slug: string;
  name: Localized;
  author: Localized;
  nameArabic: string;
  description: Localized;
  hadithCount: number;
  authentic: boolean;
  bookCount: number;
  tone: "primary" | "accent" | "info" | "success";
}

export interface HadithBook {
  id: string;
  collectionSlug: string;
  number: number;
  name: Localized;
  hadithCount: number;
}

export interface Hadith {
  id: string;
  collectionSlug: string;
  collectionName: Localized;
  bookNumber: number;
  bookName: Localized;
  number: number;
  refBn: string;
  refEn: string;
  arabic: string;
  translationBn: string;
  translationEn: string;
  narrator: Localized;
  grade: HadithGrade;
  topicIds: string[];
  lessonBn?: string;
}

/* -------------------------------------------------------------------- dua */

export interface DuaCategory {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  icon: string;
  tone: "primary" | "accent" | "info" | "success" | "warning" | "danger";
}

export interface Dua {
  id: string;
  slug: string;
  categorySlug: string;
  title: Localized;
  arabic: string;
  transliterationBn: string;
  meaning: Localized;
  reference: Localized;
  occasion: Localized;
  repeat?: Localized;
  virtue?: Localized;
  tags: string[];
}

/* ------------------------------------------------------- authored content */

export type ContentStatus = "draft" | "in-review" | "published" | "changes-requested";

export interface Article {
  id: string;
  slug: string;
  title: Localized;
  excerpt: Localized;
  bodyBn: string[];
  authorId: string;
  departmentIds: string[];
  topicIds: string[];
  coverTone: string;
  status: ContentStatus;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  viewCount: number;
  bookmarkCount: number;
  likeCount: number;
  commentCount: number;
  referenceCount: number;
}

export type FatwaStatus = "draft" | "in-review" | "published";

export interface Fatwa {
  id: string;
  slug: string;
  questionBn: string;
  rulingBn: string;
  bodyBn: string[];
  questionerDistrict: string;
  muftiId: string;
  coSignerIds: string[];
  departmentIds: string[];
  fiqh: "hanafi" | "comparative";
  status: FatwaStatus;
  publishedAt: string;
  referenceCount: number;
  viewCount: number;
  bookmarkCount: number;
  pinned: boolean;
}

/* -------------------------------------------------------------------- Q&A */

export type QuestionStatus = "open" | "routed" | "answered" | "closed";
export type QuestionVisibility = "public" | "anonymous" | "private";

export interface Question {
  id: string;
  slug: string;
  titleBn: string;
  bodyBn: string;
  askerId: string;
  askerDistrict: string;
  visibility: QuestionVisibility;
  departmentIds: string[];
  topicIds: string[];
  status: QuestionStatus;
  createdAt: string;
  answeredAt?: string;
  views: number;
  followerCount: number;
  answerCount: number;
  fatwaRequested: boolean;
  urgency: "normal" | "urgent";
}

export interface Answer {
  id: string;
  questionId: string;
  scholarId: string;
  bodyBn: string;
  accepted: boolean;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  references: ContentReference[];
  becameFatwaSlug?: string;
}

export interface ContentReference {
  id: string;
  kind: "ayah" | "hadith";
  ref: string;
  arabic: string;
  translationBn: string;
  refBn: string;
  note?: string;
}

/* -------------------------------------------------------------- community */

export interface Discussion {
  id: string;
  slug: string;
  titleBn: string;
  bodyBn: string;
  authorId: string;
  departmentIds: string[];
  topicIds: string[];
  createdAt: string;
  replyCount: number;
  upvotes: number;
  viewCount: number;
  pinned: boolean;
  moderationState: "clean" | "under-review" | "locked";
  moderationNoteBn?: string;
  tags: string[];
}

/* ------------------------------------------- library & learning journey */

export type BookmarkKind =
  | "ayah"
  | "hadith"
  | "dua"
  | "article"
  | "fatwa"
  | "answer"
  | "question"
  | "discussion";

export interface Bookmark {
  id: string;
  kind: BookmarkKind;
  titleBn: string;
  previewBn: string;
  refBn: string;
  href: string;
  savedAt: string;
  collectionId?: string;
}

export interface BookmarkCollection {
  id: string;
  nameBn: string;
  tone: string;
  count: number;
}

export interface ReadingProgress {
  id: string;
  kind: "quran" | "article" | "hadith" | "journey";
  titleBn: string;
  subtitleBn: string;
  href: string;
  progress: number;
  lastReadAt: string;
  resumeLabelBn: string;
}

export interface JourneyDay {
  day: number;
  titleBn: string;
  subtitleBn: string;
  kind: "quran" | "hadith" | "reflection" | "quiz" | "article";
  minutes: number;
  completed: boolean;
  href: string;
}

export interface Journey {
  id: string;
  slug: string;
  titleBn: string;
  descriptionBn: string;
  durationLabelBn: string;
  enrolled: number;
  completedDays: number;
  totalDays: number;
  days: JourneyDay[];
  tone: string;
  categoryBn: string;
}

/* ------------------------------------------------------------------- feed */

export type FeedKind =
  | "daily-ayah"
  | "daily-hadith"
  | "answer"
  | "article"
  | "fatwa"
  | "discussion"
  | "question"
  | "journey";

export interface FeedItem {
  id: string;
  kind: FeedKind;
  reasonBn: string;
  createdAt: string;
  articleId?: string;
  fatwaId?: string;
  questionId?: string;
  discussionId?: string;
  scholarId?: string;
  ayahRef?: string;
  hadithId?: string;
  journeyId?: string;
}

/* ---------------------------------------------------------- notifications */

export type NotificationKind =
  | "answer"
  | "mention"
  | "follow"
  | "reshare"
  | "moderation"
  | "daily"
  | "journey"
  | "system";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  titleBn: string;
  bodyBn: string;
  createdAt: string;
  read: boolean;
  href: string;
  actorId?: string;
}

/* ------------------------------------------------------ prayer & location */

export interface District {
  id: string;
  name: Localized;
  division: Localized;
  lat: number;
  lng: number;
  timezone: string;
}

export type PrayerName = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface PrayerTime {
  name: PrayerName;
  label: Localized;
  time: string;
  passed: boolean;
  isCurrent: boolean;
  minutesAway: number;
}

export interface PrayerSchedule {
  district: District;
  date: Date;
  times: PrayerTime[];
  nextPrayer: PrayerTime;
  madhab: "hanafi" | "shafi";
}
