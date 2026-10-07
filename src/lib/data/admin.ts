import type {
  AdminOverview,
  ScholarDashboard,
  StatPoint,
  TimeSeriesPoint,
} from "@/lib/types";

/**
 * Admin and scholar-console data.
 *
 * Numbers are modelled on a platform with a Bangladeshi audience: Dhaka and
 * Chattogram dominate, fiqh and family dominate the question volume, and the
 * daily-active curve peaks after Isha when people are free to read.
 */

/* -------------------------------------------------------------------------- */
/* Platform overview                                                          */
/* -------------------------------------------------------------------------- */

/** 14 days ending 6 October 2026. */
const DAILY_ACTIVE_TREND: TimeSeriesPoint[] = [
  { label: "২৩ সেপ্ট", value: 19400 },
  { label: "২৪ সেপ্ট", value: 20100 },
  { label: "২৫ সেপ্ট", value: 19850 },
  { label: "২৬ সেপ্ট", value: 21300 },
  { label: "২৭ সেপ্ট", value: 22800 },
  { label: "২৮ সেপ্ট", value: 21750 },
  { label: "২৯ সেপ্ট", value: 22400 },
  { label: "৩০ সেপ্ট", value: 23300 },
  { label: "০১ অক্টো", value: 22950 },
  { label: "০২ অক্টো", value: 24600 },
  { label: "০৩ অক্টো", value: 25100 },
  { label: "০৪ অক্টো", value: 24200 },
  { label: "০৫ অক্টো", value: 26300 },
  { label: "০৬ অক্টো", value: 26050 },
];

const QUESTIONS_TREND: TimeSeriesPoint[] = [
  { label: "২৩ সেপ্ট", value: 318 },
  { label: "২৪ সেপ্ট", value: 342 },
  { label: "২৫ সেপ্ট", value: 305 },
  { label: "২৬ সেপ্ট", value: 361 },
  { label: "২৭ সেপ্ট", value: 388 },
  { label: "২৮ সেপ্ট", value: 354 },
  { label: "২৯ সেপ্ট", value: 372 },
  { label: "৩০ সেপ্ট", value: 396 },
  { label: "০১ অক্টো", value: 381 },
  { label: "০২ অক্টো", value: 412 },
  { label: "০৩ অক্টো", value: 428 },
  { label: "০৪ অক্টো", value: 405 },
  { label: "০৫ অক্টো", value: 447 },
  { label: "০৬ অক্টো", value: 436 },
];

const TOP_DEPARTMENTS: StatPoint[] = [
  { labelBn: "ফিকহ", value: 4280, previous: 3910 },
  { labelBn: "পরিবার ও বিবাহ", value: 3560, previous: 3320 },
  { labelBn: "ইবাদত", value: 2940, previous: 3010 },
  { labelBn: "অর্থনীতি ও ব্যাংকিং", value: 2410, previous: 2050 },
  { labelBn: "আখলাক ও আত্মশুদ্ধি", value: 1980, previous: 1740 },
  { labelBn: "কুরআন ও তাফসীর", value: 1740, previous: 1580 },
  { labelBn: "তরুণ ও শিক্ষার্থী", value: 1520, previous: 1290 },
  { labelBn: "হাদীস", value: 1180, previous: 1140 },
];

const DISTRICT_BREAKDOWN: StatPoint[] = [
  { labelBn: "ঢাকা", value: 62000 },
  { labelBn: "চট্টগ্রাম", value: 34000 },
  { labelBn: "সিলেট", value: 15000 },
  { labelBn: "রাজশাহী", value: 12000 },
  { labelBn: "খুলনা", value: 11000 },
  { labelBn: "রংপুর", value: 9000 },
  { labelBn: "কুমিল্লা", value: 9000 },
  { labelBn: "ময়মনসিংহ", value: 8000 },
  { labelBn: "বরিশাল", value: 7000 },
  { labelBn: "বগুড়া", value: 6000 },
  { labelBn: "নোয়াখালী", value: 5000 },
  { labelBn: "কক্সবাজার", value: 4000 },
];

export const ADMIN_OVERVIEW: AdminOverview = {
  totalUsers: 184000,
  activeToday: 26050,
  totalScholars: 148,
  pendingScholarApplications: 9,
  openQuestions: 312,
  unansweredOver24h: 27,
  publishedFatwas: 1840,
  pendingReview: 23,
  flaggedContent: 6,
  quranReads7d: 412380,
  dailyActiveTrend: DAILY_ACTIVE_TREND,
  questionsTrend: QUESTIONS_TREND,
  topDepartments: TOP_DEPARTMENTS,
  districtBreakdown: DISTRICT_BREAKDOWN,
};

/* -------------------------------------------------------------------------- */
/* Scholar dashboards                                                          */
/* -------------------------------------------------------------------------- */

const WEEK_LABELS = ["শনি", "রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র"];

function week(values: number[]): TimeSeriesPoint[] {
  return WEEK_LABELS.map((label, i) => ({ label, value: values[i] ?? 0 }));
}

export const SCHOLAR_DASHBOARD: ScholarDashboard = {
  scholarId: "scholar-1",
  routedQuestions: 18,
  answeredThisWeek: 24,
  avgResponseHours: 6.4,
  helpfulRate: 96,
  totalViews: 128400,
  newFollowers: 312,
  pendingDrafts: 3,
  streakDays: 41,
  weeklyAnswers: week([5, 4, 6, 3, 2, 4, 0]),
  topDepartments: [
    { labelBn: "ফিকহ", value: 46, previous: 39 },
    { labelBn: "পরিবার ও বিবাহ", value: 28, previous: 24 },
    { labelBn: "লেনদেন ও অর্থনীতি", value: 17, previous: 12 },
    { labelBn: "ইবাদত", value: 11, previous: 14 },
  ],
};

export const SCHOLAR_DASHBOARDS: Record<string, ScholarDashboard> = {
  "scholar-1": SCHOLAR_DASHBOARD,
  "scholar-3": {
    scholarId: "scholar-3",
    routedQuestions: 14,
    answeredThisWeek: 19,
    avgResponseHours: 8.2,
    helpfulRate: 94,
    totalViews: 96750,
    newFollowers: 268,
    pendingDrafts: 2,
    streakDays: 28,
    weeklyAnswers: week([3, 4, 3, 4, 2, 3, 0]),
    topDepartments: [
      { labelBn: "অর্থনীতি ও ব্যাংকিং", value: 52, previous: 44 },
      { labelBn: "ফিকহ", value: 21, previous: 22 },
      { labelBn: "হালাল-হারাম ও খাদ্য", value: 9, previous: 7 },
      { labelBn: "প্রযুক্তি ও আধুনিক বিষয়", value: 7, previous: 4 },
    ],
  },
  "scholar-6": {
    scholarId: "scholar-6",
    routedQuestions: 22,
    answeredThisWeek: 31,
    avgResponseHours: 3.1,
    helpfulRate: 97,
    totalViews: 143200,
    newFollowers: 405,
    pendingDrafts: 1,
    streakDays: 63,
    weeklyAnswers: week([6, 5, 7, 4, 3, 6, 0]),
    topDepartments: [
      { labelBn: "ইবাদত", value: 48, previous: 41 },
      { labelBn: "ফিকহ", value: 26, previous: 28 },
      { labelBn: "আখলাক ও আত্মশুদ্ধি", value: 14, previous: 11 },
      { labelBn: "পরিবার ও বিবাহ", value: 8, previous: 9 },
    ],
  },
  "scholar-12": {
    scholarId: "scholar-12",
    routedQuestions: 9,
    answeredThisWeek: 11,
    avgResponseHours: 11.7,
    helpfulRate: 91,
    totalViews: 54200,
    newFollowers: 187,
    pendingDrafts: 4,
    streakDays: 15,
    weeklyAnswers: week([2, 1, 3, 2, 1, 2, 0]),
    topDepartments: [
      { labelBn: "প্রযুক্তি ও আধুনিক বিষয়", value: 41, previous: 30 },
      { labelBn: "অর্থনীতি ও ব্যাংকিং", value: 19, previous: 15 },
      { labelBn: "ফিকহ", value: 12, previous: 13 },
      { labelBn: "তরুণ ও শিক্ষার্থী", value: 9, previous: 6 },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Scholar applications                                                       */
/* -------------------------------------------------------------------------- */

export interface ScholarApplication {
  id: string;
  nameBn: string;
  nameEn: string;
  madrasahBn: string;
  district: string;
  departments: string[];
  credentialsBn: string[];
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  experienceYears: number;
  email: string;
}

export const SCHOLAR_APPLICATIONS: ScholarApplication[] = [
  {
    id: "app-1",
    nameBn: "মুফতি হাবিবুল্লাহ কাসেমী",
    nameEn: "Mufti Habibullah Qasemi",
    madrasahBn: "জামিয়া ইসলামিয়া পটিয়া",
    district: "chattogram",
    departments: ["fiqh", "finance"],
    credentialsBn: ["দাওরা-এ-হাদীস, জামিয়া ইসলামিয়া পটিয়া", "ইফতা কোর্স, দারুল ইফতা", "আরবি সাহিত্যে স্নাতকোত্তর"],
    submittedAt: "2026-10-05T11:20:00+06:00",
    status: "pending",
    experienceYears: 12,
    email: "habibullah.qasemi@example.com",
  },
  {
    id: "app-2",
    nameBn: "ড. নুসরাত জাহান",
    nameEn: "Dr. Nusrat Jahan",
    madrasahBn: "ইসলামিক ইউনিভার্সিটি, কুষ্টিয়া",
    district: "khulna",
    departments: ["women", "family", "medical"],
    credentialsBn: [
      "ইসলামিক স্টাডিজে পিএইচডি, ইসলামি বিশ্ববিদ্যালয়",
      "মহিলাদের ফিকহ কোর্স, ৩ বছর",
      "মানসিক স্বাস্থ্য কাউন্সেলিং সার্টিফিকেট",
    ],
    submittedAt: "2026-10-04T16:45:00+06:00",
    status: "pending",
    experienceYears: 9,
    email: "nusrat.jahan@example.com",
  },
  {
    id: "app-3",
    nameBn: "হাফেজ মাওলানা সিরাজুল ইসলাম",
    nameEn: "Hafez Mawlana Sirajul Islam",
    madrasahBn: "আল-হেরা মাদরাসা, ঢাকা",
    district: "dhaka",
    departments: ["hadith", "quran-tafsir"],
    credentialsBn: ["হিফজুল কুরআন (৩০ পারা)", "দাওরা-এ-হাদীস", "১০ বছরের দরস পরিচালনার অভিজ্ঞতা"],
    submittedAt: "2026-10-03T09:10:00+06:00",
    status: "pending",
    experienceYears: 10,
    email: "sirajul.islam@example.com",
  },
  {
    id: "app-4",
    nameBn: "মুফতি আব্দুল্লাহ আল-মাক্কী",
    nameEn: "Mufti Abdullah Al Makki",
    madrasahBn: "দারুল উলুম দেওবন্দ ধারা, সিলেট",
    district: "sylhet",
    departments: ["aqeedah", "dawah"],
    credentialsBn: ["দাওরা-এ-হাদীস", "তুলনামূলক ধর্মতত্ত্বে ডিপ্লোমা", "খ্রিস্টান-হিন্দু ধর্মীয় সংলাপে ৬ বছর"],
    submittedAt: "2026-10-02T14:30:00+06:00",
    status: "pending",
    experienceYears: 14,
    email: "abdullah.makki@example.com",
  },
  {
    id: "app-5",
    nameBn: "উস্তাদা রুমানা আক্তার",
    nameEn: "Ustadha Rumana Akter",
    madrasahBn: "মারকাযুল ফিকহ, রাজশাহী",
    district: "rajshahi",
    departments: ["akhlaq", "women"],
    credentialsBn: ["নারীর ফিকহে বিশেষ কোর্স", "তাযকিয়া ও আত্মশুদ্ধিতে ৫ বছরের দরস", "বাংলা ও আরবি ভাষায় দক্ষ"],
    submittedAt: "2026-09-30T19:05:00+06:00",
    status: "approved",
    experienceYears: 7,
    email: "rumana.akter@example.com",
  },
  {
    id: "app-6",
    nameBn: "মাওলানা তাইয়্যেব হোসেন",
    nameEn: "Mawlana Tayyeb Hossain",
    madrasahBn: "জামিয়া রাহমানিয়া, বরিশাল",
    district: "barishal",
    departments: ["technology", "halal-food"],
    credentialsBn: ["দাওরা-এ-হাদীস", "কম্পিউটার সায়েন্সে স্নাতক", "ইসলামি ফাইন্যান্স কোর্স সম্পন্ন"],
    submittedAt: "2026-09-28T10:50:00+06:00",
    status: "rejected",
    experienceYears: 5,
    email: "tayyeb.hossain@example.com",
  },
];

/* -------------------------------------------------------------------------- */
/* Content reports                                                            */
/* -------------------------------------------------------------------------- */

export interface ContentReport {
  id: string;
  contentType: "question" | "answer" | "article" | "fatwa" | "discussion" | "comment";
  contentTitleBn: string;
  contentHref: string;
  reason: "misinformation" | "sectarian" | "abuse" | "spam" | "off-topic" | "copyright";
  reasonLabelBn: string;
  reportedByBn: string;
  reportedAt: string;
  severity: "low" | "medium" | "high";
  status: "pending" | "resolved" | "dismissed";
  assignedToBn?: string;
}

export const REPORTS: ContentReport[] = [
  {
    id: "rep-1",
    contentType: "answer",
    contentTitleBn: "সুদ পরিশোধ না করলে কি ঈমান বাতিল হয়ে যায়?",
    contentHref: "/questions/sud-na-dile-imaan-batil",
    reason: "misinformation",
    reasonLabelBn: "ভুল তথ্য — দলিলবিহীন কঠোর ফতোয়া",
    reportedByBn: "মোহাম্মদ রফিকুল ইসলাম",
    reportedAt: "2026-10-06T07:40:00+06:00",
    severity: "high",
    status: "pending",
    assignedToBn: "মুফতি আব্দুর রহমান",
  },
  {
    id: "rep-2",
    contentType: "discussion",
    contentTitleBn: "অমুক মসজিদের ইমাম সম্পর্কে যা জানা দরকার",
    contentHref: "/discussions/amuk-mosjider-imam",
    reason: "sectarian",
    reasonLabelBn: "দলাদলি উসকে দেওয়ার চেষ্টা ও নির্দিষ্ট ব্যক্তিকে লক্ষ্যবস্তু করা",
    reportedByBn: "সাদিয়া আফরিন",
    reportedAt: "2026-10-05T21:15:00+06:00",
    severity: "high",
    status: "pending",
    assignedToBn: "মডারেশন টিম",
  },
  {
    id: "rep-3",
    contentType: "comment",
    contentTitleBn: "পোস্টের কমেন্টে ব্যক্তিগত অপমান",
    contentHref: "/discussions/moner-ashaanti-tawakkul-o-pesonal-care",
    reason: "abuse",
    reasonLabelBn: "অপমানসূচক ভাষা ও ব্যক্তিগত আক্রমণ",
    reportedByBn: "ইমরান কবির",
    reportedAt: "2026-10-05T18:05:00+06:00",
    severity: "medium",
    status: "pending",
  },
  {
    id: "rep-4",
    contentType: "article",
    contentTitleBn: "সহজ উপায়ে দ্রুত টাকা ইনকাম করুন",
    contentHref: "/articles/sahaj-upaye-drauto-taka",
    reason: "spam",
    reasonLabelBn: "স্প্যাম — বাইরের লিংকে ট্রাফিক পাঠানোর চেষ্টা",
    reportedByBn: "হাসান মাহমুদ",
    reportedAt: "2026-10-04T13:25:00+06:00",
    severity: "low",
    status: "resolved",
    assignedToBn: "কনটেন্ট টিম",
  },
  {
    id: "rep-5",
    contentType: "fatwa",
    contentTitleBn: "ক্রিপ্টোকারেন্সি লেনদেন পূর্ণ হারাম — কোনো ব্যতিক্রম নেই",
    contentHref: "/fatwas/crypto-lenden-porne-haram",
    reason: "misinformation",
    reasonLabelBn: "শর্তহীন রায় — ফিকহি বিশ্লেষণ ব্যতিরেকে দেওয়া হয়েছে",
    reportedByBn: "আবু বকর সিদ্দিক",
    reportedAt: "2026-10-04T09:50:00+06:00",
    severity: "medium",
    status: "pending",
    assignedToBn: "মুফতি রহিমুল্লাহ",
  },
  {
    id: "rep-6",
    contentType: "question",
    contentTitleBn: "সেকুলার স্কুলে পড়ালেখা করা কি জায়েজ?",
    contentHref: "/questions/sekular-skule-porashona-jayez-ki",
    reason: "off-topic",
    reasonLabelBn: "বিষয়ের বাইরে গিয়ে রাজনৈতিক আলোচনায় গড়িয়েছে",
    reportedByBn: "নূর মোহাম্মদ আকন্দ",
    reportedAt: "2026-10-03T15:30:00+06:00",
    severity: "low",
    status: "dismissed",
  },
  {
    id: "rep-7",
    contentType: "article",
    contentTitleBn: "প্রিয় নবীর প্রামাণ্য জীবনী (অনুলিখিত)",
    contentHref: "/articles/priyo-nobir-jiboni",
    reason: "copyright",
    reasonLabelBn: "অনুমতি ছাড়া হুবহু কপি করা হয়েছে",
    reportedByBn: "শাহাদাত হোসেন",
    reportedAt: "2026-10-02T11:20:00+06:00",
    severity: "medium",
    status: "resolved",
    assignedToBn: "কনটেন্ট টিম",
  },
  {
    id: "rep-8",
    contentType: "discussion",
    contentTitleBn: "যৌতুক নিয়ে দুই পরিবারের নাম উল্লেখ করে অভিযোগ",
    contentHref: "/discussions/joutuk-chara-bibaho-bangladesh-somaj",
    reason: "abuse",
    reasonLabelBn: "দুই পরিবারের নাম প্রকাশ করে ব্যক্তিগত অভিযোগ",
    reportedByBn: "তানজিলা রহমান",
    reportedAt: "2026-09-27T19:40:00+06:00",
    severity: "medium",
    status: "resolved",
    assignedToBn: "মডারেশন টিম",
  },
];

/* -------------------------------------------------------------------------- */
/* Review queue                                                               */
/* -------------------------------------------------------------------------- */

export interface ReviewItem {
  id: string;
  kind: "article" | "fatwa";
  titleBn: string;
  authorId: string;
  authorNameBn: string;
  submittedAt: string;
  departments: string[];
  referenceCount: number;
  wordCount: number;
  status: "pending" | "in-review" | "changes-requested";
  /** References a reviewer flagged as weak or wrongly attributed. */
  flaggedReferences: number;
}

export const REVIEW_QUEUE: ReviewItem[] = [
  {
    id: "review-1",
    kind: "article",
    titleBn: "সুদমুক্ত জীবনের প্রথম ধাপ: ঋণ থেকে বের হওয়ার কৌশল",
    authorId: "scholar-3",
    authorNameBn: "মুফতি সাইফুল ইসলাম",
    submittedAt: "2026-10-06T09:15:00+06:00",
    departments: ["finance", "fiqh"],
    referenceCount: 7,
    wordCount: 1840,
    status: "pending",
    flaggedReferences: 0,
  },
  {
    id: "review-2",
    kind: "fatwa",
    titleBn: "সঞ্চয়পত্র ও ডিপিএসের মুনাফা কি হালাল?",
    authorId: "scholar-3",
    authorNameBn: "মুফতি সাইফুল ইসলাম",
    submittedAt: "2026-10-05T20:30:00+06:00",
    departments: ["finance"],
    referenceCount: 5,
    wordCount: 1220,
    status: "in-review",
    flaggedReferences: 1,
  },
  {
    id: "review-3",
    kind: "article",
    titleBn: "সন্তানের প্রথম ৭ বছরে দ্বীনি ভিত্তি",
    authorId: "scholar-5",
    authorNameBn: "ড. ফরিদা ইয়াসমিন",
    submittedAt: "2026-10-05T14:05:00+06:00",
    departments: ["family", "akhlaq"],
    referenceCount: 9,
    wordCount: 2100,
    status: "pending",
    flaggedReferences: 0,
  },
  {
    id: "review-4",
    kind: "article",
    titleBn: "ক্রিপ্টোকারেন্সি ও অনলাইন আয়: শরীয়াহ সীমা নির্ণয়ের পদ্ধতি",
    authorId: "scholar-12",
    authorNameBn: "মুফতি রহিমুল্লাহ",
    submittedAt: "2026-10-04T18:50:00+06:00",
    departments: ["technology", "finance"],
    referenceCount: 6,
    wordCount: 1650,
    status: "changes-requested",
    flaggedReferences: 2,
  },
  {
    id: "review-5",
    kind: "fatwa",
    titleBn: "রমজানে অসুস্থ ব্যক্তির রোযা ও ফিদইয়ার বিধান",
    authorId: "scholar-6",
    authorNameBn: "মুফতি নুরুল আমিন",
    submittedAt: "2026-10-04T10:20:00+06:00",
    departments: ["ibadah", "fiqh"],
    referenceCount: 8,
    wordCount: 1440,
    status: "in-review",
    flaggedReferences: 0,
  },
  {
    id: "review-6",
    kind: "article",
    titleBn: "সোশ্যাল মিডিয়ায় গীবত: অনলাইন সমালোচনার ফিকহি সীমা",
    authorId: "scholar-10",
    authorNameBn: "উস্তাদা সুমাইয়া খানম",
    submittedAt: "2026-10-03T16:40:00+06:00",
    departments: ["akhlaq", "technology"],
    referenceCount: 11,
    wordCount: 2380,
    status: "pending",
    flaggedReferences: 1,
  },
  {
    id: "review-7",
    kind: "fatwa",
    titleBn: "সেকেন্ড হ্যান্ড পণ্যে ত্রুটি গোপন করার বিধান",
    authorId: "scholar-1",
    authorNameBn: "মুফতি আব্দুর রহমান",
    submittedAt: "2026-10-02T12:15:00+06:00",
    departments: ["fiqh", "finance"],
    referenceCount: 4,
    wordCount: 980,
    status: "in-review",
    flaggedReferences: 0,
  },
];

/* -------------------------------------------------------------------------- */
/* Activity log                                                               */
/* -------------------------------------------------------------------------- */

export interface ActivityEntry {
  id: string;
  actorBn: string;
  actionBn: string;
  targetBn: string;
  at: string;
  kind: "publish" | "scholar" | "moderation" | "user" | "system";
}

export const PLATFORM_ACTIVITY: ActivityEntry[] = [
  {
    id: "act-1",
    actorBn: "মুফতি সাইফুল ইসলাম",
    actionBn: "পর্যালোচনার জন্য জমা দিয়েছেন",
    targetBn: "সুদমুক্ত জীবনের প্রথম ধাপ",
    at: "2026-10-06T09:15:00+06:00",
    kind: "publish",
  },
  {
    id: "act-2",
    actorBn: "অ্যাডমিন (মাহবুব আলম)",
    actionBn: "নতুন আলেম প্রোফাইল যাচাই করেছেন",
    targetBn: "উস্তাদা রুমানা আক্তার",
    at: "2026-10-06T08:40:00+06:00",
    kind: "scholar",
  },
  {
    id: "act-3",
    actorBn: "মডারেশন টিম",
    actionBn: "রিপোর্ট নিষ্পত্তি করেছেন",
    targetBn: "সহজ উপায়ে দ্রুত টাকা ইনকাম করুন (স্প্যাম)",
    at: "2026-10-06T08:05:00+06:00",
    kind: "moderation",
  },
  {
    id: "act-4",
    actorBn: "মুফতি নুরুল আমিন",
    actionBn: "১৮টি রাউটেড প্রশ্নের উত্তর দিয়েছেন",
    targetBn: "ইবাদত ও ফিকহ বিভাগ",
    at: "2026-10-05T23:10:00+06:00",
    kind: "scholar",
  },
  {
    id: "act-5",
    actorBn: "সিস্টেম",
    actionBn: "স্মার্ট রেফারেন্স সূচক হালনাগাদ করেছে",
    targetBn: "১,২৪০টি নতুন আয়াত-হাদীস ম্যাপিং যুক্ত হয়েছে",
    at: "2026-10-05T22:00:00+06:00",
    kind: "system",
  },
  {
    id: "act-6",
    actorBn: "ড. ফরিদা ইয়াসমিন",
    actionBn: "নতুন ফতোয়া প্রকাশ করেছেন",
    targetBn: "গৃহহীন পিতা-মাতার ভরণপোষণের দায়িত্ব কার?",
    at: "2026-10-05T19:25:00+06:00",
    kind: "publish",
  },
  {
    id: "act-7",
    actorBn: "অ্যাডমিন (মাহবুব আলম)",
    actionBn: "একটি আলোচনা থ্রেড পর্যালোচনায় নিয়েছেন",
    targetBn: "বাংলাদেশের সমাজে যৌতুক ছাড়া বিয়ে করা সত্যিই সম্ভব?",
    at: "2026-10-05T17:50:00+06:00",
    kind: "moderation",
  },
  {
    id: "act-8",
    actorBn: "মুফতি আব্দুর রহমান",
    actionBn: "প্রশ্ন রাউটিং অগ্রাধিকার গ্রহণ করেছেন",
    targetBn: "ফিকহ বিভাগের ১৮টি প্রশ্ন",
    at: "2026-10-05T11:30:00+06:00",
    kind: "scholar",
  },
  {
    id: "act-9",
    actorBn: "নতুন ব্যবহারকারী",
    actionBn: "প্ল্যাটফর্মে যোগ দিয়েছেন",
    targetBn: "চট্টগ্রাম থেকে ৪২ জন নতুন ব্যবহারকারী",
    at: "2026-10-05T09:15:00+06:00",
    kind: "user",
  },
  {
    id: "act-10",
    actorBn: "সিস্টেম",
    actionBn: "নামাজের সময়সূচি হালনাগাদ করেছে",
    targetBn: "৬৪ জেলার সাপ্তাহিক সময়সূচি",
    at: "2026-10-05T03:00:00+06:00",
    kind: "system",
  },
  {
    id: "act-11",
    actorBn: "উস্তাদা সুমাইয়া খানম",
    actionBn: "নতুন প্রবন্ধ জমা দিয়েছেন",
    targetBn: "সোশ্যাল মিডিয়ায় গীবত: অনলাইন সমালোচনার ফিকহি সীমা",
    at: "2026-10-03T16:40:00+06:00",
    kind: "publish",
  },
  {
    id: "act-12",
    actorBn: "অ্যাডমিন (মাহবুব আলম)",
    actionBn: "নতুন বিভাগ অনুমোদন করেছেন",
    targetBn: "প্রযুক্তি ও আধুনিক বিষয়",
    at: "2026-10-02T13:20:00+06:00",
    kind: "system",
  },
];

/* -------------------------------------------------------------------------- */
/* User directory                                                             */
/* -------------------------------------------------------------------------- */

export interface AdminUserRow {
  id: string;
  nameBn: string;
  email: string;
  role: "admin" | "scholar" | "user";
  district: string;
  status: "active" | "suspended" | "pending";
  joinedAt: string;
  contributions: number;
}

export const ADMIN_USERS: AdminUserRow[] = [
  { id: "user-me", nameBn: "আব্দুল্লাহ আল-মামুন", email: "abdullah.almamun@gmail.com", role: "user", district: "dhaka", status: "active", joinedAt: "2025-11-14T10:20:00+06:00", contributions: 34 },
  { id: "scholar-1", nameBn: "মুফতি আব্দুর রহমান", email: "abdur.rahman@ilm.bd", role: "scholar", district: "dhaka", status: "active", joinedAt: "2024-12-01T09:00:00+06:00", contributions: 1284 },
  { id: "scholar-3", nameBn: "মুফতি সাইফুল ইসলাম", email: "saiful.islam@ilm.bd", role: "scholar", district: "chattogram", status: "active", joinedAt: "2025-01-18T10:30:00+06:00", contributions: 946 },
  { id: "scholar-5", nameBn: "ড. ফরিদা ইয়াসমিন", email: "faridah.yasmin@ilm.bd", role: "scholar", district: "dhaka", status: "active", joinedAt: "2024-10-05T11:00:00+06:00", contributions: 1120 },
  { id: "scholar-6", nameBn: "মুফতি নুরুল আমিন", email: "nurul.amin@ilm.bd", role: "scholar", district: "khulna", status: "active", joinedAt: "2024-09-12T08:45:00+06:00", contributions: 1538 },
  { id: "scholar-9", nameBn: "মুফতি আশরাফুল হক", email: "ashraful.haque@ilm.bd", role: "scholar", district: "sylhet", status: "active", joinedAt: "2025-03-22T14:20:00+06:00", contributions: 672 },
  { id: "scholar-12", nameBn: "মুফতি রহিমুল্লাহ", email: "rahimullah@ilm.bd", role: "scholar", district: "rangpur", status: "active", joinedAt: "2025-06-30T16:10:00+06:00", contributions: 418 },
  { id: "admin-1", nameBn: "মাহবুব আলম", email: "mahbub.alam@ilm.bd", role: "admin", district: "dhaka", status: "active", joinedAt: "2024-08-01T09:00:00+06:00", contributions: 286 },
  { id: "admin-2", nameBn: "সাইমা চৌধুরী", email: "saima.chowdhury@ilm.bd", role: "admin", district: "dhaka", status: "active", joinedAt: "2025-02-11T10:15:00+06:00", contributions: 154 },
  { id: "user-1", nameBn: "মোহাম্মদ রফিকুল ইসলাম", email: "rafiqul.islam@example.com", role: "user", district: "dhaka", status: "active", joinedAt: "2025-08-02T09:00:00+06:00", contributions: 86 },
  { id: "user-3", nameBn: "আবু বকর সিদ্দিক", email: "abubakar.siddique@example.com", role: "user", district: "sylhet", status: "active", joinedAt: "2025-06-19T13:45:00+06:00", contributions: 124 },
  { id: "user-5", nameBn: "নূর মোহাম্মদ আকন্দ", email: "nur.mohammad@example.com", role: "user", district: "rangpur", status: "suspended", joinedAt: "2025-04-25T07:20:00+06:00", contributions: 18 },
  { id: "user-8", nameBn: "শাহাদাত হোসেন", email: "shahadat.hossain@example.com", role: "user", district: "cumilla", status: "pending", joinedAt: "2025-10-01T09:40:00+06:00", contributions: 0 },
  { id: "user-10", nameBn: "হাসান মাহমুদ", email: "hasan.mahmud@example.com", role: "user", district: "bogura", status: "active", joinedAt: "2026-03-05T21:50:00+06:00", contributions: 41 },
];
