/**
 * Ilm — domain model.
 *
 * The UI phase runs entirely on the mock dataset in `src/lib/data`, but every
 * shape here is designed to map 1:1 onto the eventual backend schema so the
 * frontend does not need rewriting when the API lands.
 */

export type Role = "admin" | "scholar" | "user";

export type Locale = "bn" | "en";

/** Text that exists in both site languages. */
export interface Localized {
  bn: string;
  en: string;
}

/** Optional bilingual field. */
export type MaybeLocalized = Partial<Localized> & { bn: string };

/* -------------------------------------------------------------------------- */
/* People                                                                     */
/* -------------------------------------------------------------------------- */

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
  /** e.g. "দাওরা-এ-হাদীস", "MA in Islamic Studies" */
  title: Localized;
  institution: Localized;
  year: string;
}

/** A judgeable qualification line shown on a scholar profile. */
export interface Scholar {
  id: string;
  slug: string;
  name: Localized;
  /** Honorific, e.g. মুফতি / মুহাদ্দিস / ড. */
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
  /** Median first-response time, hours — powers the "usually replies in" hint. */
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
  /** Degrees of fiqh specialisation the scholar accepts questions within. */
  fiqhFocus: ("hanafi" | "general" | "usul" | "comparative")[];
}

/* -------------------------------------------------------------------------- */
/* Biography                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * A scholar's life, told in full.
 *
 * `Scholar` holds what the app *routes* on — departments, availability, the
 * statistics behind a profile card. This holds what a reader comes to a profile
 * page for: where the person was formed, who taught them, what they were
 * authorised to teach, what they have written, and who they taught in turn. The
 * two are separate because a card must stay cheap to render while a biography is
 * long-form prose that only one page ever asks for.
 *
 * Education is deliberately *not* repeated here: `Scholar.credentials` already
 * records it, and a biography that restated it would be a second source of truth
 * for the same degrees.
 */
export interface ScholarBiography {
  scholarId: string;
  /** Birth: the year, the village or town, the family — one sentence. */
  born: Localized;
  /** The household and the upbringing, one paragraph. */
  family: Localized;
  /**
   * The life story, paragraphs separated by a blank line.
   *
   * Every paragraph ends in a full stop: the prose renderer treats a short line
   * without terminal punctuation as a heading, which is right for a manuscript
   * and wrong for a biography.
   */
  narrative: Localized;
  /** What they are doing now — the biography's present tense. */
  now: Localized;
  /** Who they sat with, and what they took from each. */
  teachers: BioTeacher[];
  /** Formal authorisations (ইজাযা): what they may teach, and from whom. */
  ijazah: BioIjazah[];
  /** Positions held: teaching, ifta, boards, khidmah. */
  service: BioService[];
  /** Books, editions, translations and research. */
  works: BioWork[];
  /** Students who carry the teaching on. */
  students: BioStudent[];
  /** Honours and recognition — sparingly, and only where it is a fact. */
  awards: BioAward[];
  /** Where this biography comes from. Trust is the point of the section. */
  sources: Localized[];
  /** When the biography was last checked against those sources. */
  updatedAt: string;
}

export interface BioTeacher {
  id: string;
  name: Localized;
  /** What they studied with them, and where. */
  note: Localized;
}

export interface BioIjazah {
  id: string;
  /** The authorisation, e.g. "সহীহ বুখারীর সনদ". */
  title: Localized;
  /** Who granted it, and when. */
  grantedBy: Localized;
}

export interface BioService {
  id: string;
  title: Localized;
  place: Localized;
  /** e.g. "২০০৮–২০১৬". */
  period: Localized;
  note?: Localized;
}

export interface BioWork {
  id: string;
  title: Localized;
  /** e.g. "২০১৯". */
  year: Localized;
  /** What kind of work it is — a book, a translation, a research paper. */
  kind: Localized;
  /** One line on what is in it. */
  note: Localized;
}

export interface BioStudent {
  id: string;
  name: Localized;
  note: Localized;
}

export interface BioAward {
  id: string;
  title: Localized;
  year: Localized;
  note?: Localized;
}

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                   */
/* -------------------------------------------------------------------------- */

export interface Department {
  id: string;
  slug: string;
  name: Localized;
  shortName: Localized;
  description: Localized;
  /** Lucide icon name. */
  icon: string;
  /** Token stem used for tinting, e.g. "primary" | "accent" | "info". */
  tone: "primary" | "accent" | "info" | "success" | "warning" | "danger" | "scholar" | "user" | "admin";
  scholarIds: string[];
  trending: boolean;
  stats: {
    questions: number;
    answered: number;
    articles: number;
    fatwas: number;
    followers: number;
  };
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

/* -------------------------------------------------------------------------- */
/* Quran                                                                      */
/* -------------------------------------------------------------------------- */

export type RevelationPlace = "meccan" | "medinan";

export interface QuranSurah {
  number: number;
  slug: string;
  nameArabic: string;
  name: Localized;
  meaning: Localized;
  ayahCount: number;
  revelation: RevelationPlace;
  /** Whether the local dataset actually contains this surah's text yet. */
  hasText: boolean;
  /** Display grouping used by the index page (Juz / Para). */
  juz: number;
  /** Short "about this surah" note for the reader header. */
  about?: Localized;
}

export interface QuranAyah {
  surah: number;
  number: number;
  /** e.g. "2:255" */
  ref: string;
  arabic: string;
  /** Islamic Foundation Bangladesh style Bangla translation. */
  translationBn: string;
  translationEn: string;
  /** Bengali pronunciation aid (উচ্চারণ) — a signature feature for BD readers. */
  transliterationBn: string;
  /** Optional short tafsir note. */
  tafsirBn?: string;
  sajda?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Hadith                                                                     */
/* -------------------------------------------------------------------------- */

export type HadithGrade = "sahih" | "hasan" | "daif" | "muttafaqun-alaih";

export interface HadithCollection {
  id: string;
  slug: string;
  name: Localized;
  author: Localized;
  /** Arabic title of the collection. */
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
  /** e.g. "সহীহ বুখারী ১২৭" */
  refBn: string;
  refEn: string;
  arabic: string;
  translationBn: string;
  translationEn: string;
  narrator: Localized;
  grade: HadithGrade;
  topicIds: string[];
  /** Short Bangla explanation of the lesson the hadith carries. */
  lessonBn?: string;
}

/* -------------------------------------------------------------------------- */
/* Dua                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * A group of duas by the moment they belong to — waking, eating, travelling.
 *
 * The grouping is by *occasion* rather than by source, because that is how a
 * reader arrives at a dua: nobody wakes up wanting "a hadith-collection dua",
 * they want the one for waking up.
 */
export interface DuaCategory {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  /** Lucide icon name, resolved through the icon map. */
  icon: string;
  tone: "primary" | "accent" | "info" | "success" | "warning" | "danger";
}

/**
 * One dua, with everything needed to say it and to trust it.
 *
 * `arabic` is never optional and `reference` is never guessed: a dua without a
 * source is not a dua this app will show. The transliteration is Bangla script
 * (উচ্চারণ) rather than Latin, matching the Quran reader — a Bangladeshi reader
 * who cannot read Arabic fluently still needs to say the words correctly.
 */
export interface Dua {
  id: string;
  slug: string;
  categorySlug: string;
  title: Localized;
  arabic: string;
  transliterationBn: string;
  meaning: Localized;
  /** e.g. "সূরা আল-বাকারা ২:২৫৫" or "সহীহ বুখারী ৬৩২৪". */
  reference: Localized;
  /** When to say it — the line a reader scans before reading the Arabic. */
  occasion: Localized;
  /** How many times, where a count is part of the practice. */
  repeat?: Localized;
  /** The virtue or promise attached to it, when the source states one. */
  virtue?: Localized;
  /** Search keywords in both scripts plus Latin, for the palette and the filter. */
  tags: string[];
}

/* -------------------------------------------------------------------------- */
/* Authored content                                                           */
/* -------------------------------------------------------------------------- */

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
  /** Ayat/hadith the scholar attached via Smart References. */
  referenceCount: number;
}

export type FatwaStatus = "draft" | "in-review" | "published";

export interface Fatwa {
  id: string;
  slug: string;
  questionBn: string;
  /** Concise ruling — the "জবাব" line shown at the top of the fatwa. */
  rulingBn: string;
  bodyBn: string[];
  questionerDistrict: string;
  muftiId: string;
  /** Co-signing muftis for a collective fatwa. */
  coSignerIds: string[];
  departmentIds: string[];
  fiqh: "hanafi" | "comparative";
  status: FatwaStatus;
  publishedAt: string;
  referenceCount: number;
  viewCount: number;
  bookmarkCount: number;
  /** Important or frequently-asked rulings get pinned in the index. */
  pinned: boolean;
}

/* -------------------------------------------------------------------------- */
/* Q&A                                                                        */
/* -------------------------------------------------------------------------- */

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
  /** Does the asker want a formal fatwa rather than a general answer? */
  fatwaRequested: boolean;
  urgency: "normal" | "urgent";
}

export interface Answer {
  id: string;
  questionId: string;
  scholarId: string;
  bodyBn: string;
  /** Marked by the asker as the accepted answer. */
  accepted: boolean;
  createdAt: string;
  upvotes: number;
  downvotes: number;
  references: ContentReference[];
  /** A scholar may escalate a general answer into a formal fatwa. */
  becameFatwaSlug?: string;
}

/** A Qur'an or Hadith citation attached to authored content. */
export interface ContentReference {
  id: string;
  kind: "ayah" | "hadith";
  /** "2:255" for ayah, or hadith id. */
  ref: string;
  /** Snapshot of the cited text so the UI renders without a second lookup. */
  arabic: string;
  translationBn: string;
  refBn: string;
  note?: string;
}

/* -------------------------------------------------------------------------- */
/* Smart references (the scholar writing assistant)                           */
/* -------------------------------------------------------------------------- */

export interface ReferenceSuggestion {
  id: string;
  kind: "ayah" | "hadith";
  /** 0–1 relevance, drives the confidence chip. */
  score: number;
  /** Bangla keywords that triggered this suggestion. */
  matchedTerms: string[];
  reasonBn: string;
  arabic: string;
  translationBn: string;
  refBn: string;
  /** Surah/topic context line, e.g. "সূরা আল-বাকারা · আয়াত ২৫৫". */
  contextBn: string;
  topicTags: string[];
}

/* -------------------------------------------------------------------------- */
/* Question routing                                                           */
/* -------------------------------------------------------------------------- */

export interface RoutingCandidate {
  scholarId: string;
  /** 0–100, blends department overlap, expertise, load and response time. */
  score: number;
  reasonsBn: string[];
  matchedDepartmentIds: string[];
  /** Position in the priority queue shown to scholars. */
  priority: number;
}

/* -------------------------------------------------------------------------- */
/* Community                                                                  */
/* -------------------------------------------------------------------------- */

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
  /** Community threads are moderated; `moderationNote` surfaces why. */
  pinned: boolean;
  moderationState: "clean" | "under-review" | "locked";
  moderationNoteBn?: string;
  tags: string[];
}

export interface DiscussionReply {
  id: string;
  discussionId: string;
  authorId: string;
  bodyBn: string;
  createdAt: string;
  upvotes: number;
  isScholarReply: boolean;
  accepted: boolean;
}

/* -------------------------------------------------------------------------- */
/* Personal library & learning journey                                        */
/* -------------------------------------------------------------------------- */

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
  /** User-defined collection, e.g. "রমজান প্রস্তুতি". */
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
  /** 0–100 */
  progress: number;
  lastReadAt: string;
  /** Where exactly to resume. */
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
  /** e.g. "৭ দিনে জান্নাতের পথ" */
  durationLabelBn: string;
  enrolled: number;
  completedDays: number;
  totalDays: number;
  days: JourneyDay[];
  tone: string;
  categoryBn: string;
}

/* -------------------------------------------------------------------------- */
/* Feed                                                                       */
/* -------------------------------------------------------------------------- */

export type FeedKind = "daily-ayah" | "daily-hadith" | "answer" | "article" | "fatwa" | "discussion" | "question" | "journey";

export interface FeedItem {
  id: string;
  kind: FeedKind;
  /** Why the user is seeing this — powers the transparency row. */
  reasonBn: string;
  createdAt: string;
  /* polymorphic payload ids */
  articleId?: string;
  fatwaId?: string;
  questionId?: string;
  discussionId?: string;
  scholarId?: string;
  ayahRef?: string;
  hadithId?: string;
  journeyId?: string;
}

/* -------------------------------------------------------------------------- */
/* Notifications                                                              */
/* -------------------------------------------------------------------------- */

export type NotificationKind = "answer" | "mention" | "follow" | "reshare" | "moderation" | "daily" | "journey" | "system";

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

/* -------------------------------------------------------------------------- */
/* Prayer times & location                                                    */
/* -------------------------------------------------------------------------- */

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
  /** "05:04" 24h local time. */
  time: string;
  /** True when this prayer has passed today. */
  passed: boolean;
  isCurrent: boolean;
  /** Minutes until it begins; negative once passed. */
  minutesAway: number;
}

export interface PrayerSchedule {
  district: District;
  date: Date;
  times: PrayerTime[];
  nextPrayer: PrayerTime;
  /** Hanafi asr is the default for Bangladesh. */
  madhab: "hanafi" | "shafi";
}

/* -------------------------------------------------------------------------- */
/* Admin analytics                                                            */
/* -------------------------------------------------------------------------- */

export interface StatPoint {
  labelBn: string;
  value: number;
  previous?: number;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface AdminOverview {
  totalUsers: number;
  activeToday: number;
  totalScholars: number;
  pendingScholarApplications: number;
  openQuestions: number;
  unansweredOver24h: number;
  publishedFatwas: number;
  pendingReview: number;
  flaggedContent: number;
  quranReads7d: number;
  dailyActiveTrend: TimeSeriesPoint[];
  questionsTrend: TimeSeriesPoint[];
  topDepartments: StatPoint[];
  districtBreakdown: StatPoint[];
}

/* -------------------------------------------------------------------------- */
/* Scholar console                                                            */
/* -------------------------------------------------------------------------- */

export interface ScholarDashboard {
  scholarId: string;
  routedQuestions: number;
  answeredThisWeek: number;
  avgResponseHours: number;
  helpfulRate: number;
  totalViews: number;
  newFollowers: number;
  pendingDrafts: number;
  streakDays: number;
  weeklyAnswers: TimeSeriesPoint[];
  topDepartments: StatPoint[];
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export interface NavItem {
  href: string;
  labelBn: string;
  labelEn: string;
  icon: string;
  /** Optional badge count rendered on the nav pill. */
  badge?: number;
  /** Hide from the primary rails; used by the overflow menu. */
  secondary?: boolean;
}
